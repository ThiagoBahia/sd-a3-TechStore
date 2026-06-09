const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/SaleController');

router.get('/',              ctrl.list.bind(ctrl));
router.get('/:id',           ctrl.getById.bind(ctrl));
router.post('/',             ctrl.create.bind(ctrl));
router.patch('/:id/cancel',  ctrl.cancel.bind(ctrl));
router.delete('/:id',        ctrl.delete.bind(ctrl));

module.exports = router;
