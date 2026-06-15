/**
 * Padrao Repository — classe base abstrata que centraliza as operacoes
 * comuns de acesso ao banco. Cada repositorio concreto estende esta classe
 * e herda findAll, findById e delete, sobrescrevendo apenas o necessario.
 */
class BaseRepository {
  constructor(db, tableName) {
    this.db = db;
    this.tableName = tableName;
  }

  async findAll(orderBy = 'id') {
    const allowed = ['id', 'name', 'email', 'created_at', 'updated_at', 'price', 'stock_quantity'];
    const safeOrder = allowed.includes(orderBy) ? orderBy : 'id';
    const result = await this.db.query(
      `SELECT * FROM ${this.tableName} ORDER BY ${safeOrder}`
    );
    return result.rows;
  }

  async findById(id) {
    const result = await this.db.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await this.db.query(
      `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rowCount > 0;
  }
}

module.exports = BaseRepository;
