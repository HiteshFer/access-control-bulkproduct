const menuService = require('../services/menuService');
const ApiError = require('../utils/ApiError');

module.exports = {
  async createMenu(req, res, next) {
    try {
      // Basic validation
      const { menu_title,uri,route,status,menu_type,parent_id,icon,menu_table,position } = req.body;
      
      if (!menu_title || !uri || !route || !status || !menu_type || !parent_id || !icon || !menu_table || !position) {
        return next(ApiError(400|| ! 'All required fields must be provided'));
      }

      // Check if menuname already exists
      const existingmenuname = await menu.getmenuByMenuName(menu_title);
      if (existingmenuname) {
        return next(ApiError(409, 'menu name already exists'));
      }

      const menu = await menu.createMenu(req.body);
      res.status(201).json({
        success: true,
        data: menu,
        message: 'menu created successfully'
      });
    } catch (err) {
      console.error('Create menu error:', err);
      return next(ApiError(400, 'menu creation failed'));
    }
  },

  async getMenu(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validate ID format
      if (!id || isNaN(id)) {
        return next(ApiError(400, 'Invalid menu ID format'));
      }
      
      const menu = await menuService.getMenuById(parseInt(id));
      
      if (!menu) {
        return next(ApiError(404, 'menu not found'));
      }
      
      res.json({
        success: true,
        data: menu
      });
    } catch (err) {
      console.error('Get menu error:', err);
      return next(ApiError(500, 'Failed to fetch menu'));
    }
  },

  async getAllMenus(req, res, next) {
    try {
      const menus = await menuService.getAllMenus();
      res.json({
        success: true,
        data: menus,
        count: menus.length
      });
    } catch (err) {
      console.error('Get all menus error:', err);
      return next(ApiError(500, 'Failed to fetch menus'));
    }
  },

  async updateMenu(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return next(ApiError(400, 'Invalid menu ID format'));
      }

      // If menuname is being updated, check if it already exists
      if (req.body.menu_title) {
        const existingmenuname = await menuService.getmenuByMenuName(req.body.menu_title);
        if (existingmenuname && existingmenuname.id !== parseInt(id)) {
          return next(ApiError(409, 'menu name already exists'));
        }
      }
      
      const menu = await menuService.updateMenu(parseInt(id), req.body);
      
      if (!menu) {
        return next(ApiError(404, 'menu not found'));
      }
      
      res.json({
        success: true,
        data: menu,
        message: 'menu updated successfully'
      });
    } catch (err) {
      console.error('Update menu error:', err);
      return next(ApiError(500, 'Failed to update menu'));
    }
  },

  async deleteMenu(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return next(ApiError(400, 'Invalid menu ID format'));
      }
      
      const result = await menuService.deleteMenu(parseInt(id));
      
      if (!result) {
        return next(ApiError(404, 'menu not found'));
      }
      
      res.json({
        success: true,
        message: 'menu deleted successfully'
      });
    } catch (err) {
      console.error('Delete menu error:', err);
      return next(ApiError(500, 'Failed to delete menu'));
    }
  },

  async getMenusByRole(req, res, next) {
    try {
      const { role_id } = req.params;
      const { menu_type } = req.query;
      
      if (!role_id || isNaN(role_id)) {
        return next(ApiError(400, 'Valid role ID is required'));
      }
      
      const result = await menuService.getMenusByRole(parseInt(role_id), menu_type);
      
      res.json({
        success: true,
        data: result.list,
        total: result.total || 0,
        message: result.message || 'Menus fetched successfully'
      });
    } catch (err) {
      console.error('Get menus by role error:', err);
      return next(ApiError(500, 'Failed to fetch menus'));
    }
  },

  async insertMenuRoleAccess(req, res, next) {
    try {
      const { role_id } = req.params;
      const accessData = req.body;
      
      // Validate role ID
      if (!role_id || isNaN(role_id)) {
        return next(ApiError(400, 'Valid role ID is required'));
      }
      
      // Validate request body
      if (!accessData.role_access || !Array.isArray(accessData.role_access)) {
        return next(ApiError(400, 'role_access array is required'));
      }
      
      // Validate each access entry
      for (let i = 0; i < accessData.role_access.length; i++) {
        const access = accessData.role_access[i];
        if (!access.menu_id || isNaN(access.menu_id)) {
          return next(ApiError(400, `Invalid menu_id at index ${i}`));
        }
      }
      
      const result = await menuService.insertMenuRoleAccess(parseInt(role_id), accessData);
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'Menu role access updated successfully'
      });
    } catch (err) {
      console.error('Insert menu role access error:', err);
      return next(ApiError(500, err.message || 'Failed to insert menu role access'));
    }
  }
  
};