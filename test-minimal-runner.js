/**
 * Minimal Test Runner for Browser Testing
 * This is a simplified version to test browser export functionality
 */

console.log('Loading minimal test runner...');

// Simple test framework
class SimpleTestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    console.log('SimpleTestRunner created');
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🏆 Running Simple Test Suite...\n');

    for (const { name, testFn } of this.tests) {
      try {
        await testFn();
        console.log(`✅ ${name}`);
        this.passed++;
      } catch (error) {
        console.error(`❌ ${name}: ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }
}

// Create test runner instance
const simpleRunner = new SimpleTestRunner();

// Add a few basic tests
simpleRunner.test('Basic Validation Test', () => {
  if (typeof validateTournamentConfig === 'undefined') {
    throw new Error('validateTournamentConfig not available');
  }

  const config = {
    name: 'Test Tournament',
    games: ['snake-GG'],
    format: 'round-robin'
  };

  const result = validateTournamentConfig(config);
  simpleRunner.assert(result.isValid, 'Basic config should be valid');
});

simpleRunner.test('Storage Manager Test', () => {
  if (typeof TournamentStorageManager === 'undefined') {
    throw new Error('TournamentStorageManager not available');
  }

  const storage = new TournamentStorageManager();
  const info = storage.getStorageInfo();
  simpleRunner.assert(typeof info.totalTournaments === 'number', 'Storage info should have totalTournaments');
});

simpleRunner.test('Constants Test', () => {
  if (typeof TOURNAMENT_CONSTANTS === 'undefined') {
    throw new Error('TOURNAMENT_CONSTANTS not available');
  }

  simpleRunner.assert(TOURNAMENT_CONSTANTS.MIN_PARTICIPANTS >= 2, 'MIN_PARTICIPANTS should be at least 2');
});

console.log('Test runner setup complete, exporting to browser...');

// Export to browser
if (typeof window !== 'undefined') {
  console.log('Browser environment detected, exporting globals...');

  window.SimpleTestRunner = SimpleTestRunner;
  window.simpleRunner = simpleRunner;
  window.testRunner = simpleRunner; // Also use the standard name
  window.TournamentModelTests = simpleRunner; // And this one too

  console.log('Exports completed:');
  console.log('- window.SimpleTestRunner:', typeof window.SimpleTestRunner);
  console.log('- window.simpleRunner:', typeof window.simpleRunner);
  console.log('- window.testRunner:', typeof window.testRunner);
  console.log('- window.TournamentModelTests:', typeof window.TournamentModelTests);

  // Dispatch ready event
  setTimeout(() => {
    const event = new CustomEvent('testRunnerReady', {
      detail: { testRunner: simpleRunner }
    });
    window.dispatchEvent(event);
    console.log('testRunnerReady event dispatched');
  }, 100);
} else {
  console.log('Node.js environment detected');
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = simpleRunner;
}

console.log('Minimal test runner loaded successfully');
