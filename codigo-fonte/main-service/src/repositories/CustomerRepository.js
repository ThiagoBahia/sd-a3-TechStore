class CustomerRepository {
  constructor(db) {
    this.db = db;
  }

  async findAll() {
    const result = await this.db.query(
      'SELECT * FROM customers ORDER BY name ASC'
    );
    return result.rows;
  }

  async findById(id) {
    const result = await this.db.query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
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

  async delete(id) {
    const result = await this.db.query(
      'DELETE FROM customers WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount > 0;
  }
}

module.exports = CustomerRepository;
