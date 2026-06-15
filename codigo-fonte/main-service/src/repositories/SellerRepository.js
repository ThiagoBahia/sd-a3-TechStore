const BaseRepository = require('./BaseRepository');

class SellerRepository extends BaseRepository {
  constructor(db) {
    super(db, 'sellers');
  }

  async findAll() {
    return super.findAll('name');
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
}

module.exports = SellerRepository;
