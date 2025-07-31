/* © GG, MIT License */

/**
 * Unit Tests for EventBus System
 *
 * Comprehensive test suite covering:
 * - Basic subscription and publishing
 * - Event validation and error handling
 * - Memory management and cleanup
 * - Performance and reliability
 */

// Simple test framework for browser environment
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🧪 Starting EventBus Tests...\n');

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

    if (this.failed === 0) {
      console.log('🎉 All tests passed!');
    }

    return this.failed === 0;
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  assertThrows(fn, message) {
    try {
      fn();
      throw new Error(message || 'Expected function to throw');
    } catch (error) {
      if (error.message === message || error.message.includes('Expected function to throw')) {
        throw error;
      }
      // Expected error, test passes
    }
  }
}

// Test suite
const testRunner = new TestRunner();

// ===== BASIC FUNCTIONALITY TESTS =====

testRunner.test('EventBus can be instantiated', () => {
  const eventBus = new EventBus();
  testRunner.assert(eventBus instanceof EventBus, 'EventBus should be instantiated');
  testRunner.assert(typeof eventBus.subscribe === 'function', 'Should have subscribe method');
  testRunner.assert(typeof eventBus.publish === 'function', 'Should have publish method');
  testRunner.assert(typeof eventBus.unsubscribe === 'function', 'Should have unsubscribe method');
});

testRunner.test('Can subscribe to events', () => {
  const eventBus = new EventBus();
  let callbackExecuted = false;

  const unsubscribe = eventBus.subscribe('test-event', () => {
    callbackExecuted = true;
  });

  testRunner.assert(typeof unsubscribe === 'function', 'Subscribe should return unsubscribe function');

  const stats = eventBus.getStats();
  testRunner.assertEqual(stats.totalListeners, 1, 'Should have 1 listener');
  testRunner.assertEqual(stats.eventTypes, 1, 'Should have 1 event type');
});

testRunner.test('Can publish events to subscribers', () => {
  const eventBus = new EventBus();
  let receivedEvent = null;

  eventBus.subscribe('test-event', (event) => {
    receivedEvent = event;
  });

  const result = eventBus.publish('test-event', { message: 'Hello World' });

  testRunner.assert(receivedEvent !== null, 'Event should be received');
  testRunner.assertEqual(receivedEvent.type, 'test-event', 'Event type should match');
  testRunner.assertEqual(receivedEvent.data.message, 'Hello World', 'Event data should match');
  testRunner.assertEqual(result.listenersNotified, 1, 'Should notify 1 listener');
  testRunner.assertEqual(result.errors.length, 0, 'Should have no errors');
});

testRunner.test('Can unsubscribe from events', () => {
  const eventBus = new EventBus();
  let callbackExecuted = false;

  const unsubscribe = eventBus.subscribe('test-event', () => {
    callbackExecuted = true;
  });

  unsubscribe();
  eventBus.publish('test-event');

  testRunner.assert(!callbackExecuted, 'Callback should not execute after unsubscribe');

  const stats = eventBus.getStats();
  testRunner.assertEqual(stats.totalListeners, 0, 'Should have 0 listeners after unsubscribe');
});

// ===== MULTIPLE SUBSCRIBERS TESTS =====

testRunner.test('Can handle multiple subscribers', () => {
  const eventBus = new EventBus();
  const results = [];

  eventBus.subscribe('multi-test', () => results.push('listener1'));
  eventBus.subscribe('multi-test', () => results.push('listener2'));
  eventBus.subscribe('multi-test', () => results.push('listener3'));

  const result = eventBus.publish('multi-test');

  testRunner.assertEqual(results.length, 3, 'All 3 listeners should execute');
  testRunner.assertEqual(result.listenersNotified, 3, 'Should notify 3 listeners');
});

testRunner.test('Respects listener priority', () => {
  const eventBus = new EventBus();
  const executionOrder = [];

  eventBus.subscribe('priority-test', () => executionOrder.push('low'), { priority: 1 });
  eventBus.subscribe('priority-test', () => executionOrder.push('high'), { priority: 10 });
  eventBus.subscribe('priority-test', () => executionOrder.push('medium'), { priority: 5 });

  eventBus.publish('priority-test');

  testRunner.assertEqual(executionOrder[0], 'high', 'High priority should execute first');
  testRunner.assertEqual(executionOrder[1], 'medium', 'Medium priority should execute second');
  testRunner.assertEqual(executionOrder[2], 'low', 'Low priority should execute last');
});

// ===== ONE-TIME SUBSCRIPTION TESTS =====

testRunner.test('Once subscription works correctly', () => {
  const eventBus = new EventBus();
  let executionCount = 0;

  eventBus.once('once-test', () => {
    executionCount++;
  });

  eventBus.publish('once-test');
  eventBus.publish('once-test');
  eventBus.publish('once-test');

  testRunner.assertEqual(executionCount, 1, 'Once listener should execute only once');

  const stats = eventBus.getStats();
  testRunner.assertEqual(stats.totalListeners, 0, 'Once listener should be removed after execution');
});

// ===== ERROR HANDLING TESTS =====

testRunner.test('Handles listener errors gracefully', () => {
  const eventBus = new EventBus();
  let goodListenerExecuted = false;

  // Add a listener that throws an error
  eventBus.subscribe('error-test', () => {
    throw new Error('Test error');
  });

  // Add a good listener
  eventBus.subscribe('error-test', () => {
    goodListenerExecuted = true;
  });

  const result = eventBus.publish('error-test');

  testRunner.assertEqual(result.errors.length, 1, 'Should capture 1 error');
  testRunner.assertEqual(result.listenersNotified, 1, 'Should still notify good listener');
  testRunner.assert(goodListenerExecuted, 'Good listener should still execute');
});

