// routes/userRoleRoutes.js
const express = require('express');
const router = express.Router();
const userRoleController = require('../controllers/userRoleController');

router.post('/', userRoleController.createRole);
router.get('/', userRoleController.getAllRoles);
router.get('/:id', userRoleController.getRole);
router.put('/:id', userRoleController.updateRole);
router.delete('/:id', userRoleController.deleteRole);

module.exports = router;