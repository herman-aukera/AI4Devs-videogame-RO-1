/**
 * Simple browser compatibility test for tournament models
 * This file tests the basic functionality without the full test runner
 */

function testBasicFunctionality() {
  console.log('🧪 Testing basic tournament model functionality...');

  const results = [];

  // Test 1: Check if constants are available
  try {
    if (typeof TOURNAMENT_CONSTANTS !== 'undefined') {
      results.push('✅ TOURNAMENT_CONSTANTS available');
    } else {
      results.push('❌ TOURNAMENT_CONSTANTS not available');
    }
  } catch (e) {
    results.push('❌ Error accessing TOURNAMENT_CONSTANTS: ' + e.message);
  }

  // Test 2: Check if validation functions are available
  try {
    if (typeof validateTournamentConfig !== 'undefined') {
      results.push('✅ validateTournamentConfig available');

      // Test basic validation
      const testConfig = {
        name: 'Test Tournament',
        games: ['snake-GG'],
        format: 'round-robin'
      };

      const result = validateTournamentConfig(testConfig);
      if (result.isValid) {
        results.push('✅ Basic validation test passed');
      } else {
        results.push('❌ Basic validation test failed: ' + result.errors.join(', '));
      }
    } else {
      results.push('❌ validateTournamentConfig not available');
    }
  } catch (e) {
    results.push('❌ Error testing validation: ' + e.message);
  }

  // Test 3: Check if storage manager is available
  try {
    if (typeof TournamentStorageManager !== 'undefined') {
      results.push('✅ TournamentStorageManager available');

      // Test basic storage functionality
      const storage = new TournamentStorageManager();
      const info = storage.getStorageInfo();
      if (typeof info.totalTournaments === 'number') {
        results.push('✅ Storage manager basic test passed');
      } else {
        results.push('❌ Storage manager basic test failed');
      }
    } else {
      results.push('❌ TournamentStorageManager not available');
    }
  } catch (e) {
    results.push('❌ Error testing storage manager: ' + e.message);
  }

  // Test 4: Check if sanitization functions work
  try {
    if (typeof sanitizeTournamentConfig !== 'undefined') {
      results.push('✅ sanitizeTournamentConfig available');

      const dirtyConfig = {
        name: '  Test  ',
        games: ['snake-GG', 'snake-GG'],
        format: 'invalid'
      };

      const clean = sanitizeTournamentConfig(dirtyConfig);
      if (clean.name === 'Test' && clean.games.length === 1) {
        results.push('✅ Basic sanitization test passed');
      } else {
        results.push('❌ Basic sanitization test failed');
      }
    } else {
      results.push('❌ sanitizeTournamentConfig not available');
    }
  } catch (e) {
    results.push('❌ Error testing sanitization: ' + e.message);
  }

  return results;
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.testBasicFunctionality = testBasicFunctionality;

  // Run automatically after a short delay
  setTimeout(() => {
    const results = testBasicFunctionality();
    console.log('\n📊 Browser Compatibility Test Results:');
    results.forEach(result => console.log(result));

    const passed = results.filter(r => r.startsWith('✅')).length;
    const failed = results.filter(r => r.startsWith('❌')).length;

    console.log(`\n🏁 Summary: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
      console.log('🎉 All browser compatibility tests passed!');
    } else {
      console.log('⚠️ Some browser compatibility issues detected');
    }
  }, 500);
}
