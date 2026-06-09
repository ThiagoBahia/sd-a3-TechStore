const BaseRepository = require('./BaseRepository');

class ProductRepository extends BaseRepository {
  constructor(db) {
    super(db, 'products');
  }

  async create({ name, description, price, stockQuantity, category, brand, lowStockThreshold }) {
    const result = await this.db.query(
      `INSERT INTO products (name, description, price, stock_quantity, category, brand, low_stock_threshold)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description || null, price, stockQuantity || 0, category || null, brand || null, lowStockThreshold || 5]
    );
    return result.rows[0];
  }

  async update(id, { name, description, price, stockQuantity, category, brand, lowStockThreshold }) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined)              { fields.push(`name = $${idx++}`);                values.push(name); }
    if (description !== undefined)       { fields.push(`description = $${idx++}`);         values.push(description); }
    if (price !== undefined)             { fields.push(`price = $${idx++}`);               values.push(price); }
    if (stockQuantity !== undefined)     { fields.push(`stock_quantity = $${idx++}`);      values.push(stockQuantity); }
    if (category !== undefined)          { fields.push(`category = $${idx++}`);            values.push(category); }
    if (brand !== undefined)             { fields.push(`brand = $${idx++}`);               values.push(brand); }
    if (lowStockThreshold !== undefined) { fields.push(`low_stock_threshold = $${idx++}`); values.push(lowStockThreshold); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await this.db.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  // Subtrai estoque dentro de uma transacao; retorna null se nao houver estoque suficiente
  async decreaseStock(client, productId, quantity) {
    const result = await client.query(
      `UPDATE products
       SET stock_quantity = stock_quantity - $1
       WHERE id = $2 AND stock_quantity >= $1
       RETURNING *`,
      [quantity, productId]
    );
    return result.rows[0] || null;
  }

  // Restaura estoque dentro de uma transacao (cancelamento de venda)
  async increaseStock(client, productId, quantity) {
    const result = await client.query(
      `UPDATE products
       SET stock_quantity = stock_quantity + $1
       WHERE id = $2
       RETURNING *`,
      [quantity, productId]
    );
    return result.rows[0] || null;
  }

  async findLowStock() {
    const result = await this.db.query(
      `SELECT * FROM products
       WHERE stock_quantity <= low_stock_threshold
       ORDER BY stock_quantity ASC`
    );
    return result.rows;
  }
}

module.exports = ProductRepository;
