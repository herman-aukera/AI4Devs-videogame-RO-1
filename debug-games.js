#!/usr/bin/env node
/* © GG, MIT License */
/* ==============================================
   AI4DEVS RETRO GAMES - Debug Script
   Comprehensive visual and functional testing
   ============================================== */

const fs = require('fs');
const path = require('path');

// Get current working directory
const cwd = process.cwd();

console.log('🐛 DEBUGGING AI4DEVS RETRO GAMES');
console.log('=================================\n');

// Game folders to check
const gamefolders = [
  'snake-GG', 'breakout-GG', 'fruit-catcher-GG', 'pacman-GG', 
  'mspacman-GG', 'tetris-GG', 'asteroids-GG', 'space-invaders-GG', 'pong-GG'
];

// Colors that should be used
const expectedColors = [
  '#00ffff', // neon-cyan
  '#ff00ff', // neon-magenta  
  '#ffff00', // neon-yellow
  '#00ff00', // neon-green
];

// Files that should exist
const requiredFiles = ['index.html', 'style.css', 'script.js'];
const sharedFiles = ['css-tokens.css', 'game-shell.css', 'shared-styles.css'];

const allIssues = [];

console.log('📁 Checking shared files...');
for (const file of sharedFiles) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} MISSING`);
    allIssues.push(`Missing shared file: ${file}`);
  }
}

console.log('\n🎮 Checking individual games...');

for (const gameFolder of gamefolders) {
  console.log(`\n--- Checking ${gameFolder} ---`);
  const gamePath = path.join(__dirname, gameFolder);
  
  if (!fs.existsSync(gamePath)) {
    console.log(`❌ ${gameFolder} folder does not exist`);
    allIssues.push(`Missing game folder: ${gameFolder}`);
    continue;
  }
  
  // Check required files
  for (const file of requiredFiles) {
    const filePath = path.join(gamePath, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} MISSING`);
      allIssues.push(`${gameFolder}: Missing ${file}`);
    }
  }
  
  // Check HTML structure
  const htmlPath = path.join(gamePath, 'index.html');
  if (fs.existsSync(htmlPath)) {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Check for required imports
    const hasTokensImport = htmlContent.includes('css-tokens.css');
    const hasShellImport = htmlContent.includes('game-shell.css');
    const hasBackButton = htmlContent.includes('back-button') || htmlContent.includes('INICIO');
    const hasCanvas = htmlContent.includes('<canvas');
    const hasSpanishLang = htmlContent.includes('lang="es"');
    
    console.log(`   CSS Tokens Import: ${hasTokensImport ? '✅' : '❌'}`);
    console.log(`   Game Shell Import: ${hasShellImport ? '✅' : '❌'}`);
    console.log(`   Back Button: ${hasBackButton ? '✅' : '❌'}`);
    console.log(`   Canvas Element: ${hasCanvas ? '✅' : '❌'}`);
    console.log(`   Spanish Lang: ${hasSpanishLang ? '✅' : '❌'}`);
    
    if (!hasTokensImport) allIssues.push(`${gameFolder}: Missing css-tokens.css import`);
    if (!hasBackButton) allIssues.push(`${gameFolder}: Missing back button or INICIO text`);
    if (!hasCanvas) allIssues.push(`${gameFolder}: Missing canvas element`);
  }
  
  // Check CSS structure
  const cssPath = path.join(gamePath, 'style.css');
  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Check for required imports
    const hasTokensImport = cssContent.includes('css-tokens.css');
    const hasShellImport = cssContent.includes('game-shell.css');
    const usesDesignTokens = expectedColors.some(color => cssContent.includes(color));
    const hasVarUsage = cssContent.includes('var(--');
    
    console.log(`   CSS Tokens Import: ${hasTokensImport ? '✅' : '❌'}`);
    console.log(`   Game Shell Import: ${hasShellImport ? '✅' : '❌'}`);
    console.log(`   Uses Design Tokens: ${usesDesignTokens ? '✅' : '❌'}`);
    console.log(`   CSS Variables: ${hasVarUsage ? '✅' : '❌'}`);
    
    if (!hasTokensImport) allIssues.push(`${gameFolder}: CSS missing css-tokens.css import`);
    if (!hasVarUsage) allIssues.push(`${gameFolder}: CSS not using CSS variables`);
  }
  
  // Check JavaScript structure
  const jsPath = path.join(gamePath, 'script.js');
  if (fs.existsSync(jsPath)) {
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    
    const hasClass = jsContent.includes('class ');
    const hasCanvas = jsContent.includes('canvas') || jsContent.includes('Canvas');
    const hasAnimationFrame = jsContent.includes('requestAnimationFrame');
    const hasAuditMethod = jsContent.includes('runAuditTasks');
    
    console.log(`   ES6 Classes: ${hasClass ? '✅' : '❌'}`);
    console.log(`   Canvas Usage: ${hasCanvas ? '✅' : '❌'}`);
    console.log(`   Animation Frame: ${hasAnimationFrame ? '✅' : '❌'}`);
    console.log(`   Audit Method: ${hasAuditMethod ? '✅' : '❌'}`);
    
    if (!hasClass) allIssues.push(`${gameFolder}: JavaScript not using ES6 classes`);
    if (!hasAnimationFrame) allIssues.push(`${gameFolder}: Not using requestAnimationFrame`);
    if (!hasAuditMethod) allIssues.push(`${gameFolder}: Missing runAuditTasks method`);
  }
}

console.log('\n📊 SUMMARY');
console.log('===========');

if (allIssues.length === 0) {
  console.log('🎉 All games appear to be properly structured!');
  console.log('✨ No critical issues found.');
} else {
  console.log(`⚠️  Found ${allIssues.length} issues:`);
  allIssues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
}

console.log('\n🔍 NEXT STEPS:');
console.log('1. Start development server: python3 -m http.server 8000');
console.log('2. Open browser: http://localhost:8000');
console.log('3. Test each game individually');
console.log('4. Check browser console for runtime errors');

// Save detailed report
const reportPath = path.join(__dirname, 'debug-report.json');
const report = {
  timestamp: new Date().toISOString(),
  totalGames: gamefolders.length,
  issuesFound: allIssues.length,
  issues: allIssues,
  gamesChecked: gamefolders
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n💾 Detailed report saved: ${reportPath}`);
