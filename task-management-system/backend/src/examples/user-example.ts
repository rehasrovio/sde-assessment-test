/**
 * Simple example of using the UserService
 * This demonstrates the clean separation of concerns
 */

import { UserService } from '../services/UserService';

async function demonstrateUserService() {
  console.log('🚀 User Service Example\n');

  const userService = new UserService();

  try {
    // Get all users
    console.log('📋 Getting all users...');
    const users = await userService.getAllUsers();
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.full_name} (${user.username}) - ${user.email}`);
    });

    // Get a specific user
    if (users.length > 0) {
      const firstUser = users[0];
      console.log(`\n👤 Getting user by ID ${firstUser.id}...`);
      const user = await userService.getUserById(firstUser.id);
      console.log(`Found: ${user?.full_name} (${user?.email})`);
    }

    // Create a new user
    console.log('\n➕ Creating a new user...');
    try {
      const newUser = await userService.createUser({
        username: 'test_user',
        email: 'test@example.com',
        full_name: 'Test User'
      });
      console.log(`✅ Created user: ${newUser.full_name} (ID: ${newUser.id})`);

      // Update the user
      console.log('\n✏️  Updating user...');
      const updatedUser = await userService.updateUser(newUser.id, {
        full_name: 'Updated Test User'
      });
      console.log(`✅ Updated user: ${updatedUser?.full_name}`);

      // Delete the user
      console.log('\n🗑️  Deleting user...');
      const deleted = await userService.deleteUser(newUser.id);
      console.log(`✅ User deleted: ${deleted}`);

    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  User already exists, skipping creation');
      } else {
        throw error;
      }
    }

    console.log('\n✅ User service example completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  demonstrateUserService()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Example failed:', error);
      process.exit(1);
    });
}
