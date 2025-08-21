const userService = require('../services/userService');
const ApiError = require('../utils/ApiError');

module.exports = {
  async createUser(req, res, next) {
    try {
      // Basic validation
      const { first_name, last_name, username, user_email, user_password, role_id } = req.body;
      
      if (!first_name || !last_name || !username || !user_email || !user_password || !role_id) {
        return next(ApiError(400, 'All required fields must be provided'));
      }

      // Check if email already exists
      const existingEmail = await userService.getUserByEmail(user_email);
      if (existingEmail) {
        return next(ApiError(409, 'Email already exists'));
      }

      // Check if username already exists
      const existingUsername = await userService.getUserByUsername(username);
      if (existingUsername && existingUsername.length !==0) {
        return next(ApiError(409, 'Username already exists'));
      }

      const user = await userService.createUser(req.body);
      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (err) {
      console.error('Create user error:', err);
      return next(ApiError(400, 'User creation failed'));
    }
  },

  async getUser(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validate ID format
      if (!id || isNaN(id)) {
        return next(ApiError(400, 'Invalid user ID format'));
      }
      
      const user = await userService.getUserById(parseInt(id));
      
      if (!user) {
        return next(ApiError(404, 'User not found'));
      }
      
      res.json({
        success: true,
        data: user
      });
    } catch (err) {
      console.error('Get user error:', err);
      return next(ApiError(500, 'Failed to fetch user'));
    }
  },

  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (err) {
      console.error('Get all users error:', err);
      return next(ApiError(500, 'Failed to fetch users'));
    }
  },

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return next(ApiError(400, 'Invalid user ID format'));
      }

      // If email is being updated, check if it already exists
      if (req.body.user_email) {
        const existingEmail = await userService.getUserByEmail(req.body.user_email);
        if (existingEmail && existingEmail.id !== parseInt(id)) {
          return next(ApiError(409, 'Email already exists'));
        }
      }

      // If username is being updated, check if it already exists
      if (req.body.username) {
        const existingUsername = await userService.getUserByUsername(req.body.username);
        if (existingUsername && existingUsername.id !== parseInt(id)) {
          return next(ApiError(409, 'Username already exists'));
        }
      }
      
      const user = await userService.updateUser(parseInt(id), req.body);
      
      if (!user) {
        return next(ApiError(404, 'User not found'));
      }
      
      res.json({
        success: true,
        data: user,
        message: 'User updated successfully'
      });
    } catch (err) {
      console.error('Update user error:', err);
      return next(ApiError(500, 'Failed to update user'));
    }
  },

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return next(ApiError(400, 'Invalid user ID format'));
      }
      
      const result = await userService.deleteUser(parseInt(id));
      
      if (!result) {
        return next(ApiError(404, 'User not found'));
      }
      
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (err) {
      console.error('Delete user error:', err);
      return next(ApiError(500, 'Failed to delete user'));
    }
  },


  async login(req, res, next) {
    try {
      const { username, password, login_type } = req.body;
      
      if (!username || !password) {
        return next(ApiError(400, 'Username and password are required'));
      }

      const validLoginTypes = ['admin', 'user', 'manager'];
      if (login_type && !validLoginTypes.includes(login_type)) {
        return next(ApiError(400, 'Invalid login type'));
      }

      const result = await userService.loginUser({
        username: username.trim(),
        password,
        login_type: login_type || 'admin'
      });
      
      res.json({
        success: true,
        data: {
          token: result.token,
          user: result.user,
          role: result.role,
          menus: result.menus,
          permissions: result.permissions,
          login_time: result.login_time
        },
        message: 'Login successful'
      });
    } catch (err) {
      console.error('Login error:', err);
      return next(ApiError(401, err.message || 'Login failed'));
    }
  },
};