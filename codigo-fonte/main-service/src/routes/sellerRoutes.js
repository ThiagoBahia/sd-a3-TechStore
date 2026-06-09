const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/SellerController');

router.get('/',        ctrl.list.bind(ctrl));
router.get('/:id',     ctrl.getById.bind(ctrl));
router.post('/',       ctrl.create.bind(ctrl));
router.put('/:id',     ctrl.update.bind(ctrl));
router.delete('/:id',  ctrl.delete.bind(ctrl));

module.exports = router;
