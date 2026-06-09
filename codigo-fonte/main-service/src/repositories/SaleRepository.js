const BaseRepository = require('./BaseRepository');

class SaleRepository extends BaseRepository {
  constructor(db) {
    super(db, 'sales');
  }

  async findAll() {
    const result = await this.db.query(
      `SELECT s.*,
              c.name  AS customer_name,  c.email AS customer_email,
              se.name AS seller_name,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id',         si.id,
                    'product_id', si.product_id,
                    'product_name', p.name,
                    'quantity',   si.quantity,
                    'unit_price', si.unit_price,
                    'subtotal',   si.quantity * si.unit_price
                  )
                ) FILTER (WHERE si.id IS NOT NULL),
                '[]'
              ) AS items
       FROM sales s
       JOIN customers c  ON s.customer_id = c.id
       JOIN sellers   se ON s.seller_id   = se.id
       LEFT JOIN sale_items si ON s.id = si.sale_id
       LEFT JOIN products   p  ON si.product_id = p.id
       GROUP BY s.id, c.name, c.email, se.name
       ORDER BY s.created_at DESC`
    );
    return result.rows;
  }

  async findById(id) {
    const result = await this.db.query(
      `SELECT s.*,
              c.name  AS customer_name,  c.email AS customer_email,
              se.name AS seller_name,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id',           si.id,
                    'product_id',   si.product_id,
                    'product_name', p.name,
                    'quantity',     si.quantity,
                    'unit_price',   si.unit_price,
                    'subtotal',     si.quantity * si.unit_price
                  )
                ) FILTER (WHERE si.id IS NOT NULL),
                '[]'
              ) AS items
       FROM sales s
       JOIN customers c  ON s.customer_id = c.id
       JOIN sellers   se ON s.seller_id   = se.id
       LEFT JOIN sale_items si ON s.id = si.sale_id
       LEFT JOIN products   p  ON si.product_id = p.id
       WHERE s.id = $1
       GROUP BY s.id, c.name, c.email, se.name`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(client, { customerId, sellerId, notes }) {
    const result = await client.query(
      `INSERT INTO sales (customer_id, seller_id, status, notes)
       VALUES ($1, $2, 'confirmed', $3)
       RETURNING *`,
      [customerId, sellerId, notes]
    );
    return result.rows[0];
  }

  async addItem(client, { saleId, productId, quantity, unitPrice }) {
    const result = await client.query(
      `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [saleId, productId, quantity, unitPrice]
    );
    return result.rows[0];
  }

  async updateTotal(client, saleId, totalAmount) {
    const result = await client.query(
      `UPDATE sales SET total_amount = $1 WHERE id = $2 RETURNING *`,
      [totalAmount, saleId]
    );
    return result.rows[0];
  }

  async cancelWithClient(client, id) {
    const result = await client.query(
      `UPDATE sales SET status = 'cancelled'
       WHERE id = $1 AND status = 'confirmed'
       RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }

  async getSaleItems(saleId) {
    const result = await this.db.query(
      `SELECT si.*, p.name AS product_name
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = $1`,
      [saleId]
    );
    return result.rows;
  }
}

module.exports = SaleRepository;
