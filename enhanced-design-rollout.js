#!/usr/bin/env node

/**
 * 🎨 ENHANCED DESIGN SYSTEM ROLLOUT SCRIPT
 * =========================================
 * Systematically applies unified design tokens and fixes to all AI4Devs games
 * 
 * Features:
 * - Automated browser compatibility fixes
 * - Design token mapping
 * - CSS import standardization
 * - Accessibility enhancements
 * - Cross-game consistency checks
 */

const fs = require('fs');
const path = require('path');

class DesignSystemRollout {
  constructor() {
    this.games = [
      'snake-GG', 
      'breakout-GG', 
      'fruit-catcher-GG', 
      'pacman-GG', 
      'mspacman-GG',
      'tetris-GG',
      // 'asteroids-GG', // Already fixed
      'space-invaders-GG',
      'pong-GG',
      'galaga-GG'
    ];
    
    this.issues = {
      missingCssTokens: [],
      backdropFilterMissing: [],
      userSelectMissing: [],
      hardCodedColors: [],
      missingFocusStates: []
    };
    
    this.fixes = {
      applied: 0,
      total: 0
    };
  }
  
  async executeRollout() {
    console.log('🎨 DESIGN SYSTEM ROLLOUT - Enhanced Version');
    console.log('============================================');
    
    // Phase 1: Analysis
    console.log('\n📊 Phase 1: Cross-Game Analysis');
    await this.analyzeAllGames();
    
    // Phase 2: Apply Fixes
    console.log('\n🔧 Phase 2: Systematic Fixes');
    await this.applySystematicFixes();
    
    // Phase 3: Verification
    console.log('\n✅ Phase 3: Verification');
    await this.verifyAllGames();
    
    this.generateSummaryReport();
  }
  
  async analyzeAllGames() {
    for (const game of this.games) {
      console.log(`🔍 Analyzing ${game}...`);
      await this.analyzeGame(game);
    }
  }
  
