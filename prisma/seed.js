const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data (be careful in production!)
  await prisma.$transaction([
    prisma.MappingMenusRoleAccess.deleteMany(),
    prisma.UserRole.deleteMany(),
    prisma.Menu.deleteMany(),
    prisma.AdminUser.deleteMany(),
  ]);
  console.log("🧹 Cleared existing data");

  // Seed roles - CREATE INDIVIDUALLY to get IDs
  const adminRole = await prisma.UserRole.create({
    data: {
      user_type: "Admin",
      status: "1",
      is_deleted: "0",
      created_by: "1",
      updated_by: "1",
      custom_order: 1,
      parent_id: 0,
    }
  });

  const managerRole = await prisma.UserRole.create({
    data: {
      user_type: "Manager",
      status: "1",
      is_deleted: "0",
      created_by: "1",
      updated_by: "1",
      custom_order: 2,
      parent_id: adminRole.id, // Use actual admin role ID
    }
  });

  const staffRole = await prisma.UserRole.create({
    data: {
      user_type: "Staff",
      status: "1",
      is_deleted: "0",
      created_by: "1",
      updated_by: "1",
      custom_order: 3,
      parent_id: adminRole.id, // Use actual admin role ID
    }
  });

  const customerRole = await prisma.UserRole.create({
    data: {
      user_type: "Customer",
      status: "1",
      is_deleted: "0",
      created_by: "1",
      updated_by: "1",
      custom_order: 4,
      parent_id: 0,
    }
  });

  console.log(`📌 Created roles:`, {
    admin: adminRole.id,
    manager: managerRole.id,
    staff: staffRole.id,
    customer: customerRole.id
  });

  // Seed menus - CREATE INDIVIDUALLY to get IDs
  const dashboardMenu = await prisma.Menu.create({
    data: {
      menu_title: "Dashboard",
      uri: "/dashboard",
      route: "dashboard",
      created_by: "1",
      updated_by: "1",
      status: "1",
      is_deleted: "0",
      menu_type: "super_admin",
      parent_id: 0,
      icon: "home",
      menu_table: "menus",
      page_title: "Dashboard",
      position: 1,
    }
  });

  const usersMenu = await prisma.Menu.create({
    data: {
      menu_title: "Users",
      uri: "/users",
      route: "users",
      created_by: "1",
      updated_by: "1",
      status: "1",
      is_deleted: "0",
      menu_type: "admin",
      parent_id: 0,
      icon: "users",
      menu_table: "menus",
      page_title: "User Management",
      position: 2,
    }
  });

  const rolesMenu = await prisma.Menu.create({
    data: {
      menu_title: "Roles",
      uri: "/roles",
      route: "roles",
      created_by: "1",
      updated_by: "1",
      status: "1",
      is_deleted: "0",
      menu_type: "super_admin",
      parent_id: 0,
      icon: "shield",
      menu_table: "menus",
      page_title: "Role Management",
      position: 3,
    }
  });

  const settingsMenu = await prisma.Menu.create({
    data: {
      menu_title: "Settings",
      uri: "/settings",
      route: "settings",
      created_by: "1",
      updated_by: "1",
      status: "1",
      is_deleted: "0",
      menu_type: "admin",
      parent_id: 0,
      icon: "settings",
      menu_table: "menus",
      page_title: "System Settings",
      position: 4,
    }
  });

  console.log(`📂 Created menus:`, {
    dashboard: dashboardMenu.id,
    users: usersMenu.id,
    roles: rolesMenu.id,
    settings: settingsMenu.id
  });

  // Seed admin user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const adminUser = await prisma.AdminUser.create({
    data: {
      first_name: "Admin",
      last_name: "User",
      username: "adminuser",
      user_email: "admin@example.com",
      user_password: hashedPassword,
      role_id: adminRole.id, // Use actual role ID
      status: "1",
      is_deleted: "0",
      created_by: "1",
      updated_by: "1",
    }
  });
  console.log(`👥 Created user with ID: ${adminUser.id}`);

  // Now create mappings using actual IDs
  try {
    const mappings = await prisma.MappingMenusRoleAccess.createMany({
      data: [
        // Admin role full access
        {
          role_id: adminRole.id,
          menu_id: dashboardMenu.id,
          view: 1,
          add: 1,
          update: 1,
          delete: 1,
          export: 1,
          created_by: "1",
          updated_by: "1",
        },
        {
          role_id: adminRole.id,
          menu_id: usersMenu.id,
          view: 1,
          add: 1,
          update: 1,
          delete: 1,
          export: 1,
          created_by: "1",
          updated_by: "1",
        },
        {
          role_id: adminRole.id,
          menu_id: rolesMenu.id,
          view: 1,
          add: 1,
          update: 1,
          delete: 1,
          export: 1,
          created_by: "1",
          updated_by: "1",
        },
        {
          role_id: adminRole.id,
          menu_id: settingsMenu.id,
          view: 1,
          add: 1,
          update: 1,
          delete: 1,
          export: 1,
          created_by: "1",
          updated_by: "1",
        },

        // Manager role partial access
        {
          role_id: managerRole.id,
          menu_id: dashboardMenu.id,
          view: 1,
          add: 0,
          update: 0,
          delete: 0,
          export: 0,
          created_by: "1",
          updated_by: "1",
        },
        {
          role_id: managerRole.id,
          menu_id: usersMenu.id,
          view: 1,
          add: 1,
          update: 1,
          delete: 0,
          export: 0,
          created_by: "1",
          updated_by: "1",
        },

        // Staff role limited access
        {
          role_id: staffRole.id,
          menu_id: dashboardMenu.id,
          view: 1,
          add: 0,
          update: 0,
          delete: 0,
          export: 0,
          created_by: "1",
          updated_by: "1",
        },

        // Customer role no access
        {
          role_id: customerRole.id,
          menu_id: dashboardMenu.id,
          view: 0,
          add: 0,
          update: 0,
          delete: 0,
          export: 0,
          created_by: "1",
          updated_by: "1",
        },
      ],
      skipDuplicates: true,
    });
    console.log(`🔗 Inserted ${mappings.count} role-menu mappings`);
  } catch (error) {
    console.error("❌ Error creating mappings:", error);
  }

  console.log("✅ Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });