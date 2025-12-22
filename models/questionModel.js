const pool = require('../db');

class QuestionModel {
    /**
     * Get patient's recent data for rule evaluation
     */
    static async getPatientData(patientID, dataWindowDays = 7) {
        try {
            // Get patient's daily logs within the data window
            const [logs] = await pool.query(`
                SELECT 
                    d.mood,
                    d.stressLevel,
                    d.sleepDuration,
                    DATE(d.timestamp) as logDate
                FROM dailylog d
                WHERE d.patientID = ?
                AND d.timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
                ORDER BY d.timestamp DESC
                LIMIT 30
            `, [patientID, dataWindowDays]);

            // Get patient's latest progress data
            const [progressData] = await pool.query(`
                SELECT 
                    p.stressLevel,
                    p.depressionLevel,
                    p.energyLevel,
                    p.fatigueLevel,
                    s.sessionDate
                FROM progress p
                JOIN session s ON p.sessionID = s.sessionID
                WHERE s.patientID = ?
                ORDER BY s.sessionDate DESC
                LIMIT 1
            `, [patientID]);

            // Get patient's crisis alert status
            const [crisisData] = await pool.query(`
                SELECT 
                    alertType,
                    status,
                    timestamp
                FROM crisisalert
                WHERE patientID = ?
                AND status != 'Resolved'
                AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            `, [patientID]);

            // Calculate averages from daily logs
            let averageStress = 0;
            let averageMood = 0;
            let averageSleep = 0;
            let depressionLevel = 0;
            let energyLevel = 0;

            if (logs.length > 0) {
                const moodMap = { 'Great': 9, 'Good': 7, 'Okay': 5, 'Low': 3, 'Difficult': 1 };
                
                averageStress = logs.reduce((sum, log) => sum + parseInt(log.stressLevel), 0) / logs.length;
                averageMood = logs.reduce((sum, log) => sum + (moodMap[log.mood] || 5), 0) / logs.length;
                averageSleep = logs.reduce((sum, log) => sum + (log.sleepDuration || 0), 0) / logs.length;
            }

            if (progressData.length > 0) {
                depressionLevel = progressData[0].depressionLevel || 0;
                energyLevel = progressData[0].energyLevel || 0;
            }

            // Determine if patient has enough data
            const hasEnoughData = logs.length >= 3;

            return {
                patientID,
                hasEnoughData,
                metrics: {
                    averageStress: Math.round(averageStress),
                    averageMood: Math.round(averageMood),
                    averageSleep: Math.round(averageSleep),
                    depressionLevel,
                    energyLevel
                },
                recentLogs: logs,
                latestProgress: progressData[0] || null,
                activeCrisis: crisisData.length > 0,
                crisisAlerts: crisisData
            };
        } catch (error) {
            console.error('Error getting patient data:', error);
            throw error;
        }
    }

    /**
     * Get all questions with their rules
     */
    static async getAllQuestionsWithRules() {
        try {
            const [questions] = await pool.query(`
                SELECT 
                    q.questionID,
                    q.questionText,
                    q.type,
                    GROUP_CONCAT(
                        CONCAT(qr.category, ':', qr.value) 
                        SEPARATOR '|'
                    ) as rules
                FROM question q
                LEFT JOIN questionrule qr ON q.questionID = qr.questionID
                GROUP BY q.questionID, q.questionText, q.type
                ORDER BY q.questionID
            `);

            // Parse rules into structured format
            return questions.map(q => ({
                questionID: q.questionID,
                questionText: q.questionText,
                type: q.type,
                rules: q.rules ? q.rules.split('|').map(rule => {
                    const [category, value] = rule.split(':');
                    return { category, value };
                }) : []
            }));
        } catch (error) {
            console.error('Error getting questions with rules:', error);
            throw error;
        }
    }

    /**
     * Get random questions (fallback when not enough data)
     */
    static async getRandomQuestions(limit = 6) {
        try {
            const [questions] = await pool.query(`
                SELECT 
                    q.questionID,
                    q.questionText,
                    q.type
                FROM question q
                WHERE q.questionID NOT IN (7) -- Exclude test question with ID 7
                ORDER BY RAND()
                LIMIT ?
            `, [limit]);

            return questions;
        } catch (error) {
            console.error('Error getting random questions:', error);
            throw error;
        }
    }

