const pool = require('../config/config');

// Only the columns we actually need — no SELECT *
const COLUMNS = 'id, name, sku, quantity, price, category, created_at, updated_at';

const createProduct = async ({ name, sku, quantity, price, category }) => {
  const query = `
    INSERT INTO products (name, sku, quantity, price, category, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING ${COLUMNS}
  `;
  const values = [name, sku, quantity, price, category || null];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllProducts = async () => {
  const query = `SELECT ${COLUMNS} FROM products ORDER BY id ASC`;
  const result = await pool.query(query);
  return result.rows;
};
const getProductById = async (id) => {
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows[0]; // agar nahi mila to undefined return hoga
};
const updateProduct = async (id, fields) => {
  const allowed = ['name', 'sku', 'quantity', 'price', 'category'];
  const setClauses = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = $${idx}`);
      values.push(fields[key]);
      idx++;
    }
  }

  if (setClauses.length === 0) return null;

  setClauses.push('updated_at = NOW()');
  values.push(id);

  const query = `
    UPDATE products
    SET ${setClauses.join(', ')}
    WHERE id = $${idx}
    RETURNING ${COLUMNS}
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteProduct = async (id) => {
  const query = `DELETE FROM products WHERE id = $1 RETURNING ${COLUMNS}`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct };