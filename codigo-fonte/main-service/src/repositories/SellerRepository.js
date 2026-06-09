const BaseRepository = require('./BaseRepository');

class SellerRepository extends BaseRepository {
  constructor(db) {
    super(db, 'sellers');
  }

  async create({ name, email, phone, commissionRate }) {
    const result = await this.db.query(
      `INSERT INTO sellers (name, email, phone, commission_rate)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, phone || null, commissionRate || 5.00]
    );
    return result.rows[0];
  }

  async update(id, { name, email, phone, commissionRate }) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined)           { fields.push(`name = $${idx++}`);            values.push(name); }
    if (email !== undefined)          { fields.push(`email = $${idx++}`);           values.push(email); }
    if (phone !== undefined)          { fields.push(`phone = $${idx++}`);           values.push(phone); }
    if (commissionRate !== undefined) { fields.push(`commission_rate = $${idx++}`); values.push(commissionRate); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await this.db.query(
      `UPDATE sellers SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async findByEmail(email) {
    const result = await this.db.query(
      'SELECT * FROM sellers WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }
}

module.exports = SellerRepository;
