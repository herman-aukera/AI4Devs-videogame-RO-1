/**
 * Fix Test Runner - Diagnostic and Fix Script
 * This script helps diagnose why the test runner isn't loading in the browser
 */

// Check if we're in browser environment
if (typeof window !== 'undefined') {
  console.log('🔍 Diagnosing test runner issue...');

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
      console.log('📊 Environment Check:');
      console.log('- window object:', typeof window);
      console.log('- document object:', typeof document);

      console.log('\n🔧 Available Tournament Functions:');
      const tournamentFunctions = [
        'TOURNAMENT_CONSTANTS',
        'validateTournamentConfig',
        'validateTournamentSettings',
        'validateParticipant',
        'sanitizeTournamentConfig',
        'sanitizeTournamentSettings',
        'sanitizeParticipant',
        'TournamentStorageManager',
        'tournamentStorage'
      ];

      tournamentFunctions.forEach(func => {
        const available = typeof window[func] !== 'undefined';
        console.log(`  ${available ? '✅' : '❌'} ${func}: ${typeof window[func]}`);
      });

      console.log('\n🧪 Test Runner Check:');
      const testRunnerVars = [
        'TournamentModelTests',
        'testRunner',
        'TestRunner'
      ];

      let foundRunner = null;
      testRunnerVars.forEach(varName => {
        const available = typeof window[varName] !== 'undefined';
        console.log(`  ${available ? '✅' : '❌'} window.${varName}: ${typeof window[varName]}`);
        if (available && !foundRunner) {
          foundRunner = window[varName];
        }
      });

      if (foundRunner) {
        console.log('\n🎉 Test runner found!');
        console.log('- Type:', typeof foundRunner);
        console.log('- Has run method:', typeof foundRunner.run === 'function');
        console.log('- Has tests array:', Array.isArray(foundRunner.tests));
        if (foundRunner.tests) {
          console.log('- Number of tests:', foundRunner.tests.length);
        }

        // Try to make it globally available
        if (!window.testRunner) {
          window.testRunner = foundRunner;
          console.log('✅ Set window.testRunner');
        }
        if (!window.TournamentModelTests) {
          window.TournamentModelTests = foundRunner;
          console.log('✅ Set window.TournamentModelTests');
        }

        // Dispatch a custom event to notify that test runner is ready
        const event = new CustomEvent('testRunnerReady', {
          detail: { testRunner: foundRunner }
        });
        window.dispatchEvent(event);
        console.log('📡 Dispatched testRunnerReady event');

      } else {
        console.log('\n❌ No test runner found');
        console.log('🔍 All window properties containing "test" or "Test":');
        Object.keys(window).filter(key =>
          key.toLowerCase().includes('test') ||
          key.includes('Test') ||
          key.includes('Tournament')
        ).forEach(key => {
          console.log(`  - ${key}: ${typeof window[key]}`);
        });
      }

    }, 100);
  });

  // Also provide a manual fix function
  window.fixTestRunner = function () {
    console.log('🔧 Attempting manual test runner fix...');

    // Try to recreate the test runner if the class is available
    if (typeof window.TestRunner !== 'undefined') {
      console.log('✅ TestRunner class found, creating new instance...');
      const runner = new window.TestRunner();

      // We need to re-add all the tests - this is a simplified version
      // In a real scenario, we'd need to import and re-run the test definitions
      console.log('⚠️ Note: Tests need to be re-registered manually');

      window.testRunner = runner;
      window.TournamentModelTests = runner;

      console.log('✅ Test runner manually fixed');
      return runner;
    } else {
      console.log('❌ TestRunner class not available');
      return null;
    }
  };

} else {
  console.log('This script is for browser environment only');
}
