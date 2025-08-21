const express = require('express');
const router = express.Router();

router.use('/users', require('./userRoutes'));
router.use('/roles', require('./userRoles'));
router.use('/menu', require('./menu'));
router.use('/product', require('./product'));

module.exports = router;