#!/usr/bin/env node
/* © GG, MIT License */
/* ==============================================
   CROSS-GAME ISSUE CHECKER
   Verify the 5 key problems we fixed in Pong don't exist elsewhere
   ============================================== */

const fs = require('fs');
const path = require('path');

console.log('🔍 CROSS-GAME ISSUE CHECKER');
console.log('===========================\n');

const gamefolders = [
  'snake-GG', 'breakout-GG', 'fruit-catcher-GG', 'pacman-GG', 
  'mspacman-GG', 'tetris-GG', 'asteroids-GG', 'space-invaders-GG'
]; // Excluding pong-GG since we just fixed it

const issues = [];

console.log('🎯 CHECKING FOR RECURRING ISSUES FROM PONG FIXES...\n');

// Issue 1: Check for remaining "GG" in visible content
console.log('1️⃣ Checking for "GG" in visible content...');
for (const game of gamefolders) {
  const htmlPath = path.join(process.cwd(), game, 'index.html');
  if (fs.existsSync(htmlPath)) {
    const content = fs.readFileSync(htmlPath, 'utf8');
    
    // Check for GG in titles and headings (excluding copyright)
    const titleMatches = content.match(/<title[^>]*>.*?GG.*?<\/title>/gi);
    const h1Matches = content.match(/<h1[^>]*>.*?GG.*?<\/h1>/gi);
    const h2Matches = content.match(/<h2[^>]*>.*?GG.*?<\/h2>/gi);
    
    if (titleMatches || h1Matches || h2Matches) {
      issues.push(`${game}: Contains "GG" in visible titles/headings`);
      console.log(`   ❌ ${game}: Found "GG" in visible content`);
    } else {
      console.log(`   ✅ ${game}: Clean of visible "GG" references`);
    }
  }
}

// Issue 2: Check for missing game-shell.css imports
console.log('\n2️⃣ Checking for game-shell.css imports...');
for (const game of gamefolders) {
  const htmlPath = path.join(process.cwd(), game, 'index.html');
  if (fs.existsSync(htmlPath)) {
    const content = fs.readFileSync(htmlPath, 'utf8');
    
    if (!content.includes('game-shell.css')) {
      issues.push(`${game}: Missing game-shell.css import`);
      console.log(`   ❌ ${game}: Missing game-shell.css import`);
    } else {
      console.log(`   ✅ ${game}: Has game-shell.css import`);
    }
  }
}

// Issue 3: Check for Enter key support in JavaScript
console.log('\n3️⃣ Checking for Enter key support...');
for (const game of gamefolders) {
  const jsPath = path.join(process.cwd(), game, 'script.js');
  if (fs.existsSync(jsPath)) {
    const content = fs.readFileSync(jsPath, 'utf8');
    
    const hasEnterKeyHandling = content.includes('Enter') && content.includes('keydown');
    const hasEnterInSwitch = content.includes("case 'Enter'");
    
    if (!hasEnterKeyHandling && !hasEnterInSwitch) {
      issues.push(`${game}: Missing Enter key support`);
      console.log(`   ⚠️  ${game}: No Enter key handling detected`);
    } else {
      console.log(`   ✅ ${game}: Has Enter key support`);
    }
  }
}

// Issue 4: Check for potential UI overlay issues
console.log('\n4️⃣ Checking for potential UI overlay issues...');
for (const game of gamefolders) {
  const cssPath = path.join(process.cwd(), game, 'style.css');
  if (fs.existsSync(cssPath)) {
    const content = fs.readFileSync(cssPath, 'utf8');
    
    // Look for suspicious z-index or overlay patterns
    const hasFixedPositioning = content.includes('position: fixed') || content.includes('position:fixed');
    const hasHighZIndex = content.match(/z-index\s*:\s*[9-9]\d{2,}/g); // z-index 900+
    const hasOverlayClasses = content.includes('.overlay') || content.includes('.hud');
    
    if (hasFixedPositioning && hasHighZIndex) {
      issues.push(`${game}: Potential z-index overlay conflicts`);
      console.log(`   ⚠️  ${game}: High z-index with fixed positioning detected`);
    } else {
      console.log(`   ✅ ${game}: No obvious overlay issues`);
    }
  }
}

// Issue 5: Check for missing event listeners or button functionality
console.log('\n5️⃣ Checking for button event handling...');
for (const game of gamefolders) {
  const jsPath = path.join(process.cwd(), game, 'script.js');
  const htmlPath = path.join(process.cwd(), game, 'index.html');
  
  if (fs.existsSync(jsPath) && fs.existsSync(htmlPath)) {
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Find buttons in HTML
    const buttonMatches = htmlContent.match(/id="([^"]*[Bb]tn[^"]*)"/g) || [];
    const buttons = buttonMatches.map(match => match.replace(/id="([^"]*)"/, '$1'));
    
    // Check if JavaScript has event listeners for these buttons
    const missingHandlers = [];
    for (const buttonId of buttons) {
      if (!jsContent.includes(buttonId)) {
        missingHandlers.push(buttonId);
      }
    }
    
    if (missingHandlers.length > 0) {
      issues.push(`${game}: Missing event handlers for buttons: ${missingHandlers.join(', ')}`);
      console.log(`   ❌ ${game}: Missing handlers for: ${missingHandlers.join(', ')}`);
    } else {
      console.log(`   ✅ ${game}: Button event handlers appear complete`);
    }
  }
}

// Summary
console.log('\n📊 SUMMARY');
console.log('==========');

if (issues.length === 0) {
  console.log('🎉 EXCELLENT! No recurring issues found across games.');
  console.log('✅ All fixes from Pong appear to be unique to that game.');
} else {
  console.log(`⚠️  Found ${issues.length} potential issues to address:`);
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
}

console.log('\n🔍 NEXT STEPS:');
if (issues.length > 0) {
  console.log('1. Review and fix the issues listed above');
  console.log('2. Apply similar fixes to games with matching problems');
  console.log('3. Run comprehensive audit after fixes');
} else {
  console.log('1. All games appear consistent with Pong fixes');
  console.log('2. Continue with normal development and testing');
}

// Save detailed report
const reportData = {
  timestamp: new Date().toISOString(),
  totalGamesChecked: gamefolders.length,
  issuesFound: issues.length,
  issues: issues,
  gamesChecked: gamefolders
};

fs.writeFileSync('cross-game-issue-report.json', JSON.stringify(reportData, null, 2));
console.log('\n💾 Detailed report saved: cross-game-issue-report.json');
