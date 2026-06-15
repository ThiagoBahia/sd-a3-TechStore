const express = require('express');
const router = express.Router();
const reportController = require('../controllers/ReportController');

// GET /api/reports/top-products?limit=10
router.get('/top-products', reportController.getTopProducts.bind(reportController));

// GET /api/reports/products-by-customer/:customerId
router.get('/products-by-customer/:customerId', reportController.getProductsByCustomer.bind(reportController));

// GET /api/reports/customer-avg-consumption
router.get('/customer-avg-consumption', reportController.getCustomerAvgConsumption.bind(reportController));

// GET /api/reports/low-stock
router.get('/low-stock', reportController.getLowStock.bind(reportController));

module.exports = router;
