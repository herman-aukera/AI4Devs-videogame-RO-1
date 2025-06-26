#!/usr/bin/env node
/* © GG, MIT License */
/* ==============================================
   COMPREHENSIVE GAME FEATURE ANALYZER
   Systematically analyze all features across games
   ============================================== */

const fs = require('fs');
const path = require('path');

console.log('🔍 COMPREHENSIVE GAME FEATURE ANALYZER');
console.log('======================================\n');

const gamefolders = [
  'pong-GG', 'snake-GG', 'breakout-GG', 'fruit-catcher-GG', 
  'pacman-GG', 'mspacman-GG', 'tetris-GG', 'asteroids-GG', 'space-invaders-GG'
];

const featureMatrix = {};

// Initialize feature matrix
gamefolders.forEach(game => {
  featureMatrix[game] = {
    keyboardControls: {},
    menuFeatures: {},
    gameplayFeatures: {},
    audioFeatures: {},
    uiFeatures: {},
    mobileFeatures: {},
    storageFeatures: {}
  };
});

console.log('🎮 ANALYZING KEYBOARD CONTROLS...\n');

// Analyze keyboard controls
for (const game of gamefolders) {
  const jsPath = path.join(process.cwd(), game, 'script.js');
  if (fs.existsSync(jsPath)) {
    const content = fs.readFileSync(jsPath, 'utf8');
    
    // Check for specific key handlers
    const features = featureMatrix[game].keyboardControls;
    
    features.enterKey = content.includes("'Enter'") || content.includes('"Enter"');
    features.spaceKey = content.includes("'Space'") || content.includes('"Space"');
    features.escapeKey = content.includes("'Escape'") || content.includes('"Escape"');
    features.arrowKeys = content.includes("'Arrow") || content.includes('"Arrow');
    features.wasdKeys = content.includes("'Key") && (content.includes('W') || content.includes('A'));
    features.pauseKey = content.includes('pause') || content.includes('Pause');
    features.preventDefaultKeys = content.includes('preventDefault');
    
    console.log(`📋 ${game}:`);
    console.log(`   Enter: ${features.enterKey ? '✅' : '❌'}`);
    console.log(`   Space: ${features.spaceKey ? '✅' : '❌'}`);
    console.log(`   Escape: ${features.escapeKey ? '✅' : '❌'}`);
    console.log(`   Arrows: ${features.arrowKeys ? '✅' : '❌'}`);
    console.log(`   WASD: ${features.wasdKeys ? '✅' : '❌'}`);
    console.log(`   Prevent Default: ${features.preventDefaultKeys ? '✅' : '❌'}`);
    console.log('');
  }
}

console.log('\n🎯 ANALYZING MENU FEATURES...\n');

// Analyze menu features
for (const game of gamefolders) {
  const htmlPath = path.join(process.cwd(), game, 'index.html');
  const jsPath = path.join(process.cwd(), game, 'script.js');
  
  if (fs.existsSync(htmlPath) && fs.existsSync(jsPath)) {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    
    const features = featureMatrix[game].menuFeatures;
    
    features.startScreen = htmlContent.includes('startScreen') || htmlContent.includes('start-screen');
    features.gameOverScreen = htmlContent.includes('gameOverScreen') || htmlContent.includes('game-over');
    features.pauseScreen = htmlContent.includes('pauseScreen') || htmlContent.includes('pause-screen');
    features.instructionsSection = htmlContent.includes('¿Cómo jugar?') || htmlContent.includes('instructions');
    features.backNavigation = htmlContent.includes('INICIO') || htmlContent.includes('index.html');
    features.screenTransitions = jsContent.includes('showScreen') || jsContent.includes('hideScreen');
    
    console.log(`📋 ${game}:`);
    console.log(`   Start Screen: ${features.startScreen ? '✅' : '❌'}`);
    console.log(`   Game Over Screen: ${features.gameOverScreen ? '✅' : '❌'}`);
    console.log(`   Pause Screen: ${features.pauseScreen ? '✅' : '❌'}`);
    console.log(`   Instructions: ${features.instructionsSection ? '✅' : '❌'}`);
    console.log(`   Back Navigation: ${features.backNavigation ? '✅' : '❌'}`);
    console.log(`   Screen Transitions: ${features.screenTransitions ? '✅' : '❌'}`);
    console.log('');
  }
}

console.log('\n🎵 ANALYZING AUDIO FEATURES...\n');

// Analyze audio features
for (const game of gamefolders) {
  const jsPath = path.join(process.cwd(), game, 'script.js');
  if (fs.existsSync(jsPath)) {
    const content = fs.readFileSync(jsPath, 'utf8');
    
    const features = featureMatrix[game].audioFeatures;
    
    features.webAudioAPI = content.includes('AudioContext') || content.includes('webkitAudioContext');
    features.audioElements = content.includes('Audio(') || content.includes('new Audio');
    features.soundEffects = content.includes('beep') || content.includes('sound') || content.includes('play()');
    features.audioToggle = content.includes('muteAudio') || content.includes('audioEnabled');
    
    console.log(`📋 ${game}:`);
    console.log(`   Web Audio API: ${features.webAudioAPI ? '✅' : '❌'}`);
    console.log(`   Audio Elements: ${features.audioElements ? '✅' : '❌'}`);
    console.log(`   Sound Effects: ${features.soundEffects ? '✅' : '❌'}`);
    console.log(`   Audio Toggle: ${features.audioToggle ? '✅' : '❌'}`);
    console.log('');
  }
}

