const BaseRepository = require('./BaseRepository');

class SaleRepository extends BaseRepository {
  constructor(db) {
    super(db, 'sales');
  }

  async findAll() {
    const result = await this.db.query(
      `SELECT s.*, c.name AS customer_name, se.name AS seller_name
       FROM sales s
       JOIN customers c  ON s.customer_id = c.id
       JOIN sellers   se ON s.seller_id   = se.id
       ORDER BY s.created_at DESC`
    );
    return result.rows;
  }

  async findById(id) {
    const saleResult = await this.db.query(
      `SELECT s.*, c.name AS customer_name, se.name AS seller_name
       FROM sales s
       JOIN customers c  ON s.customer_id = c.id
       JOIN sellers   se ON s.seller_id   = se.id
       WHERE s.id = $1`,
      [id]
    );
    if (!saleResult.rows[0]) return null;

    const itemsResult = await this.db.query(
      `SELECT si.*, p.name AS product_name, p.brand, p.category
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = $1`,
      [id]
    );

    return { ...saleResult.rows[0], items: itemsResult.rows };
  }

  async createWithItems(client, { customer_id, seller_id, notes, items }) {
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );

    const saleResult = await client.query(
      `INSERT INTO sales (customer_id, seller_id, status, total_amount, notes)
       VALUES ($1, $2, 'confirmed', $3, $4)
       RETURNING *`,
      [customer_id, seller_id, totalAmount, notes]
    );
    const sale = saleResult.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [sale.id, item.product_id, item.quantity, item.unit_price]
      );
    }

    return sale;
  }

  async cancel(id) {
    const result = await this.db.query(
      `UPDATE sales SET status = 'cancelled'
       WHERE id = $1 AND status = 'confirmed'
       RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await this.db.query(
      'DELETE FROM sales WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount > 0;
  }
}

module.exports = SaleRepository;
