import { query } from '../config/database.js';

export async function createCategory(userId, categoryData) {
  const {
    name,
    type,
    icon = '🎯',
    color = '#667eea'
  } = categoryData;

  const result = await query(
    `INSERT INTO money_categories (user_id, name, type, icon, color, is_default)
     VALUES (?, ?, ?, ?, ?, FALSE)`,
    [userId, name, type, icon, color]
  );

  return result.insertId;
}

export async function getCategoriesByUser(userId, type = null) {
  let sql = `SELECT * FROM money_categories
             WHERE (user_id = ? OR is_default = TRUE)`;
  let params = [userId];

  if (type) {
    sql += ` AND type = ?`;
    params.push(type);
  }

  sql += ` ORDER BY is_default DESC, created_at DESC`;

  return await query(sql, params);
}

export async function getCategoryById(categoryId) {
  const categories = await query(
    `SELECT * FROM money_categories WHERE id = ?`,
    [categoryId]
  );

  return categories[0] || null;
}

export async function updateCategory(categoryId, userId, updates) {
  const allowedFields = ['name', 'icon', 'color'];
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    return false;
  }

  values.push(categoryId, userId);

  // Only allow users to update their own custom categories
  await query(
    `UPDATE money_categories SET ${fields.join(', ')}
     WHERE id = ? AND user_id = ? AND is_default = FALSE`,
    values
  );

  return true;
}

export async function deleteCategory(categoryId, userId) {
  // Only allow users to delete their own custom categories
  await query(
    `DELETE FROM money_categories
     WHERE id = ? AND user_id = ? AND is_default = FALSE`,
    [categoryId, userId]
  );

  return true;
}

export async function getCategoryStats(userId, startDate, endDate, type = null) {
  let sql = `
    SELECT
      mc.id as category_id,
      mc.name as category_name,
      mc.icon,
      mc.color,
      mc.type,
      COUNT(t.id) as count,
      COALESCE(SUM(t.amount), 0) as total
    FROM money_categories mc
    LEFT JOIN transactions t ON mc.id = t.category_id
      AND t.user_id = ?
      AND t.deleted_at IS NULL
      AND t.transaction_date BETWEEN ? AND ?
    WHERE (mc.user_id = ? OR mc.is_default = TRUE)
  `;

  let params = [userId, startDate, endDate, userId];

  if (type) {
    sql += ` AND mc.type = ?`;
    params.push(type);
  }

  sql += ` GROUP BY mc.id, mc.name, mc.icon, mc.color, mc.type
           HAVING count > 0
           ORDER BY total DESC`;

  return await query(sql, params);
}
