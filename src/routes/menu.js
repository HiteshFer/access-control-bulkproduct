const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');


router.get('/', menuController.getAllMenus);
router.get('/:id', menuController.getMenu);      
router.post('/', menuController.createMenu);
router.put('/:id', menuController.updateMenu);   
router.delete('/:id', menuController.deleteMenu); 
router.get('/get_menus/:role_id', menuController.getMenusByRole); 
router.post('/menu_access/:role_id', menuController.insertMenuRoleAccess);


module.exports = router;