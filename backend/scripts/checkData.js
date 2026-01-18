// Quick database check script
require('dotenv').config();
const { User, SocialAccount, CollaboratorMatch } = require('../models');

async function checkData() {
  try {
    console.log('\n📊 DATABASE VERIFICATION\n');
    console.log('='.repeat(50));

    // Get most recent user
    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    console.log('\n👥 RECENT USERS:');
    users.forEach(user => {
      console.log(`\n  User: ${user.email || user.username}`);
      console.log(`  Location: ${user.city}, ${user.state}`);
      console.log(`  Coordinates: ${user.latitude}, ${user.longitude}`);
      console.log(`  Search Radius: ${user.searchRadius} miles`);
      console.log(`  Created: ${user.createdAt}`);
    });

    // Get social accounts
    const accounts = await SocialAccount.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    console.log('\n\n📱 CONNECTED SOCIAL ACCOUNTS:');
    accounts.forEach(acc => {
      console.log(`\n  ${acc.platform.toUpperCase()}: @${acc.username}`);
      console.log(`  Display Name: ${acc.displayName}`);
      console.log(`  Followers: ${acc.followers?.toLocaleString()}`);
      console.log(`  Engagement: ${acc.engagementRate}%`);
      console.log(`  Topics: ${acc.profileData?.recentTopics?.join(', ') || 'N/A'}`);
      console.log(`  User ID: ${acc.userId}`);
      console.log(`  Last Synced: ${acc.lastSyncedAt}`);
    });

    // Get matches
    const matches = await CollaboratorMatch.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [
        { model: User, as: 'user', attributes: ['email', 'username', 'city'] },
        { model: User, as: 'collaborator', attributes: ['email', 'username', 'city'] }
      ]
    });

    console.log('\n\n🤝 COLLABORATOR MATCHES:');
    matches.forEach(match => {
      console.log(`\n  Match Score: ${match.matchScore}`);
      console.log(`  Distance: ${match.distanceMiles} miles`);
      console.log(`  User: ${match.user?.email || match.user?.username}`);
      console.log(`  Collaborator: ${match.collaborator?.email || match.collaborator?.username}`);
      console.log(`  Status: ${match.status}`);
      console.log(`  Collaboration Formats: ${match.collaborationFormats?.join(', ') || 'N/A'}`);
      console.log(`  Created: ${match.createdAt}`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('✅ Database verification complete!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
}

checkData();