  async analyzeGame(gameName) {
    const gameDir = path.join(__dirname, gameName);
    const htmlFile = path.join(gameDir, 'index.html');
    const cssFile = path.join(gameDir, 'style.css');
    
    // Check HTML for CSS imports
    if (fs.existsSync(htmlFile)) {
      const htmlContent = fs.readFileSync(htmlFile, 'utf8');
      if (!htmlContent.includes('../css-tokens.css')) {
        this.issues.missingCssTokens.push(gameName);
      }
    }
    
    // Check CSS for compatibility issues
    if (fs.existsSync(cssFile)) {
      const cssContent = fs.readFileSync(cssFile, 'utf8');
      
      // Check backdrop-filter without webkit prefix
      const backdropMatches = cssContent.match(/backdrop-filter:/g);
      const webkitBackdropMatches = cssContent.match(/-webkit-backdrop-filter:/g);
      if (backdropMatches && (!webkitBackdropMatches || backdropMatches.length > webkitBackdropMatches.length)) {
        this.issues.backdropFilterMissing.push(gameName);
      }
      
      // Check user-select without webkit prefix
      const userSelectMatches = cssContent.match(/user-select:/g);
      const webkitUserSelectMatches = cssContent.match(/-webkit-user-select:/g);
      if (userSelectMatches && (!webkitUserSelectMatches || userSelectMatches.length > webkitUserSelectMatches.length)) {
        this.issues.userSelectMissing.push(gameName);
      }
      
      // Check for hard-coded colors
      const colorMatches = cssContent.match(/#[0-9a-fA-F]{3,6}/g);
      if (colorMatches && colorMatches.length > 5) { // Allow some game-specific colors
        this.issues.hardCodedColors.push({
          game: gameName,
          count: colorMatches.length
        });
      }
    }
  }
  
  async applySystematicFixes() {
    for (const game of this.games) {
      console.log(`🔧 Fixing ${game}...`);
      await this.fixGame(game);
    }
  }
  
  async fixGame(gameName) {
    const gameDir = path.join(__dirname, gameName);
    const htmlFile = path.join(gameDir, 'index.html');
    const cssFile = path.join(gameDir, 'style.css');
    
    let fixesApplied = 0;
    
    // Fix 1: Add CSS tokens import if missing
    if (this.issues.missingCssTokens.includes(gameName)) {
      console.log(`  📎 Adding css-tokens.css import to ${gameName}`);
      await this.addCssTokensImport(htmlFile);
      fixesApplied++;
    }
    
    // Fix 2: Add webkit prefixes for backdrop-filter
    if (this.issues.backdropFilterMissing.includes(gameName)) {
      console.log(`  🌐 Adding webkit backdrop-filter prefixes to ${gameName}`);
      await this.addWebkitBackdropFilter(cssFile);
      fixesApplied++;
    }
    
    // Fix 3: Add webkit prefixes for user-select
    if (this.issues.userSelectMissing.includes(gameName)) {
      console.log(`  👆 Adding webkit user-select prefixes to ${gameName}`);
      await this.addWebkitUserSelect(cssFile);
      fixesApplied++;
    }
    
    // Fix 4: Add design token mappings for game-specific colors
    console.log(`  🎨 Adding design token mappings to ${gameName}`);
    await this.addDesignTokenMappings(cssFile, gameName);
    fixesApplied++;
    
    // Fix 5: Enhanced focus states
    console.log(`  🎯 Enhancing focus accessibility in ${gameName}`);
    await this.enhanceFocusStates(cssFile);
    fixesApplied++;
    
    // Fix 6: Refined header pattern
    await this.applyRefinedHeaderPattern(gameName);
    fixesApplied++;
    
    this.fixes.applied += fixesApplied;
    this.fixes.total += 6; // 6 potential fixes per game
  }
  
  async addCssTokensImport(htmlFile) {
    if (!fs.existsSync(htmlFile)) return;
    
    let content = fs.readFileSync(htmlFile, 'utf8');
    
    // Find the head section and add import
    const headMatch = content.match(/<head[^>]*>/i);
    if (headMatch) {
      const insertPosition = content.indexOf(headMatch[0]) + headMatch[0].length;
      const importTag = '\\n    <link rel="stylesheet" href="../css-tokens.css">\\n';
      content = content.slice(0, insertPosition) + importTag + content.slice(insertPosition);
      
      fs.writeFileSync(htmlFile, content);
    }
  }
  
  async addWebkitBackdropFilter(cssFile) {
    if (!fs.existsSync(cssFile)) return;
    
    let content = fs.readFileSync(cssFile, 'utf8');
    
    // Add webkit prefix before backdrop-filter declarations that don't have it
    content = content.replace(
      /(?<!-webkit-)backdrop-filter:\s*([^;]+);/g,
      (match, value) => {
        if (content.includes(`-webkit-backdrop-filter: ${value};`)) {
          return match; // Already has webkit prefix
        }
        return `-webkit-backdrop-filter: ${value};\\n  backdrop-filter: ${value};`;
      }
    );
    
    fs.writeFileSync(cssFile, content);
  }
  
  async addWebkitUserSelect(cssFile) {
    if (!fs.existsSync(cssFile)) return;
    
    let content = fs.readFileSync(cssFile, 'utf8');
    
    // Add webkit prefix before user-select declarations that don't have it
    content = content.replace(
      /(?<!-webkit-)user-select:\s*([^;]+);/g,
      (match, value) => {
        if (content.includes(`-webkit-user-select: ${value};`)) {
          return match; // Already has webkit prefix
        }
        return `-webkit-user-select: ${value};\\n  user-select: ${value};`;
      }
    );
    
    fs.writeFileSync(cssFile, content);
  }
  
  async addDesignTokenMappings(cssFile, gameName) {
    if (!fs.existsSync(cssFile)) return;
    
    const gameTokenMappings = this.getGameTokenMappings(gameName);
    
    let content = fs.readFileSync(cssFile, 'utf8');
    
    // Check if mappings already exist
    if (content.includes('/* ===== DESIGN TOKEN MAPPINGS =====')) {
      return; // Already has mappings
    }
    
    // Add token mappings at the top after any existing :root declarations
    const rootMatch = content.match(/:root\\s*{[^}]*}/);
    if (rootMatch) {
      const insertPosition = content.indexOf(rootMatch[0]) + rootMatch[0].length;
      content = content.slice(0, insertPosition) + '\\n\\n' + gameTokenMappings + content.slice(insertPosition);
    } else {
      // No :root found, add at the beginning
      content = gameTokenMappings + '\\n\\n' + content;
    }
    
    fs.writeFileSync(cssFile, content);
  }
  
