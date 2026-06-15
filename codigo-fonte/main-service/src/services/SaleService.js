const db = require('../config/database');
const SaleRepository = require('../repositories/SaleRepository');
const ProductRepository = require('../repositories/ProductRepository');
const SaleFactory = require('../patterns/SaleFactory');

const saleRepo = new SaleRepository(db);
const productRepo = new ProductRepository(db);

class SaleService {
  async listAll() {
    return saleRepo.findAll();
  }

  async getById(id) {
    const sale = await saleRepo.findById(id);
    if (!sale) throw Object.assign(new Error('Venda nao encontrada'), { statusCode: 404 });
    return sale;
  }

  async create(body) {
    // Factory valida e estrutura os dados antes de qualquer operacao no banco
    const { customer_id, seller_id, notes, items } = SaleFactory.create(body);

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      for (const item of items) {
        const ok = await productRepo.decrementStock(client, item.product_id, item.quantity);
        if (!ok) {
          throw Object.assign(
            new Error(`Estoque insuficiente para o produto ${item.product_id}`),
            { statusCode: 422 }
          );
        }
      }

      const sale = await saleRepo.createWithItems(client, { customer_id, seller_id, notes, items });
      await client.query('COMMIT');
      return sale;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async cancel(id) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const saleResult = await client.query(
        `UPDATE sales SET status = 'cancelled'
         WHERE id = $1 AND status = 'confirmed'
         RETURNING *`,
        [id]
      );
      const sale = saleResult.rows[0];
      if (!sale) {
        throw Object.assign(
          new Error('Venda nao encontrada ou ja cancelada'),
          { statusCode: 404 }
        );
      }

      const itemsResult = await client.query(
        'SELECT product_id, quantity FROM sale_items WHERE sale_id = $1',
        [id]
      );
      for (const item of itemsResult.rows) {
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      await client.query('COMMIT');
      return sale;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async delete(id) {
    const deleted = await saleRepo.delete(id);
    if (!deleted) throw Object.assign(new Error('Venda nao encontrada'), { statusCode: 404 });
  }
}

module.exports = new SaleService();
