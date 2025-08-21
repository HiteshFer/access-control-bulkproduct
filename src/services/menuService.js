
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  async createMenu(menuData) {
    try {
      return await prisma.menu.create({
        data: {
          menu_title: menuData.menu_title,
          uri: menuData.uri,
          route: menuData.route,
          status: menuData.status|| "1",
          menu_type: menuData.menu_type,
          parent_id: menuData.parent_id,
          icon: menuData.icon,
          menu_table: menuData.menu_table,
          position: menuData.position,
          is_deleted: menuData.is_deleted || "0",
          created_by: menuData.created_by || "",
          updated_by: menuData.updated_by || ""
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async getMenuById(id) {
    try {
      return await prisma.menu.findUnique({
        where: { 
          id: parseInt(id),
          is_deleted: "0" // Only get non-deleted menus
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async getAllMenus() {
    try {
      return await prisma.menu.findMany({
        where: {
          is_deleted: "0" // Only get non-deleted menus
        },
        orderBy: {
          created_at: 'desc'
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async updateMenu(id, updateData) {
    try {
      // First check if menu exists and is not deleted
      const existingmenu = await prisma.menu.findUnique({
        where: { 
          id: parseInt(id),
          is_deleted: "0"
        }
      });

      if (!existingmenu) {
        return null;
      }

      // Update the menu
      return await prisma.menu.update({
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

  async deleteMenu(id) {
    try {
      // Check if menu exists and is not already deleted
      const existingmenu = await prisma.menu.findUnique({
        where: { 
          id: parseInt(id),
          is_deleted: "0"
        }
      });

      if (!existingmenu) {
        return null;
      }

      // Soft delete - update is_deleted field
      return await prisma.menu.update({
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

  async getmenuByMenuName(title) {
    try {
      return await prisma.menu.findUnique({
        where: { 
          menu_title: title,
          is_deleted: "0"
        }
      });
    } catch (error) {
      throw error;
    }
  },

  async getMenusByRole(roleId, menuType = null) {
    try {
      // Step 1: Get role access mappings for the given role
      const getRoleIdData = await prisma.mappingMenusRoleAccess.findMany({
        where: {
          role_id: parseInt(roleId)
        }
      });

      // Step 2: Create access mapping object
      const accessMappingObj = {};
      for (let roleCnt = 0; roleCnt < getRoleIdData.length; roleCnt++) {
        accessMappingObj[getRoleIdData[roleCnt].menu_id] = {
          view: getRoleIdData[roleCnt].view,
          add: getRoleIdData[roleCnt].add,
          update: getRoleIdData[roleCnt].update,
          delete: getRoleIdData[roleCnt].delete,
          export: getRoleIdData[roleCnt].export,
        };
      }

      // Step 3: Default access object for menus without specific permissions
      const accessObject = { view: 0, add: 0, update: 0, delete: 0, export: 0 };

      // Step 4: Build where condition for menus
      const whereCondition = {
        is_deleted: "0",
        status: "1"
      };

      // Add menu_type filter if provided
      if (menuType) {
        whereCondition.menu_type = menuType;
      }

      // Step 5: Get all menus
      const allmenu = await prisma.menu.findMany({
        where: whereCondition,
        select: {
          id: true,
          menu_title: true,
          menu_type: true,
          parent_id: true,
          uri: true,
          icon: true,
        },
        orderBy: [
          { parent_id: 'asc' },
          { id: 'asc' }
        ]
      });

      // Step 6: Filter main menus (parent_id = 0)
      const main_menu = allmenu.filter((data) => data.parent_id == 0);

      // Step 7: Build hierarchical menu structure with access permissions
      for (let i = 0; i < main_menu.length; i++) {
        const arrayOfSubMenus = [];
        
        for (let j = 0; j < allmenu.length; j++) {
          if (main_menu[i].id == allmenu[j].parent_id) {
            // Assign access permissions
            if (accessMappingObj.hasOwnProperty(allmenu[j].id)) {
              allmenu[j].access = accessMappingObj[allmenu[j].id];
            } else {
              allmenu[j].access = accessObject;
            }
            
            arrayOfSubMenus.push(allmenu[j]);
          }
        }
        
        // Assign access permissions to main menu
        if (accessMappingObj.hasOwnProperty(main_menu[i].id)) {
          main_menu[i].access = accessMappingObj[main_menu[i].id];
        } else {
          main_menu[i].access = accessObject;
        }
        
        main_menu[i].submenus = arrayOfSubMenus;
      }

      if (main_menu.length > 0) {
        return { 
          status: 'success', 
          list: main_menu,
          total: main_menu.length
        };
      } else {
        return { 
          status: 'success', 
          list: [],
          message: 'No menus found for this role'
        };
      }

    } catch (error) {
      throw error;
    }
  },

  async insertMenuRoleAccess(roleId, accessData) {
    try {
      const { type, role_access } = accessData;
      
      // Validate input
      if (!roleId || !role_access || !Array.isArray(role_access)) {
        throw new Error('Invalid input data');
      }

      // Check if role exists
      const role = await prisma.userRole.findUnique({
        where: { 
          id: parseInt(roleId),
          is_deleted: "0" 
        }
      });

      if (!role) {
        throw new Error('Role not found');
      }

      const results = [];
      const errors = [];

      // Process each menu access entry
      for (let i = 0; i < role_access.length; i++) {
        const access = role_access[i];
        
        try {
          // Validate menu exists
          const menu = await prisma.menu.findUnique({
            where: { 
              id: parseInt(access.menu_id),
              is_deleted: "0" 
            }
          });

          if (!menu) {
            errors.push(`Menu with ID ${access.menu_id} not found`);
            continue;
          }

          // check if mapping already exists
          const existingMapping = await prisma.mappingMenusRoleAccess.findFirst({
            where: {
              role_id: parseInt(roleId),
              menu_id: parseInt(access.menu_id)
            }
          });

          if (existingMapping) {
            // update existing mapping
            const updatedMapping = await prisma.mappingMenusRoleAccess.update({
              where: { id: existingMapping.id },
              data: {
                view: parseInt(access.view) || 0,
                add: parseInt(access.add) || 0,
                update: parseInt(access.update) || 0,
                delete: parseInt(access.delete) || 0,
                export: parseInt(access.export) || 0,
                updated_at: new Date()
              }
            });
            
            results.push({
              action: 'updated',
              menu_id: access.menu_id,
              mapping_id: updatedMapping.id
            });
          } else {
            // Create new mapping
            const newMapping = await prisma.mappingMenusRoleAccess.create({
              data: {
                role_id: parseInt(roleId),
                menu_id: parseInt(access.menu_id),
                view: parseInt(access.view) || 0,
                add: parseInt(access.add) || 0,
                update: parseInt(access.update) || 0,
                delete: parseInt(access.delete) || 0,
                export: parseInt(access.export) || 0
              }
            });
            
            results.push({
              action: 'created',
              menu_id: access.menu_id,
              mapping_id: newMapping.id
            });
          }
        } catch (menuError) {
          errors.push(`Error processing menu ${access.menu_id}: ${menuError.message}`);
        }
      }

      return {
        success: true,
        role_id: parseInt(roleId),
        type: type,
        processed: results.length,
        results: results,
        errors: errors
      };

    } catch (error) {
      throw error;
    }
  },

};