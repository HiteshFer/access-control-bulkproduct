const userRoleService = require('../services/userRoleService');
const ApiError = require('../utils/ApiError');

module.exports = {
  async createRole(req, res, next) {
    try {
      const { user_type } = req.body;
      
      // Basic validation
      if (!user_type) {
        return next(ApiError(400, 'User type is required'));
      }

      // Check if role with same user_type already exists
      const existingRole = await userRoleService.getRoleByType(user_type);
      if (existingRole) {
        return next(ApiError(409, 'Role with this user type already exists'));
      }

      const role = await userRoleService.createRole(req.body);
      res.status(201).json({
        success: true,
        data: role,
        message: 'Role created successfully'
      });
    } catch (err) {
      console.error('Create role error:', err);
      return next(ApiError(400, 'Role creation failed'));
    }
  },

  async getRole(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validate ID format
      if (!id || isNaN(id)) {
        return next(ApiError(400, 'Invalid role ID format'));
      }
      
      const role = await userRoleService.getRoleById(parseInt(id));
      
      if (!role) {
        return next(ApiError(404, 'Role not found'));
      }
      
      res.json({
        success: true,
        data: role
      });
    } catch (err) {
      console.error('Get role error:', err);
      return next(ApiError(500, 'Failed to fetch role'));
    }
  },

  async getAllRoles(req, res, next) {
    try {
      const roles = await userRoleService.getAllRoles();
      res.json({
        success: true,
        data: roles,
        count: roles.length
      });
    } catch (err) {
      console.error('Get all roles error:', err);
      return next(ApiError(500, 'Failed to fetch roles'));
    }
  },

  async updateRole(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return next(ApiError(400, 'Invalid role ID format'));
      }

      // If user_type is being updated, check if it already exists
      if (req.body.user_type) {
        const existingRole = await userRoleService.getRoleByType(req.body.user_type);
        if (existingRole && existingRole.id !== parseInt(id)) {
          return next(ApiError(409, 'Role with this user type already exists'));
        }
      }
      
      const role = await userRoleService.updateRole(parseInt(id), req.body);
      
      if (!role) {
        return next(ApiError(404, 'Role not found'));
      }
      
      res.json({
        success: true,
        data: role,
        message: 'Role updated successfully'
      });
    } catch (err) {
      console.error('Update role error:', err);
      return next(ApiError(500, 'Failed to update role'));
    }
  },

  async deleteRole(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return next(ApiError(400, 'Invalid role ID format'));
      }
      
      const result = await userRoleService.deleteRole(parseInt(id));
      
      if (!result) {
        return next(ApiError(404, 'Role not found'));
      }
      
      res.json({
        success: true,
        message: 'Role deleted successfully'
      });
    } catch (err) {
      console.error('Delete role error:', err);
      return next(ApiError(500, 'Failed to delete role'));
    }
  },

  async getRolesByStatus(req, res, next) {
    try {
      const { status } = req.params;
      
      if (!status || !['0', '1'].includes(status)) {
        return next(ApiError(400, 'Invalid status. Must be 0 or 1'));
      }
      
      const roles = await userRoleService.getRolesByStatus(status);
      
      res.json({
        success: true,
        data: roles,
        count: roles.length
      });
    } catch (err) {
      console.error('Get roles by status error:', err);
      return next(ApiError(500, 'Failed to fetch roles by status'));
    }
  },

  async getRolesByParent(req, res, next) {
    try {
      const { parentId } = req.params;
      
      if (!parentId || isNaN(parentId)) {
        return next(ApiError(400, 'Invalid parent ID format'));
      }
      
      const roles = await userRoleService.getRolesByParent(parseInt(parentId));
      
      res.json({
        success: true,
        data: roles,
        count: roles.length
      });
    } catch (err) {
      console.error('Get roles by parent error:', err);
      return next(ApiError(500, 'Failed to fetch roles by parent'));
    }
  },

  async updateRoleOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { order } = req.body;
      
      if (!id || isNaN(id)) {
        return next(ApiError(400, 'Invalid role ID format'));
      }
      
      if (!order || isNaN(order)) {
        return next(ApiError(400, 'Valid order number is required'));
      }
      
      const role = await userRoleService.updateRoleOrder(parseInt(id), parseInt(order));
      
      res.json({
        success: true,
        data: role,
        message: 'Role order updated successfully'
      });
    } catch (err) {
      console.error('Update role order error:', err);
      return next(ApiError(500, 'Failed to update role order'));
    }
  },

  async getRoleHierarchy(req, res, next) {
    try {
      const hierarchy = await userRoleService.getRoleHierarchy();
      
      res.json({
        success: true,
        data: hierarchy,
        message: 'Role hierarchy fetched successfully'
      });
    } catch (err) {
      console.error('Get role hierarchy error:', err);
      return next(ApiError(500, 'Failed to fetch role hierarchy'));
    }
  },

  async restoreRole(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return next(ApiError(400, 'Invalid role ID format'));
      }
      
      const role = await userRoleService.restoreRole(parseInt(id));
      
      if (!role) {
        return next(ApiError(404, 'Role not found or not deleted'));
      }
      
      res.json({
        success: true,
        data: role,
        message: 'Role restored successfully'
      });
    } catch (err) {
      console.error('Restore role error:', err);
      return next(ApiError(500, 'Failed to restore role'));
    }
  }
};