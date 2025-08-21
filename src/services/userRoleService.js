const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  async createRole(roleData) {
    try {
      return await prisma.userRole.create({
        data: {
          user_type: roleData.user_type,
          status: roleData.status || "1",
          is_deleted: roleData.is_deleted || "0",
          created_by: roleData.created_by || "",
          updated_by: roleData.updated_by || "",
          custom_order: roleData.custom_order || 1,
          parent_id: roleData.parent_id || 1
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async getRoleById(id) {
    try {
      return await prisma.userRole.findUnique({
        where: { 
          id: parseInt(id),
          is_deleted: "0"
        },
        include: {
          access: true // Include related access records
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async getAllRoles() {
    try {
      return await prisma.userRole.findMany({
        where: {
          is_deleted: "0"
        },
        orderBy: [
          { custom_order: 'asc' },
          { created_at: 'desc' }
        ],
        include: {
          access: true // Include related access records
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async updateRole(id, updateData) {
    try {
      // Check if role exists and is not deleted
      const existingRole = await prisma.userRole.findUnique({
        where: { 
          id: parseInt(id),
          is_deleted: "0"
        }
      });

      if (!existingRole) {
        return null;
      }

      // Update the role
      return await prisma.userRole.update({
        where: { id: parseInt(id) },
        data: {
          ...updateData,
          updated_by: updateData.updated_by || "",
          updated_at: new Date()
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async deleteRole(id) {
    try {
      // Check if role exists and is not already deleted
      const existingRole = await prisma.userRole.findUnique({
        where: { 
          id: parseInt(id),
          is_deleted: "0"
        }
      });

      if (!existingRole) {
        return null;
      }

      // Soft delete - update is_deleted field
      return await prisma.userRole.update({
        where: { id: parseInt(id) },
        data: {
          is_deleted: "1",
          updated_at: new Date()
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async getRolesByStatus(status) {
    try {
      return await prisma.userRole.findMany({
        where: {
          status: status,
          is_deleted: "0"
        },
        orderBy: [
          { custom_order: 'asc' },
          { created_at: 'desc' }
        ]
      });
    } catch (error) {
      throw error;
    }
  },

  async getRolesByParent(parentId) {
    try {
      return await prisma.userRole.findMany({
        where: {
          parent_id: parseInt(parentId),
          is_deleted: "0"
        },
        orderBy: [
          { custom_order: 'asc' },
          { created_at: 'desc' }
        ]
      });
    } catch (error) {
      throw error;
    }
  },

  async getRoleByType(userType) {
    try {
      return await prisma.userRole.findFirst({
        where: {
          user_type: userType,
          is_deleted: "0"
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async updateRoleOrder(roleId, newOrder) {
    try {
      return await prisma.userRole.update({
        where: { id: parseInt(roleId) },
        data: {
          custom_order: parseInt(newOrder),
          updated_at: new Date()
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async hardDeleteRole(id) {
    try {
      // Check if role exists
      const existingRole = await prisma.userRole.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingRole) {
        return null;
      }

      // Permanently delete from database
      return await prisma.userRole.delete({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      throw error;
    }
  },

  async restoreRole(id) {
    try {
      // Check if role exists and is deleted
      const existingRole = await prisma.userRole.findUnique({
        where: { 
          id: parseInt(id),
          is_deleted: "1"
        }
      });

      if (!existingRole) {
        return null;
      }

      // Restore role
      return await prisma.userRole.update({
        where: { id: parseInt(id) },
        data: {
          is_deleted: "0",
          updated_at: new Date()
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async getRoleHierarchy() {
    try {
      // Get all active roles with their hierarchy structure
      const roles = await prisma.userRole.findMany({
        where: {
          is_deleted: "0"
        },
        orderBy: [
          { parent_id: 'asc' },
          { custom_order: 'asc' }
        ]
      });

      // Group roles by parent_id to create hierarchy
      const roleMap = {};
      const hierarchy = [];

      roles.forEach(role => {
        roleMap[role.id] = { ...role, children: [] };
      });

      roles.forEach(role => {
        if (role.parent_id && roleMap[role.parent_id] && role.parent_id !== role.id) {
          roleMap[role.parent_id].children.push(roleMap[role.id]);
        } else {
          hierarchy.push(roleMap[role.id]);
        }
      });

      return hierarchy;
    } catch (error) {
      throw error;
    }
  }
};