
const { PrismaClient } = require('@prisma/client');
const menuService = require('./menuService');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  async createUser(userData) {
    try {
      return await prisma.adminUser.create({
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          user_email: userData.user_email,
          user_password: userData.user_password,
          role_id: userData.role_id,
          status: userData.status || "1",
          is_deleted: userData.is_deleted || "0",
          created_by: userData.created_by || "",
          updated_by: userData.updated_by || ""
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async getUserById(id) {
    try {
      return await prisma.adminUser.findUnique({
        where: { 
          id: parseInt(id),
          is_deleted: "0" // Only get non-deleted users
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async getAllUsers() {
    try {
      return await prisma.adminUser.findMany({
        where: {
          is_deleted: "0" // Only get non-deleted users
        },
        orderBy: {
          created_at: 'desc'
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async updateUser(id, updateData) {
    try {
      // First check if user exists and is not deleted
      const existingUser = await prisma.adminUser.findUnique({
        where: { 
          id: parseInt(id),
          is_deleted: "0"
        }
      });

      if (!existingUser) {
        return null;
      }

      // Update the user
      return await prisma.adminUser.update({
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

  async deleteUser(id) {
    try {
      // Check if user exists and is not already deleted
      const existingUser = await prisma.adminUser.findUnique({
        where: { 
          id: parseInt(id),
          is_deleted: "0"
        }
      });

      if (!existingUser) {
        return null;
      }

      // Soft delete - update is_deleted field
      return await prisma.adminUser.update({
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

  async getUserByEmail(email) {
    try {
      return await prisma.adminUser.findUnique({
        where: { 
          user_email: email,
          is_deleted: "0"
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async getUserByUsername(username) {
    try {
      const result = await prisma.adminUser.findMany({
        where: { 
          username: username,
          is_deleted: "0"
        }
      });
      return result;
    } catch (error) {
      throw error;
    }
  },

  async getUsersByRole(roleId) {
    try {
      return await prisma.adminUser.findMany({
        where: {
          role_id: parseInt(roleId),
          is_deleted: "0"
        },
        orderBy: {
          created_at: 'desc'
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async getUsersByStatus(status) {
    try {
      return await prisma.adminUser.findMany({
        where: {
          status: status,
          is_deleted: "0"
        },
        orderBy: {
          created_at: 'desc'
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async hardDeleteUser(id) {
    try {
      // Check if user exists
      const existingUser = await prisma.adminUser.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingUser) {
        return null;
      }

      // Permanently delete from database
      return await prisma.adminUser.delete({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      throw error;
    }
  },

  async restoreUser(id) {
    try {
      // Check if user exists and is deleted
      const existingUser = await prisma.adminUser.findUnique({
        where: { 
          id: parseInt(id),
          is_deleted: "1"
        }
      });

      if (!existingUser) {
        return null;
      }

      // Restore user
      return await prisma.adminUser.update({
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

  async loginUser(loginData) {
    try {
      const { username, password, login_type } = loginData;

      // find user by username or email
     const user = await prisma.adminUser.findFirst({
       where: { username: username, is_deleted: "0", status: "1" },
       select: {
         id: true,
         username: true,
         role_id: true,
         user_password: true,
       },
     });
     
      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (!user.role_id) {
        throw new Error('User role is not exists');
      }

      const isPasswordValid = await bcrypt.compare(password, user.user_password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.user_email,
          roleId: user.role_id,
          roleType: user.user_type
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // get user menu access
      const menuAccess = await menuService.getMenusByRole(user.role_id, login_type);
      const userData = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        user_email: user.user_email,
        role_id: user.role_id,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      return {
        success: true,
        token: token,
        user: userData,
        role: user.role,
        menus: menuAccess.list || [],
        // permissions: await this.getUserPermissions(user.role_id),
        login_time: new Date()
      };

    } catch (error) {
      throw error;
    }
  },
};