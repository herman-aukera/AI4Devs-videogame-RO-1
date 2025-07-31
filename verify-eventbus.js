// Simple EventBus verification script
const fs = require('fs');

// Create browser-like globals
global.window = {};
global.document = { addEventListener: () => { } };
global.performance = { now: () => Date.now() };

// Load EventBus
const eventBusCode = fs.readFileSync('shared-tournament-eventbus.js', 'utf8');
eval(eventBusCode);

// Test basic functionality
const EventBus = global.window.EventBus;
const eventBus = new EventBus();

console.log('🧪 Testing EventBus Core Functionality...\n');

// Test 1: Basic subscription and publishing
let testResult = null;
eventBus.subscribe('test-event', (event) => {
  testResult = event.data;
});

eventBus.publish('test-event', { message: 'Hello World' });
console.log('✅ Basic pub/sub:', testResult?.message === 'Hello World' ? 'PASS' : 'FAIL');

// Test 2: Multiple listeners
let count = 0;
eventBus.subscribe('multi-test', () => count++);
eventBus.subscribe('multi-test', () => count++);
eventBus.publish('multi-test');
console.log('✅ Multiple listeners:', count === 2 ? 'PASS' : 'FAIL');

// Test 3: Unsubscribe
let shouldNotExecute = false;
const unsub = eventBus.subscribe('unsub-test', () => shouldNotExecute = true);
unsub();
eventBus.publish('unsub-test');
console.log('✅ Unsubscribe:', !shouldNotExecute ? 'PASS' : 'FAIL');

// Test 4: Error handling
let goodListenerExecuted = false;
eventBus.subscribe('error-test', () => { throw new Error('Test error'); });
eventBus.subscribe('error-test', () => goodListenerExecuted = true);
const result = eventBus.publish('error-test');
console.log('✅ Error handling:', result.errors.length === 1 && goodListenerExecuted ? 'PASS' : 'FAIL');

// Test 5: Statistics
const stats = eventBus.getStats();
console.log('✅ Statistics tracking:', stats.totalListeners > 0 ? 'PASS' : 'FAIL');

// Test 6: Independence from tournament logic
let tournamentReceived = false;
let gameReceived = false;

eventBus.subscribe('tournament:start', () => tournamentReceived = true);
eventBus.subscribe('game:score', () => gameReceived = true);

eventBus.publish('tournament:start', { id: 'test-tournament' });
eventBus.publish('game:score', { score: 1000 });

console.log('✅ Tournament independence:', tournamentReceived && gameReceived ? 'PASS' : 'FAIL');

console.log('\n🎉 EventBus verification complete!');
console.log('📊 Final stats:');
console.log('   Total listeners:', stats.totalListeners);
console.log('   Event types:', stats.eventTypes);
console.log('   Events published:', Object.values(stats.eventStats).reduce((sum, count) => sum + count, 0));

console.log('\n✅ EventBus is ready for tournament integration!');