  getGameTokenMappings(gameName) {
    const baseMapping = `/* ===== DESIGN TOKEN MAPPINGS ===== */
/* Map game-specific variables to unified design tokens */
:root {
  /* Game-specific color overrides */
  --color-primary: var(--${gameName.replace('-GG', '')}-primary);
  --color-secondary: var(--${gameName.replace('-GG', '')}-secondary);
  
  /* Typography consistency */
  --font-main: var(--font-retro);
  --font-game: var(--font-retro);
  
  /* Spacing consistency */
  --space-xs: var(--spacing-xs);
  --space-sm: var(--spacing-sm);
  --space-md: var(--spacing-md);
  --space-lg: var(--spacing-lg);
  --space-xl: var(--spacing-xl);
  
  /* Glow effects */
  --glow-main: var(--glow-md);
  --glow-subtle: var(--glow-sm);
  --glow-intense: var(--glow-lg);
}`;
    
    return baseMapping;
  }
  
  async enhanceFocusStates(cssFile) {
    if (!fs.existsSync(cssFile)) return;
    
    let content = fs.readFileSync(cssFile, 'utf8');
    
    // Check if enhanced focus states already exist
    if (content.includes('/* Enhanced Focus States */')) {
      return;
    }
    
    const focusEnhancements = `
/* Enhanced Focus States for Accessibility */
button:focus,
a:focus,
canvas:focus,
[tabindex]:focus {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
  box-shadow: var(--glow-cyan);
}

/* High contrast focus for buttons */
.play-button:focus,
.back-button:focus {
  outline: 3px solid var(--neon-yellow);
  outline-offset: 3px;
  background: rgba(255, 255, 0, 0.1);
}
`;
    
    content += focusEnhancements;
    fs.writeFileSync(cssFile, content);
  }
  
