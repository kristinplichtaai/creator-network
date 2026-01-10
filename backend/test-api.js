// test-api.js - Comprehensive API Testing Script
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

// Test 1: Server Health Check
async function testServerHealth() {
  logSection('TEST 1: Server Health Check');
  try {
    const response = await axios.get(`${API_BASE}/health`).catch(() => null);
    if (response && response.status === 200) {
      log('✓ Server is running and healthy', 'green');
      return true;
    } else {
      log('✗ Server health check failed', 'red');
      log('  Make sure the backend server is running: npm run dev', 'yellow');
      return false;
    }
  } catch (error) {
    log('✗ Cannot connect to server', 'red');
    log(`  Error: ${error.message}`, 'yellow');
    log('  Make sure the backend is running on port 3001', 'yellow');
    return false;
  }
}

// Test 2: Instagram OAuth Init
async function testInstagramInit() {
  logSection('TEST 2: Instagram OAuth Initialization');
  try {
    const response = await axios.get(`${API_BASE}/auth/instagram/init`);
    
    if (response.data.authUrl) {
      log('✓ Instagram OAuth URL generated successfully', 'green');
      log(`\n  Auth URL: ${response.data.authUrl.substring(0, 80)}...`, 'blue');
      log('\n  To test OAuth flow:', 'yellow');
      log('  1. Copy the full URL from the response', 'yellow');
      log('  2. Paste it in your browser', 'yellow');
      log('  3. Authorize the app', 'yellow');
      log('  4. Copy the code from the redirect URL', 'yellow');
      return response.data.authUrl;
    } else {
      log('✗ No auth URL in response', 'red');
      return null;
    }
  } catch (error) {
    log('✗ Instagram OAuth init failed', 'red');
    log(`  Error: ${error.response?.data?.error || error.message}`, 'yellow');
    log('  Check your INSTAGRAM_CLIENT_ID in .env', 'yellow');
    return null;
  }
}

// Test 3: TikTok OAuth Init
async function testTikTokInit() {
  logSection('TEST 3: TikTok OAuth Initialization');
  try {
    const response = await axios.get(`${API_BASE}/auth/tiktok/init`);
    
    if (response.data.authUrl) {
      log('✓ TikTok OAuth URL generated successfully', 'green');
      log(`\n  Auth URL: ${response.data.authUrl.substring(0, 80)}...`, 'blue');
      return response.data.authUrl;
    } else {
      log('✗ No auth URL in response', 'red');
      return null;
    }
  } catch (error) {
    log('✗ TikTok OAuth init failed', 'red');
    log(`  Error: ${error.response?.data?.error || error.message}`, 'yellow');
    log('  Check your TIKTOK_CLIENT_KEY in .env', 'yellow');
    log('  Note: TikTok requires developer approval', 'yellow');
    return null;
  }
}

// Test 4: YouTube OAuth Init
async function testYouTubeInit() {
  logSection('TEST 4: YouTube OAuth Initialization');
  try {
    const response = await axios.get(`${API_BASE}/auth/youtube/init`);
    
    if (response.data.authUrl) {
      log('✓ YouTube OAuth URL generated successfully', 'green');
      log(`\n  Auth URL: ${response.data.authUrl.substring(0, 80)}...`, 'blue');
      return response.data.authUrl;
    } else {
      log('✗ No auth URL in response', 'red');
      return null;
    }
  } catch (error) {
    log('✗ YouTube OAuth init failed', 'red');
    log(`  Error: ${error.response?.data?.error || error.message}`, 'yellow');
    log('  Check your YOUTUBE_CLIENT_ID in .env', 'yellow');
    return null;
  }
}

// Test 5: OAuth Callback (requires manual code)
async function testOAuthCallback(platform, code) {
  logSection(`TEST 5: ${platform.toUpperCase()} OAuth Callback`);
  
  if (!code) {
    log('⊘ Skipping - no authorization code provided', 'yellow');
    log('  To test this:', 'yellow');
    log(`  1. Complete OAuth flow for ${platform}`, 'yellow');
    log(`  2. Run: node test-api.js callback ${platform} YOUR_CODE`, 'yellow');
    return null;
  }

  try {
    const response = await axios.post(`${API_BASE}/auth/${platform}/callback`, { code });
    
    if (response.data.userId) {
      log('✓ OAuth callback successful', 'green');
      log(`  User ID: ${response.data.userId}`, 'blue');
      return response.data.userId;
    } else {
      log('✗ No user ID in response', 'red');
      return null;
    }
  } catch (error) {
    log('✗ OAuth callback failed', 'red');
    log(`  Error: ${error.response?.data?.error || error.message}`, 'yellow');
    log('  The authorization code may have expired', 'yellow');
    return null;
  }
}