    /**
     * Check if question should be triggered based on patient data and rules
     */
    static evaluateQuestionRules(patientData, questionRules) {
        if (!questionRules || questionRules.length === 0) {
            return false; // No rules means always show
        }

        let shouldShow = true;

        for (const rule of questionRules) {
            const { category, value } = rule;
            let patientValue;
            let ruleValue;

            // Map rule categories to patient data
            switch (category) {
                case 'frequency':
                    // Check if patient has recent data for frequency-based questions
                    const hasRecentData = patientData.recentLogs.length > 0;
                    if (value === 'daily' && !hasRecentData) {
                        shouldShow = false;
                    }
                    break;

                case 'trigger':
                    if (value === 'risk_high' && !patientData.activeCrisis) {
                        shouldShow = false;
                    } else if (value === 'mood_low' && patientData.metrics.averageMood > 4) {
                        shouldShow = false;
                    }
                    break;

                case 'medication':
                    // You might need to add medication tracking logic
                    // For now, assume patient with depression level > 5 might be on medication
                    if (value === 'prescribed' && patientData.metrics.depressionLevel < 5) {
                        shouldShow = false;
                    }
                    break;

                case 'mood':
                    ruleValue = parseInt(value);
                    patientValue = patientData.metrics.averageMood;
                    if (patientValue > ruleValue) {
                        shouldShow = false;
                    }
                    break;

                case 'stress':
                    ruleValue = parseInt(value);
                    patientValue = patientData.metrics.averageStress;
                    if (patientValue < ruleValue) {
                        shouldShow = false;
                    }
                    break;

                case 'sleep_duration':
                    ruleValue = parseInt(value);
                    patientValue = patientData.metrics.averageSleep;
                    if (patientValue > ruleValue) {
                        shouldShow = false;
                    }
                    break;
            }

            if (!shouldShow) break;
        }

        return shouldShow;
    }

    /**
     * Get questions for patient based on their data
     */
    static async getQuestionsForPatient(patientID) {
        try {
            // Get patient data
            const patientData = await this.getPatientData(patientID);
            
            // Get all questions with rules
            const allQuestions = await this.getAllQuestionsWithRules();

            // If patient doesn't have enough data, return random questions
            if (!patientData.hasEnoughData) {
                return await this.getRandomQuestions(6);
            }

            // Filter questions based on patient data and rules
            const filteredQuestions = [];
            const seenQuestionIDs = new Set();

            for (const question of allQuestions) {
                if (filteredQuestions.length >= 6) break;

                const shouldShow = this.evaluateQuestionRules(patientData, question.rules);
                
                if (shouldShow && !seenQuestionIDs.has(question.questionID)) {
                    filteredQuestions.push({
                        questionID: question.questionID,
                        questionText: question.questionText,
                        type: question.type,
                        triggeredBy: question.rules.length > 0 ? 'rules' : 'default'
                    });
                    seenQuestionIDs.add(question.questionID);
                }
            }

            // If we don't have 6 filtered questions, add random ones
            if (filteredQuestions.length < 6) {
                const needed = 6 - filteredQuestions.length;
                const randomQuestions = await this.getRandomQuestions(needed + 5); // Get extras
                
                for (const q of randomQuestions) {
                    if (filteredQuestions.length >= 6) break;
                    if (!seenQuestionIDs.has(q.questionID)) {
                        filteredQuestions.push({
                            questionID: q.questionID,
                            questionText: q.questionText,
                            type: q.type,
                            triggeredBy: 'random'
                        });
                        seenQuestionIDs.add(q.questionID);
                    }
                }
            }

            return {
                patientID,
                hasEnoughData: patientData.hasEnoughData,
                metrics: patientData.metrics,
                totalQuestions: filteredQuestions.length,
                questions: filteredQuestions
            };
        } catch (error) {
            console.error('Error getting questions for patient:', error);
            throw error;
        }
    }

    /**
     * Save patient's answers
     */
    static async savePatientAnswers(patientID, analysisID=100, answers) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            for (const answer of answers) {
                await connection.query(`
                    INSERT INTO answer (questionID, analysisID, patientID, answer, timestamp)
                    VALUES (?, ?, ?, ?, NOW())
                    ON DUPLICATE KEY UPDATE
                    answer = VALUES(answer),
                    timestamp = NOW()
                `, [answer.questionID, analysisID, patientID, answer.answer]);
            }

            await connection.commit();
            return { success: true, message: 'Answers saved successfully' };
        } catch (error) {
            await connection.rollback();
            console.error('Error saving answers:', error);
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = QuestionModel;