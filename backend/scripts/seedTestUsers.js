// scripts/seedTestUsers.js - Create test users for collaborator matching
require('dotenv').config();
const { sequelize } = require('../database');
const { User, SocialAccount } = require('../models');
const bcrypt = require('bcryptjs');

async function seedTestUsers() {
  try {
    console.log('🔄 Starting database seed...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync database (create tables if they don't exist, update schema)
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema synchronized');

    // Check if we already have test users
    const existingTestUser = await User.findOne({ where: { email: 'test1@example.com' } });
    if (existingTestUser) {
      console.log('⚠️  Test users already exist. Skipping seed.');
      console.log('Run with --force to recreate test data');
      process.exit(0);
    }

    // Create test users in different locations
    const testUsers = [
      {
        email: 'test1@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Sarah Johnson',
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
        zipCode: '94102',
        latitude: 37.7749,
        longitude: -122.4194,
        searchRadius: 50
      },
      {
        email: 'test2@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Mike Chen',
        city: 'Oakland',
        state: 'CA',
        country: 'US',
        zipCode: '94612',
        latitude: 37.8044,
        longitude: -122.2712,
        searchRadius: 50
      },
      {
        email: 'test3@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Emma Rodriguez',
        city: 'San Jose',
        state: 'CA',
        country: 'US',
        zipCode: '95113',
        latitude: 37.3382,
        longitude: -121.8863,
        searchRadius: 75
      },
      {
        email: 'test4@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Alex Kim',
        city: 'Berkeley',
        state: 'CA',
        country: 'US',
        zipCode: '94704',
        latitude: 37.8715,
        longitude: -122.2730,
        searchRadius: 50
      },
      {
        email: 'test5@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Jamie Martinez',
        city: 'Palo Alto',
        state: 'CA',
        country: 'US',
        zipCode: '94301',
        latitude: 37.4419,
        longitude: -122.1430,
        searchRadius: 60
      }
    ];

    console.log('📝 Creating test users...');
    const createdUsers = [];
    for (const userData of testUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`   ✓ Created user: ${user.name} (${user.city}, ${user.state})`);
    }

    // Create social accounts for test users
    console.log('📱 Creating social media accounts...');
    const socialAccounts = [
      // User 1 - Sarah Johnson
      {
        userId: createdUsers[0].id,
        platform: 'instagram',
        platformUserId: 'ig_sarah_123',
        username: 'sarah_creates',
        displayName: 'Sarah Johnson',
        followers: 15000,
        following: 800,
        postCount: 245,
        engagementRate: 4.5,
        profileUrl: 'https://instagram.com/sarah_creates',
        profileData: {
          recentTopics: ['fashion', 'lifestyle', 'travel', 'photography', 'food']
        }
      },
      // User 2 - Mike Chen
      {
        userId: createdUsers[1].id,
        platform: 'youtube',
        platformUserId: 'yt_mike_456',
        username: 'mike_tech',
        displayName: 'Mike Chen',
        followers: 25000,
        following: 0,
        postCount: 87,
        engagementRate: 6.2,
        profileUrl: 'https://youtube.com/mike_tech',
        profileData: {
          recentTopics: ['technology', 'reviews', 'coding', 'gadgets', 'tutorials']
        }
      },
      // User 3 - Emma Rodriguez
      {
        userId: createdUsers[2].id,
        platform: 'instagram',
        platformUserId: 'ig_emma_789',
        username: 'emma_fitness',
        displayName: 'Emma Rodriguez',
        followers: 32000,
        following: 1200,
        postCount: 412,
        engagementRate: 5.8,
        profileUrl: 'https://instagram.com/emma_fitness',
        profileData: {
          recentTopics: ['fitness', 'health', 'nutrition', 'wellness', 'lifestyle']
        }
      },
      // User 4 - Alex Kim
      {
        userId: createdUsers[3].id,
        platform: 'tiktok',
        platformUserId: 'tt_alex_321',
        username: 'alex_comedy',
        displayName: 'Alex Kim',
        followers: 45000,
        following: 500,
        postCount: 156,
        engagementRate: 8.3,
        profileUrl: 'https://tiktok.com/@alex_comedy',
        profileData: {
          recentTopics: ['comedy', 'entertainment', 'lifestyle', 'food', 'travel']
        }
      },
      // User 5 - Jamie Martinez
      {
        userId: createdUsers[4].id,
        platform: 'instagram',
        platformUserId: 'ig_jamie_654',
        username: 'jamie_art',
        displayName: 'Jamie Martinez',
        followers: 18000,
        following: 950,
        postCount: 298,
        engagementRate: 5.1,
        profileUrl: 'https://instagram.com/jamie_art',
        profileData: {
          recentTopics: ['art', 'design', 'creativity', 'lifestyle', 'photography']
        }
      }
    ];

    for (const accountData of socialAccounts) {
      const account = await SocialAccount.create(accountData);
      console.log(`   ✓ Created ${account.platform} account for ${account.displayName} (${account.followers.toLocaleString()} followers)`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Test Users Created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const account = socialAccounts[i];
      console.log(`${i + 1}. ${user.name} (${user.email})`);
      console.log(`   📍 Location: ${user.city}, ${user.state}`);
      console.log(`   📱 Platform: ${account.platform} (@${account.username})`);
      console.log(`   👥 Followers: ${account.followers.toLocaleString()}`);
      console.log(`   📈 Engagement: ${account.engagementRate}%`);
      console.log('');
    }

    console.log('💡 Login credentials for all test users:');
    console.log('   Password: password123');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('   1. Login as any test user (e.g., test1@example.com)');
    console.log('   2. Go to "Find Collaborators" tab');
    console.log('   3. Click "Find Collaborators" button');
    console.log('   4. You should see 3-4 matches from nearby users!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

seedTestUsers();