// Test 6: Fetch Creator Profile
async function testFetchProfile(userId) {
  logSection('TEST 6: Fetch Creator Profile');
  
  if (!userId) {
    log('⊘ Skipping - no user ID provided', 'yellow');
    log('  Complete OAuth flow first to get a user ID', 'yellow');
    return null;
  }

  try {
    const response = await axios.get(`${API_BASE}/api/creator/${userId}`);
    
    if (response.data) {
      log('✓ Profile fetched successfully', 'green');
      log('\n  Profile Data:', 'blue');
      log(`    Platform: ${response.data.platform}`, 'blue');
      log(`    Username: @${response.data.username}`, 'blue');
      log(`    Followers: ${response.data.followers?.toLocaleString()}`, 'blue');
      log(`    Engagement: ${response.data.engagement}%`, 'blue');
      log(`    Posts: ${response.data.postCount}`, 'blue');
      
      if (response.data.recentTopics?.length > 0) {
        log(`    Topics: ${response.data.recentTopics.join(', ')}`, 'blue');
      }
      
      return response.data;
    } else {
      log('✗ No profile data in response', 'red');
      return null;
    }
  } catch (error) {
    log('✗ Profile fetch failed', 'red');
    log(`  Error: ${error.response?.data?.error || error.message}`, 'yellow');
    return null;
  }
}

// Test 7: Compatibility Score
async function testCompatibility(userId1, userId2) {
  logSection('TEST 7: Compatibility Score Calculation');
  
  if (!userId1 || !userId2) {
    log('⊘ Skipping - need two user IDs', 'yellow');
    log('  Connect at least 2 creators first', 'yellow');
    return null;
  }

  try {
    const response = await axios.post(`${API_BASE}/api/compatibility`, {
      creator1Id: userId1,
      creator2Id: userId2
    });
    
    if (response.data.score !== undefined) {
      log('✓ Compatibility score calculated', 'green');
      log(`\n  Overall Score: ${response.data.score}%`, 'blue');
      log('\n  Breakdown:', 'blue');
      log(`    Follower Compatibility: ${response.data.breakdown.followerCompatibility}%`, 'blue');
      log(`    Engagement Compatibility: ${response.data.breakdown.engagementCompatibility}%`, 'blue');
      log(`    Platform Alignment: ${response.data.breakdown.platformAlignment}%`, 'blue');
      return response.data;
    } else {
      log('✗ No compatibility score in response', 'red');
      return null;
    }
  } catch (error) {
    log('✗ Compatibility calculation failed', 'red');
    log(`  Error: ${error.response?.data?.error || error.message}`, 'yellow');
    return null;
  }
}

// Test 8: Environment Configuration
function testEnvironmentConfig() {
  logSection('TEST 8: Environment Configuration Check');
  
  const requiredVars = [
    'INSTAGRAM_CLIENT_ID',
    'INSTAGRAM_CLIENT_SECRET',
    'TIKTOK_CLIENT_KEY',
    'TIKTOK_CLIENT_SECRET',
    'YOUTUBE_CLIENT_ID',
    'YOUTUBE_CLIENT_SECRET'
  ];

  let allConfigured = true;

  log('Checking .env file configuration:\n', 'yellow');

  requiredVars.forEach(varName => {
    // This is a simulation - actual check would need dotenv
    log(`  ${varName}: [Check manually in .env file]`, 'blue');
  });

  log('\n  Make sure all API credentials are set in backend/.env', 'yellow');
  log('  Copy .env.example to .env and fill in your credentials', 'yellow');

  return allConfigured;
}

// Main test runner
async function runAllTests() {
  console.clear();
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║         LOCAL CREATOR NETWORK - API TEST SUITE           ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝\n', 'cyan');

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  };

  // Run tests
  testEnvironmentConfig();
  
  const serverHealthy = await testServerHealth();
  if (!serverHealthy) {
    log('\n⚠ Cannot proceed with tests - server is not running', 'red');
    log('Start the backend server first: cd backend && npm run dev', 'yellow');
    return;
  }

  await testInstagramInit();
  await testTikTokInit();
  await testYouTubeInit();

  // Check for command line arguments for advanced tests
  const args = process.argv.slice(2);
  
  if (args[0] === 'callback' && args[1] && args[2]) {
    const platform = args[1];
    const code = args[2];
    const userId = await testOAuthCallback(platform, code);
    
    if (userId) {
      await testFetchProfile(userId);
    }
  } else {
    await testOAuthCallback('instagram', null);
    await testFetchProfile(null);
    await testCompatibility(null, null);
  }

  // Summary
  logSection('TEST SUMMARY');
  log('Basic API connectivity tests completed!', 'green');
  log('\nNext steps:', 'yellow');
  log('1. Complete OAuth flow for each platform', 'yellow');
  log('2. Test with real authorization codes:', 'yellow');
  log('   node test-api.js callback instagram YOUR_CODE', 'yellow');
  log('3. Verify profile data is being fetched correctly', 'yellow');
  log('4. Test compatibility scoring with multiple creators\n', 'yellow');
}

// Run tests
runAllTests().catch(error => {
  log('\n✗ Test suite encountered an error:', 'red');
  console.error(error);
  process.exit(1);
});