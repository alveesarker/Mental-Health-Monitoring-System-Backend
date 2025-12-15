const db = require("../db");

exports.getAll = async () => {
  const [rows] = await db.query(`
    SELECT 
      r.recommendationID,
      r.type,
      r.title,
      r.description,
      r.priority,
      r.dataWindowDays,
      r.validForDays,
      GROUP_CONCAT(rr.category) AS categories,
      GROUP_CONCAT(rr.\`value\`) AS \`values\`
    FROM recommendation r
    LEFT JOIN recommendationrule rr 
      ON r.recommendationID = rr.recommendationID
    GROUP BY r.recommendationID
  `);
  return rows;
};

exports.create = async (data) => {
  const { type, title, description, priority, dataWindowDays, validForDays, rules } = data;

  const [result] = await db.query(
    `INSERT INTO recommendation (type, title, description, priority, dataWindowDays, validForDays)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [type, title, description, priority, dataWindowDays, validForDays]
  );

  const recommendationID = result.insertId;

  if (rules && rules.length > 0) {
    for (const rule of rules) {
      await db.query(
        `INSERT INTO recommendationrule (recommendationID, category, value)
         VALUES (?, ?, ?)`,
        [recommendationID, rule.category, rule.value]
      );
    }
  }

  return recommendationID;
};

exports.update = async (id, data) => {
  const { type, title, description, priority, dataWindowDays, validForDays, rules } = data;

  await db.query(
    `UPDATE recommendation 
     SET type=?, title=?, description=?, priority=?, dataWindowDays=?, validForDays=?
     WHERE recommendationID=?`,
    [type, title, description, priority, dataWindowDays, validForDays, id]
  );

  await db.query(`DELETE FROM recommendationrule WHERE recommendationID=?`, [id]);

  if (rules && rules.length > 0) {
    for (const rule of rules) {
      await db.query(
        `INSERT INTO recommendationrule (recommendationID, category, value)
         VALUES (?, ?, ?)`,
        [id, rule.category, rule.value]
      );
    }
  }

  return true;
};

exports.delete = async (id) => {
  await db.query(`DELETE FROM recommendationrule WHERE recommendationID=?`, [id]);
  await db.query(`DELETE FROM recommendation WHERE recommendationID=?`, [id]);
  return true;
};
