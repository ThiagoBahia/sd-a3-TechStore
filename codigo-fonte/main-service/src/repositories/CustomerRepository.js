const BaseRepository = require('./BaseRepository');

class CustomerRepository extends BaseRepository {
  constructor(db) {
    super(db, 'customers');
  }

  async create({ name, email, phone, address }) {
    const result = await this.db.query(
      `INSERT INTO customers (name, email, phone, address)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, phone || null, address || null]
    );
    return result.rows[0];
  }

  async update(id, { name, email, phone, address }) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined)    { fields.push(`name = $${idx++}`);    values.push(name); }
    if (email !== undefined)   { fields.push(`email = $${idx++}`);   values.push(email); }
    if (phone !== undefined)   { fields.push(`phone = $${idx++}`);   values.push(phone); }
    if (address !== undefined) { fields.push(`address = $${idx++}`); values.push(address); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await this.db.query(
      `UPDATE customers SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async findByEmail(email) {
    const result = await this.db.query(
      'SELECT * FROM customers WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }
}

module.exports = CustomerRepository;
