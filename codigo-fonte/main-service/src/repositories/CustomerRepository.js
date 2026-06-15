const BaseRepository = require('./BaseRepository');

class CustomerRepository extends BaseRepository {
  constructor(db) {
    super(db, 'customers');
  }

  async findAll() {
    return super.findAll('name');
  }

  async create({ name, email, phone, address }) {
    const result = await this.db.query(
      `INSERT INTO customers (name, email, phone, address)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, phone, address]
    );
    return result.rows[0];
  }

  async update(id, { name, email, phone, address }) {
    const result = await this.db.query(
      `UPDATE customers
       SET name = $1, email = $2, phone = $3, address = $4
       WHERE id = $5
       RETURNING *`,
      [name, email, phone, address, id]
    );
    return result.rows[0] || null;
  }
}

module.exports = CustomerRepository;
