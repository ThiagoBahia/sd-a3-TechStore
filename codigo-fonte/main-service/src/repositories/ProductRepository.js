class ProductRepository {
  constructor(db) {
    this.db = db;
  }

  async findAll() {
    const result = await this.db.query(
      'SELECT * FROM products ORDER BY name ASC'
    );
    return result.rows;
  }

  async findById(id) {
    const result = await this.db.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create({ name, description, price, stock_quantity, category, brand, low_stock_threshold }) {
    const result = await this.db.query(
      `INSERT INTO products (name, description, price, stock_quantity, category, brand, low_stock_threshold)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, price, stock_quantity ?? 0, category, brand, low_stock_threshold ?? 5]
    );
    return result.rows[0];
  }

  async update(id, { name, description, price, stock_quantity, category, brand, low_stock_threshold }) {
    const result = await this.db.query(
      `UPDATE products
       SET name = $1, description = $2, price = $3, stock_quantity = $4,
           category = $5, brand = $6, low_stock_threshold = $7
       WHERE id = $8
       RETURNING *`,
      [name, description, price, stock_quantity, category, brand, low_stock_threshold, id]
    );
    return result.rows[0] || null;
  }

  async decrementStock(client, productId, quantity) {
    const result = await client.query(
      `UPDATE products
       SET stock_quantity = stock_quantity - $1
       WHERE id = $2 AND stock_quantity >= $1
       RETURNING id, stock_quantity`,
      [quantity, productId]
    );
    return result.rowCount > 0;
  }

  async delete(id) {
    const result = await this.db.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount > 0;
  }
}

module.exports = ProductRepository;
