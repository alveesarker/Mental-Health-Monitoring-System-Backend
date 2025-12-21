const QuestionModel = require('../models/questionModel');

class QuestionController {
    /**
     * Get questions for a patient
     */
    static async getPatientQuestions(req, res) {
        try {
            const { patientID } = req.params;
            
            if (!patientID || isNaN(parseInt(patientID))) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid patient ID is required'
                });
            }

            const questions = await QuestionModel.getQuestionsForPatient(parseInt(patientID));
            
            res.json({
                success: true,
                data: questions
            });
        } catch (error) {
            console.error('Error in getPatientQuestions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch questions',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Save patient answers
     */
    static async saveAnswers(req, res) {
        try {
            const { patientID } = req.params;
            const { analysisID, answers } = req.body;
            console.log(analysisID, answers);

            // Validate input
            if (!patientID || !analysisID || !Array.isArray(answers) || answers.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'patientID, analysisID, and answers array are required'
                });
            }

            // Validate each answer
            for (const answer of answers) {
                if (!answer.questionID || answer.answer === undefined) {
                    return res.status(400).json({
                        success: false,
                        message: 'Each answer must have questionID and answer fields'
                    });
                }
            }

            const result = await QuestionModel.savePatientAnswers(
                parseInt(patientID),
                parseInt(analysisID),
                answers
            );

            res.json({
                success: true,
                message: result.message,
                data: {
                    patientID,
                    analysisID,
                    answersCount: answers.length
                }
            });
        } catch (error) {
            console.error('Error in saveAnswers:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to save answers',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Get all questions (for testing/admin purposes)
     */
    static async getAllQuestions(req, res) {
        try {
            const questions = await QuestionModel.getAllQuestionsWithRules();
            
            res.json({
                success: true,
                data: {
                    total: questions.length,
                    questions
                }
            });
        } catch (error) {
            console.error('Error in getAllQuestions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch all questions',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Test patient data retrieval
     */
    static async getPatientData(req, res) {
        try {
            const { patientID } = req.params;
            
            if (!patientID || isNaN(parseInt(patientID))) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid patient ID is required'
                });
            }

            const patientData = await QuestionModel.getPatientData(parseInt(patientID));
            
            res.json({
                success: true,
                data: patientData
            });
        } catch (error) {
            console.error('Error in getPatientData:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch patient data',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = QuestionController;