console.log('\n📱 ANALYZING MOBILE FEATURES...\n');

// Analyze mobile features
for (const game of gamefolders) {
  const jsPath = path.join(process.cwd(), game, 'script.js');
  const cssPath = path.join(process.cwd(), game, 'style.css');
  
  if (fs.existsSync(jsPath)) {
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    const cssContent = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';
    
    const features = featureMatrix[game].mobileFeatures;
    
    features.touchEvents = jsContent.includes('touchstart') || jsContent.includes('touchend');
    features.responsiveCanvas = cssContent.includes('max-width') && cssContent.includes('canvas');
    features.mediaQueries = cssContent.includes('@media');
    features.viewportMeta = true; // We'll check HTML later
    
    console.log(`📋 ${game}:`);
    console.log(`   Touch Events: ${features.touchEvents ? '✅' : '❌'}`);
    console.log(`   Responsive Canvas: ${features.responsiveCanvas ? '✅' : '❌'}`);
    console.log(`   Media Queries: ${features.mediaQueries ? '✅' : '❌'}`);
    console.log('');
  }
}

console.log('\n💾 ANALYZING STORAGE FEATURES...\n');

// Analyze storage features
for (const game of gamefolders) {
  const jsPath = path.join(process.cwd(), game, 'script.js');
  if (fs.existsSync(jsPath)) {
    const content = fs.readFileSync(jsPath, 'utf8');
    
    const features = featureMatrix[game].storageFeatures;
    
    features.localStorage = content.includes('localStorage');
    features.highScores = content.includes('highScore') || content.includes('bestScore');
    features.gameSettings = content.includes('settings') || content.includes('preferences');
    
    console.log(`📋 ${game}:`);
    console.log(`   Local Storage: ${features.localStorage ? '✅' : '❌'}`);
    console.log(`   High Scores: ${features.highScores ? '✅' : '❌'}`);
    console.log(`   Game Settings: ${features.gameSettings ? '✅' : '❌'}`);
    console.log('');
  }
}

// Generate standardization recommendations
console.log('\n🎯 STANDARDIZATION OPPORTUNITIES\n');
console.log('================================\n');

const recommendations = [];

// Analyze keyboard control gaps
const keyboardGaps = {};
['enterKey', 'spaceKey', 'escapeKey', 'preventDefaultKeys'].forEach(feature => {
  const missing = gamefolders.filter(game => 
    featureMatrix[game].keyboardControls && !featureMatrix[game].keyboardControls[feature]
  );
  if (missing.length > 0) {
    keyboardGaps[feature] = missing;
  }
});

if (Object.keys(keyboardGaps).length > 0) {
  console.log('⌨️  KEYBOARD STANDARDIZATION NEEDED:');
  Object.entries(keyboardGaps).forEach(([feature, games]) => {
    console.log(`   ${feature}: Missing in ${games.join(', ')}`);
    recommendations.push({
      category: 'keyboard',
      feature: feature,
      missingGames: games,
      priority: 'high'
    });
  });
  console.log('');
}

// Analyze audio gaps
const audioGaps = {};
['webAudioAPI', 'audioToggle'].forEach(feature => {
  const missing = gamefolders.filter(game => 
    featureMatrix[game].audioFeatures && !featureMatrix[game].audioFeatures[feature]
  );
  if (missing.length > 0) {
    audioGaps[feature] = missing;
  }
});

if (Object.keys(audioGaps).length > 0) {
  console.log('🎵 AUDIO STANDARDIZATION NEEDED:');
  Object.entries(audioGaps).forEach(([feature, games]) => {
    console.log(`   ${feature}: Missing in ${games.join(', ')}`);
    recommendations.push({
      category: 'audio',
      feature: feature,
      missingGames: games,
      priority: 'medium'
    });
  });
  console.log('');
}

// Analyze mobile gaps
const mobileGaps = {};
['touchEvents', 'responsiveCanvas'].forEach(feature => {
  const missing = gamefolders.filter(game => 
    featureMatrix[game].mobileFeatures && !featureMatrix[game].mobileFeatures[feature]
  );
  if (missing.length > 0) {
    mobileGaps[feature] = missing;
  }
});

if (Object.keys(mobileGaps).length > 0) {
  console.log('📱 MOBILE STANDARDIZATION NEEDED:');
  Object.entries(mobileGaps).forEach(([feature, games]) => {
    console.log(`   ${feature}: Missing in ${games.join(', ')}`);
    recommendations.push({
      category: 'mobile',
      feature: feature,
      missingGames: games,
      priority: 'high'
    });
  });
  console.log('');
}

// Save detailed analysis
const analysisData = {
  timestamp: new Date().toISOString(),
  featureMatrix: featureMatrix,
  recommendations: recommendations,
  summary: {
    totalGames: gamefolders.length,
    totalRecommendations: recommendations.length,
    highPriorityIssues: recommendations.filter(r => r.priority === 'high').length
  }
};

fs.writeFileSync('game-feature-analysis.json', JSON.stringify(analysisData, null, 2));
console.log('\n💾 Detailed analysis saved: game-feature-analysis.json');

console.log('\n🎯 NEXT STEPS:');
console.log('1. Review recommendations above');
console.log('2. Implement missing features systematically');
console.log('3. Test each game after changes');
console.log('4. Run comprehensive audit to verify consistency');
