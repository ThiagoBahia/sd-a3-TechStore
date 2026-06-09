class SellerRepository {
  constructor(db) {
    this.db = db;
  }

  async findAll() {
    const result = await this.db.query(
      'SELECT * FROM sellers ORDER BY name ASC'
    );
    return result.rows;
  }

  async findById(id) {
    const result = await this.db.query(
      'SELECT * FROM sellers WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create({ name, email, phone, commission_rate }) {
    const result = await this.db.query(
      `INSERT INTO sellers (name, email, phone, commission_rate)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, phone, commission_rate ?? 5.00]
    );
    return result.rows[0];
  }

  async update(id, { name, email, phone, commission_rate }) {
    const result = await this.db.query(
      `UPDATE sellers
       SET name = $1, email = $2, phone = $3, commission_rate = $4
       WHERE id = $5
       RETURNING *`,
      [name, email, phone, commission_rate, id]
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await this.db.query(
      'DELETE FROM sellers WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount > 0;
  }
}

module.exports = SellerRepository;
