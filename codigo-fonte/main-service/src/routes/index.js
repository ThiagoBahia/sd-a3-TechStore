const express = require('express');
const router = express.Router();

const customerController = require('../controllers/CustomerController');
const sellerController   = require('../controllers/SellerController');
const productController  = require('../controllers/ProductController');
const saleController     = require('../controllers/SaleController');

// ---- Clientes ----
router.get   ('/customers',     customerController.getAll.bind(customerController));
router.get   ('/customers/:id', customerController.getById.bind(customerController));
router.post  ('/customers',     customerController.create.bind(customerController));
router.put   ('/customers/:id', customerController.update.bind(customerController));
router.delete('/customers/:id', customerController.delete.bind(customerController));

// ---- Vendedores ----
router.get   ('/sellers',     sellerController.getAll.bind(sellerController));
router.get   ('/sellers/:id', sellerController.getById.bind(sellerController));
router.post  ('/sellers',     sellerController.create.bind(sellerController));
router.put   ('/sellers/:id', sellerController.update.bind(sellerController));
router.delete('/sellers/:id', sellerController.delete.bind(sellerController));

// ---- Produtos / Estoque ----
// Rota especifica antes da rota parametrizada para evitar conflito
router.get   ('/products/low-stock', productController.getLowStock.bind(productController));
router.get   ('/products',           productController.getAll.bind(productController));
router.get   ('/products/:id',       productController.getById.bind(productController));
router.post  ('/products',           productController.create.bind(productController));
router.put   ('/products/:id',       productController.update.bind(productController));
router.delete('/products/:id',       productController.delete.bind(productController));

// ---- Vendas ----
router.get   ('/sales',     saleController.getAll.bind(saleController));
router.get   ('/sales/:id', saleController.getById.bind(saleController));
router.post  ('/sales',     saleController.create.bind(saleController));
router.delete('/sales/:id', saleController.cancel.bind(saleController));

module.exports = router;
