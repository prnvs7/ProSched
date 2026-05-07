const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, orderController.getOrders);
router.post('/', auth, orderController.createOrder);
router.put('/:id', auth, orderController.updateOrder);
router.delete('/:id', auth, orderController.deleteOrder);

module.exports = router;