testRunner.test('Validates event types', () => {
  const eventBus = new EventBus();

  testRunner.assertThrows(() => {
    eventBus.subscribe('', () => { });
  }, 'Should throw for empty event type');

  testRunner.assertThrows(() => {
    eventBus.subscribe(null, () => { });
  }, 'Should throw for null event type');

  testRunner.assertThrows(() => {
    eventBus.publish('');
  }, 'Should throw for empty event type in publish');
});

testRunner.test('Validates callbacks', () => {
  const eventBus = new EventBus();

  testRunner.assertThrows(() => {
    eventBus.subscribe('test', null);
  }, 'Should throw for null callback');

  testRunner.assertThrows(() => {
    eventBus.subscribe('test', 'not-a-function');
  }, 'Should throw for non-function callback');
});

// ===== CONTEXT BINDING TESTS =====

testRunner.test('Respects callback context', () => {
  const eventBus = new EventBus();
  const context = { value: 'test-context' };
  let receivedContext = null;

  eventBus.subscribe('context-test', function () {
    receivedContext = this;
  }, { context });

  eventBus.publish('context-test');

  testRunner.assertEqual(receivedContext, context, 'Callback should execute with correct context');
});

// ===== MEMORY MANAGEMENT TESTS =====

testRunner.test('Clear function works correctly', () => {
  const eventBus = new EventBus();

  eventBus.subscribe('event1', () => { });
  eventBus.subscribe('event1', () => { });
  eventBus.subscribe('event2', () => { });

  let stats = eventBus.getStats();
  testRunner.assertEqual(stats.totalListeners, 3, 'Should have 3 listeners initially');

  eventBus.clear('event1');
  stats = eventBus.getStats();
  testRunner.assertEqual(stats.totalListeners, 1, 'Should have 1 listener after clearing event1');

  eventBus.clear();
  stats = eventBus.getStats();
  testRunner.assertEqual(stats.totalListeners, 0, 'Should have 0 listeners after clearing all');
});

// ===== STATISTICS AND HISTORY TESTS =====

testRunner.test('Maintains event statistics', () => {
  const eventBus = new EventBus();

  eventBus.publish('stat-test');
  eventBus.publish('stat-test');
  eventBus.publish('other-event');

  const stats = eventBus.getStats();
  testRunner.assertEqual(stats.eventStats['stat-test'], 2, 'Should track stat-test events');
  testRunner.assertEqual(stats.eventStats['other-event'], 1, 'Should track other-event events');
});

testRunner.test('Maintains event history', () => {
  const eventBus = new EventBus();

  eventBus.publish('history-test-1', { data: 1 });
  eventBus.publish('history-test-2', { data: 2 });

  const history = eventBus.getHistory();
  testRunner.assert(history.length >= 2, 'Should maintain event history');
  testRunner.assertEqual(history[history.length - 1].type, 'history-test-2', 'Should have latest event');
  testRunner.assertEqual(history[history.length - 1].data.data, 2, 'Should preserve event data');
});

// ===== PERFORMANCE TESTS =====

testRunner.test('Handles large number of listeners efficiently', () => {
  const eventBus = new EventBus();
  const listenerCount = 1000;
  let executionCount = 0;

  // Add many listeners
  for (let i = 0; i < listenerCount; i++) {
    eventBus.subscribe('performance-test', () => {
      executionCount++;
    });
  }

  const startTime = performance.now();
  const result = eventBus.publish('performance-test');
  const endTime = performance.now();

  testRunner.assertEqual(executionCount, listenerCount, `Should execute all ${listenerCount} listeners`);
  testRunner.assertEqual(result.listenersNotified, listenerCount, `Should notify all ${listenerCount} listeners`);
  testRunner.assert(endTime - startTime < 100, 'Should execute efficiently (< 100ms)');
});

// ===== INTEGRATION TESTS =====

testRunner.test('Works independently of tournament logic', () => {
  const eventBus = new EventBus();
  let tournamentEventReceived = false;
  let gameEventReceived = false;

  // Simulate tournament system events
  eventBus.subscribe('tournament:start', () => {
    tournamentEventReceived = true;
  });

  // Simulate game system events
  eventBus.subscribe('game:score', () => {
    gameEventReceived = true;
  });

  // Publish events
  eventBus.publish('tournament:start', { tournamentId: 'test-123' });
  eventBus.publish('game:score', { score: 1000, game: 'snake' });

  testRunner.assert(tournamentEventReceived, 'Tournament event should be received');
  testRunner.assert(gameEventReceived, 'Game event should be received');

  // Verify isolation
  const stats = eventBus.getStats();
  testRunner.assertEqual(stats.eventTypes, 2, 'Should handle different event types independently');
});

// Run all tests
if (typeof window !== 'undefined') {
  // Browser environment
  document.addEventListener('DOMContentLoaded', () => {
    testRunner.run().then(success => {
      if (success) {
        console.log('🎉 EventBus is ready for tournament integration!');
      } else {
        console.error('❌ EventBus tests failed - check implementation');
      }
    });
  });
} else {
  // Node.js environment
  testRunner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

// Export test runner for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TestRunner, testRunner };
}

if (typeof window !== 'undefined') {
  window.EventBusTests = { TestRunner, testRunner };
}
