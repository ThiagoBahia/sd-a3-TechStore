class ReportRepository {
  constructor(db) {
    this.db = db;
  }

  async getTopProducts(limit = 10) {
    const result = await this.db.query(
      `SELECT
         p.id,
         p.name,
         p.brand,
         p.category,
         p.price,
         SUM(si.quantity)                  AS total_sold,
         SUM(si.quantity * si.unit_price)  AS total_revenue
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       JOIN sales    s ON si.sale_id    = s.id
       WHERE s.status = 'confirmed'
       GROUP BY p.id, p.name, p.brand, p.category, p.price
       ORDER BY total_sold DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  async getProductsByCustomer(customerId) {
    const result = await this.db.query(
      `SELECT
         c.id    AS customer_id,
         c.name  AS customer_name,
         p.id    AS product_id,
         p.name  AS product_name,
         p.brand,
         p.category,
         SUM(si.quantity)                 AS total_purchased,
         SUM(si.quantity * si.unit_price) AS total_spent,
         COUNT(DISTINCT s.id)             AS purchase_count
       FROM sale_items si
       JOIN products  p ON si.product_id = p.id
       JOIN sales     s ON si.sale_id    = s.id
       JOIN customers c ON s.customer_id = c.id
       WHERE s.status = 'confirmed' AND c.id = $1
       GROUP BY c.id, c.name, p.id, p.name, p.brand, p.category
       ORDER BY total_purchased DESC`,
      [customerId]
    );
    return result.rows;
  }

  async getCustomerAvgConsumption() {
    const result = await this.db.query(
      `SELECT
         c.id    AS customer_id,
         c.name  AS customer_name,
         c.email AS customer_email,
         COALESCE(s_agg.total_purchases,     0) AS total_purchases,
         COALESCE(s_agg.total_spent,         0) AS total_spent,
         COALESCE(s_agg.avg_per_purchase,    0) AS avg_per_purchase,
         COALESCE(si_agg.total_items_bought, 0) AS total_items_bought,
         COALESCE(si_agg.avg_items_per_sale, 0) AS avg_items_per_sale
       FROM customers c
       LEFT JOIN (
         SELECT customer_id,
                COUNT(*)          AS total_purchases,
                SUM(total_amount) AS total_spent,
                AVG(total_amount) AS avg_per_purchase
         FROM sales
         WHERE status = 'confirmed'
         GROUP BY customer_id
       ) s_agg ON c.id = s_agg.customer_id
       LEFT JOIN (
         SELECT s.customer_id,
                SUM(si.quantity) AS total_items_bought,
                AVG(si.quantity) AS avg_items_per_sale
         FROM sale_items si
         JOIN sales s ON si.sale_id = s.id
         WHERE s.status = 'confirmed'
         GROUP BY s.customer_id
       ) si_agg ON c.id = si_agg.customer_id
       ORDER BY total_spent DESC`
    );
    return result.rows;
  }

  async getLowStockProducts() {
    const result = await this.db.query(
      `SELECT
         id,
         name,
         brand,
         category,
         price,
         stock_quantity,
         low_stock_threshold,
         (low_stock_threshold - stock_quantity) AS units_needed
       FROM products
       WHERE stock_quantity <= low_stock_threshold
       ORDER BY stock_quantity ASC`
    );
    return result.rows;
  }
}

module.exports = ReportRepository;