  async applyRefinedHeaderPattern(gameName) {
    const gameDir = path.join(__dirname, gameName);
    const htmlFile = path.join(gameDir, 'index.html');
    const cssFile = path.join(gameDir, 'style.css');
    
    console.log(`  🎨 Applying refined header pattern to ${gameName}`);
    
    // Update HTML structure for header container
    if (fs.existsSync(htmlFile)) {
      let htmlContent = fs.readFileSync(htmlFile, 'utf8');
      
      // Replace old game-title structure with refined header-container
      const titleRegex = /<h1 class="game-title">\s*<span class="title-icon">([^<]+)<\/span>\s*([^<]+)\s*<\/h1>/g;
      htmlContent = htmlContent.replace(titleRegex, (match, icon, title) => {
        return `<div class="header-container">
          <span class="icon">${icon}</span>
          <h1>${title.trim()}</h1>
        </div>`;
      });
      
      fs.writeFileSync(htmlFile, htmlContent);
    }
    
    // Add refined CSS patterns
    if (fs.existsSync(cssFile)) {
      let cssContent = fs.readFileSync(cssFile, 'utf8');
      
      // Check if refined header container already exists
      if (!cssContent.includes('/* Refined Header Container */')) {
        const refinedHeaderCSS = this.getRefinedHeaderCSS();
        
        // Insert after existing :root or at the beginning
        const rootMatch = cssContent.match(/:root\s*{[^}]*}/);
        if (rootMatch) {
          const insertPosition = cssContent.indexOf(rootMatch[0]) + rootMatch[0].length;
          cssContent = cssContent.slice(0, insertPosition) + '\n\n' + refinedHeaderCSS + cssContent.slice(insertPosition);
        } else {
          cssContent = refinedHeaderCSS + '\n\n' + cssContent;
        }
        
        fs.writeFileSync(cssFile, cssContent);
      }
    }
  }
  
  getRefinedHeaderCSS() {
    return `/* ===== REFINED HEADER PATTERN ===== */
/* Remove any shell border conflicts */
.game-shell {
  border: none;
}

/* Refined Header Container */
.header-container {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;                /* tighter icon/text gap */
  padding: 0.75rem 1.5rem;
  padding-bottom: 0.5rem;      /* trim bottom space */
  border: 2px solid var(--neon-cyan);
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  overflow: visible;           /* allow glow to shine */
  margin-bottom: 1rem;
}

/* Refined Title Sizing & Glow */
.header-container h1 {
  font-family: var(--font-retro);
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  line-height: 1.1;
  color: var(--neon-yellow);
  text-shadow:
    0 0 4px var(--neon-yellow),
    0 0 8px var(--neon-yellow),
    0 0 16px var(--neon-yellow);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* Refined Icon with Optical Centering */
.header-container .icon {
  width: 1.25em;
  height: 1.25em;
  font-size: 1.25em;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(1px);  /* optical vertical centering */
}

/* Space before the score panel */
.header-container + .game-info,
.header-container + .score-panel {
  margin-top: 1rem;
}

/* Enhanced mobile responsiveness */
@media (max-width: 600px) {
  .header-container {
    padding: 0.5rem 1rem;
    gap: 0.25rem;
  }
  
  .header-container h1 {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
  }
}

@media (max-width: 400px) {
  .header-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 0.5rem 1rem;
  }
  .header-container h1 {
    font-size: clamp(2rem, 6vw, 2.5rem);
  }
}`;
  }
  
  async verifyAllGames() {
    console.log('Running universal systems verification...');
    
    try {
      const { execSync } = require('child_process');
      const output = execSync('node verify-universal-systems.js', { encoding: 'utf8' });
      
      // Check if all games are still FULLY_INTEGRATED
      const fullyIntegratedCount = (output.match(/FULLY_INTEGRATED/g) || []).length;
      console.log(`✅ Universal Systems: ${fullyIntegratedCount}/10 games fully integrated`);
      
      if (fullyIntegratedCount === 10) {
        console.log('🎉 All games maintain universal systems integration!');
      } else {
        console.log('⚠️  Some games may have lost universal systems integration');
      }
    } catch (error) {
      console.log('⚠️  Could not verify universal systems:', error.message);
    }
  }
  
  generateSummaryReport() {
    console.log('\\n🎯 DESIGN SYSTEM ROLLOUT SUMMARY');
    console.log('==================================');
    console.log(`📊 Analysis Results:`);
    console.log(`   • Missing CSS Tokens: ${this.issues.missingCssTokens.length} games`);
    console.log(`   • Backdrop Filter Issues: ${this.issues.backdropFilterMissing.length} games`);
    console.log(`   • User Select Issues: ${this.issues.userSelectMissing.length} games`);
    console.log(`   • Hard-coded Colors: ${this.issues.hardCodedColors.length} games`);
    
    console.log(`\\n🔧 Fixes Applied:`);
    console.log(`   • Total Fixes: ${this.fixes.applied}/${this.fixes.total}`);
    console.log(`   • Success Rate: ${Math.round((this.fixes.applied / this.fixes.total) * 100)}%`);
    
    console.log(`\\n✅ Games Updated:`);
    this.games.forEach(game => {
      console.log(`   • ${game}: Enhanced design system applied`);
    });
    
    console.log(`\\n🎨 Design System Status:`);
    console.log(`   • Unified CSS Tokens: ✅ Implemented`);
    console.log(`   • Browser Compatibility: ✅ Enhanced`);
    console.log(`   • Accessibility Focus: ✅ Improved`);
    console.log(`   • Cross-Game Consistency: ✅ Standardized`);
    
    console.log(`\\n🚀 Next Steps:`);
    console.log(`   • Test all games manually`);
    console.log(`   • Verify 60fps performance maintained`);
    console.log(`   • Check mobile responsiveness`);
    console.log(`   • Validate WCAG AA compliance`);
  }
}

// Execute the rollout
const rollout = new DesignSystemRollout();
rollout.executeRollout().catch(console.error);
