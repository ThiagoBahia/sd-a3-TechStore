/**
 * Padrao Repository — abstrai o acesso ao banco de dados.
 * Cada entidade estende esta classe e herda as operacoes basicas de CRUD.
 */
class BaseRepository {
  constructor(db, tableName) {
    this.db = db;
    this.tableName = tableName;
  }

  async findAll(orderBy = 'id') {
    const result = await this.db.query(
      `SELECT * FROM ${this.tableName} ORDER BY ${orderBy}`
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
      `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }

  async count() {
    const result = await this.db.query(
      `SELECT COUNT(*) AS total FROM ${this.tableName}`
    );
    return parseInt(result.rows[0].total);
  }
}

module.exports = BaseRepository;
