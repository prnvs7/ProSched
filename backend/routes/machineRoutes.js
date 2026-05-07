const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, machineController.getMachines);
router.post('/', auth, machineController.createMachine);
router.put('/:id', auth, machineController.updateMachine);
router.delete('/:id', auth, machineController.deleteMachine);

module.exports = router;
