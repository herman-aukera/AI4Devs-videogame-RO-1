#!/usr/bin/env node
/* © GG, MIT License */
/* ==============================================
   AI4Devs Retro Games - UX/UI Harmonization Validator
   Tests consistency across the entire collection
   ============================================== */

const fs = require('fs');
const path = require('path');

class GameHarmonizationValidator {
  constructor() {
    this.results = [];
    this.games = [];
    this.issues = [];
    this.basePath = process.cwd();
  }

  async validate() {
    console.log('🔍 AI4Devs Retro Games - UX/UI Harmonization Validator');
    console.log('=====================================================\n');

    this.scanGameFolders();
    this.validateDesignTokens();
    this.validateTypography();
    this.validateColorConsistency();
    this.validateLayoutPatterns();
    this.validateAccessibility();
    this.validateResponsiveDesign();
    
    this.generateReport();
  }

  scanGameFolders() {
    console.log('📁 Scanning game folders...');
    
    const items = fs.readdirSync(this.basePath);
    this.games = items.filter(item => {
      return item.endsWith('-GG') && 
             fs.statSync(path.join(this.basePath, item)).isDirectory();
    });

    console.log(`   Found ${this.games.length} games: ${this.games.join(', ')}\n`);
  }

  validateDesignTokens() {
    console.log('🎨 Validating design token consistency...');
    
    const tokenFile = path.join(this.basePath, 'css-tokens.css');
    const sharedStylesFile = path.join(this.basePath, 'shared-styles.css');
    
    // Check if unified token files exist
    const hasTokens = fs.existsSync(tokenFile);
    const hasSharedStyles = fs.existsSync(sharedStylesFile);
    
    this.results.push({
      category: 'Design Tokens',
      test: 'Unified Token File Exists',
      status: hasTokens ? 'PASS' : 'FAIL',
      details: hasTokens ? 'css-tokens.css found' : 'css-tokens.css missing'
    });

    this.results.push({
      category: 'Design Tokens',
      test: 'Shared Styles File Exists',
      status: hasSharedStyles ? 'PASS' : 'FAIL',
      details: hasSharedStyles ? 'shared-styles.css found' : 'shared-styles.css missing'
    });

    // Check if games import the token system
    let gamesUsingTokens = 0;
    this.games.forEach(game => {
      const htmlFile = path.join(this.basePath, game, 'index.html');
      if (fs.existsSync(htmlFile)) {
        const content = fs.readFileSync(htmlFile, 'utf8');
        if (content.includes('css-tokens.css')) {
          gamesUsingTokens++;
        }
      }
    });

    this.results.push({
      category: 'Design Tokens',
      test: 'Games Using Token System',
      status: gamesUsingTokens === this.games.length ? 'PASS' : 'PARTIAL',
      details: `${gamesUsingTokens}/${this.games.length} games using tokens`
    });

    console.log(`   ✅ Design tokens: ${gamesUsingTokens}/${this.games.length} games harmonized\n`);
  }

  validateTypography() {
    console.log('📝 Validating typography consistency...');
    
    const fontPatterns = [];
    let gamesWithConsistentFonts = 0;

    this.games.forEach(game => {
      const cssFile = path.join(this.basePath, game, 'style.css');
      if (fs.existsSync(cssFile)) {
        const content = fs.readFileSync(cssFile, 'utf8');
        
        // Check for unified font usage
        if (content.includes('var(--font-retro)') || content.includes('Press Start 2P')) {
          gamesWithConsistentFonts++;
        }

        // Extract font family declarations
        const fontMatches = content.match(/font-family:\s*([^;]+)/g);
        if (fontMatches) {
          fontPatterns.push(...fontMatches);
        }
      }
    });

    this.results.push({
      category: 'Typography',
      test: 'Consistent Font Stack',
      status: gamesWithConsistentFonts >= this.games.length * 0.8 ? 'PASS' : 'FAIL',
      details: `${gamesWithConsistentFonts}/${this.games.length} games using consistent fonts`
    });

    console.log(`   ✅ Typography: ${gamesWithConsistentFonts}/${this.games.length} games harmonized\n`);
  }

  validateColorConsistency() {
    console.log('🌈 Validating color palette consistency...');
    
    const standardColors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00'];
    let gamesWithStandardColors = 0;

    this.games.forEach(game => {
      const cssFile = path.join(this.basePath, game, 'style.css');
      if (fs.existsSync(cssFile)) {
        const content = fs.readFileSync(cssFile, 'utf8');
        
        // Check for neon color usage
        const hasStandardColors = standardColors.some(color => 
          content.includes(color) || content.includes('--neon-')
        );
        
        if (hasStandardColors) {
          gamesWithStandardColors++;
        }
      }
    });

    this.results.push({
      category: 'Color Palette',
      test: 'Standard Neon Colors',
      status: gamesWithStandardColors >= this.games.length * 0.9 ? 'PASS' : 'FAIL',
      details: `${gamesWithStandardColors}/${this.games.length} games using standard palette`
    });

    console.log(`   ✅ Color palette: ${gamesWithStandardColors}/${this.games.length} games harmonized\n`);
  }

  validateLayoutPatterns() {
    console.log('📐 Validating layout pattern consistency...');
    
    let gamesWithStandardLayout = 0;
    const requiredElements = ['canvas', 'nav', 'main'];

    this.games.forEach(game => {
      const htmlFile = path.join(this.basePath, game, 'index.html');
      if (fs.existsSync(htmlFile)) {
        const content = fs.readFileSync(htmlFile, 'utf8');
        
        const hasRequiredElements = requiredElements.every(element => 
          content.includes(`<${element}`) || content.includes(`class="${element}`)
        );
        
        if (hasRequiredElements) {
          gamesWithStandardLayout++;
        }
      }
    });

    this.results.push({
      category: 'Layout Patterns',
      test: 'Standard Layout Structure',
      status: gamesWithStandardLayout >= this.games.length * 0.8 ? 'PASS' : 'FAIL',
      details: `${gamesWithStandardLayout}/${this.games.length} games with standard layout`
    });

    console.log(`   ✅ Layout patterns: ${gamesWithStandardLayout}/${this.games.length} games harmonized\n`);
  }

  validateAccessibility() {
    console.log('♿ Validating accessibility features...');
    
    let gamesWithA11y = 0;
    const a11yFeatures = ['aria-label', 'lang="es"', 'tabindex'];

    this.games.forEach(game => {
      const htmlFile = path.join(this.basePath, game, 'index.html');
      if (fs.existsSync(htmlFile)) {
        const content = fs.readFileSync(htmlFile, 'utf8');
        
        const hasA11yFeatures = a11yFeatures.some(feature => 
          content.includes(feature)
        );
        
        if (hasA11yFeatures) {
          gamesWithA11y++;
        }
      }
    });

    this.results.push({
      category: 'Accessibility',
      test: 'Accessibility Features',
      status: gamesWithA11y >= this.games.length * 0.9 ? 'PASS' : 'FAIL',
      details: `${gamesWithA11y}/${this.games.length} games with accessibility features`
    });

    console.log(`   ✅ Accessibility: ${gamesWithA11y}/${this.games.length} games compliant\n`);
  }

  validateResponsiveDesign() {
    console.log('📱 Validating responsive design patterns...');
    
    let gamesWithResponsive = 0;

    this.games.forEach(game => {
      const cssFile = path.join(this.basePath, game, 'style.css');
      if (fs.existsSync(cssFile)) {
        const content = fs.readFileSync(cssFile, 'utf8');
        
        // Check for responsive patterns
        const hasMediaQueries = content.includes('@media');
        const hasFlexbox = content.includes('display: flex') || content.includes('display:flex');
        const hasViewportUnits = content.includes('100vw') || content.includes('100vh');
        
        if (hasMediaQueries || hasFlexbox || hasViewportUnits) {
          gamesWithResponsive++;
        }
      }
    });

    this.results.push({
      category: 'Responsive Design',
      test: 'Mobile-Responsive Patterns',
      status: gamesWithResponsive >= this.games.length * 0.8 ? 'PASS' : 'FAIL',
      details: `${gamesWithResponsive}/${this.games.length} games with responsive design`
    });

    console.log(`   ✅ Responsive design: ${gamesWithResponsive}/${this.games.length} games optimized\n`);
  }

  generateReport() {
    console.log('📊 HARMONIZATION VALIDATION REPORT');
    console.log('==================================\n');

    const categories = [...new Set(this.results.map(r => r.category))];
    
    categories.forEach(category => {
      console.log(`🔍 ${category}:`);
      const categoryResults = this.results.filter(r => r.category === category);
      
      categoryResults.forEach(result => {
        const icon = result.status === 'PASS' ? '✅' : 
                    result.status === 'PARTIAL' ? '⚠️' : '❌';
        console.log(`   ${icon} ${result.test}: ${result.details}`);
      });
      console.log('');
    });

    // Summary
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const partialTests = this.results.filter(r => r.status === 'PARTIAL').length;
    const failedTests = this.results.filter(r => r.status === 'FAIL').length;

    console.log('📈 SUMMARY:');
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   ✅ Passed: ${passedTests}`);
    console.log(`   ⚠️ Partial: ${partialTests}`);
    console.log(`   ❌ Failed: ${failedTests}`);
    console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%\n`);

    // Overall status
    const overallStatus = passedTests >= totalTests * 0.8 ? 'EXCELLENT' :
                          passedTests >= totalTests * 0.6 ? 'GOOD' :
                          passedTests >= totalTests * 0.4 ? 'NEEDS_IMPROVEMENT' : 'CRITICAL';
    
    console.log(`🏆 OVERALL HARMONIZATION STATUS: ${overallStatus}`);
    
    if (overallStatus === 'EXCELLENT') {
      console.log('🎉 Games collection is well harmonized!');
    } else if (overallStatus === 'GOOD') {
      console.log('👍 Good harmonization with minor improvements needed.');
    } else {
      console.log('⚠️ Significant harmonization work required.');
    }

    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalGames: this.games.length,
        totalTests,
        passedTests,
        partialTests,
        failedTests,
        successRate: Math.round((passedTests / totalTests) * 100),
        overallStatus
      },
      results: this.results,
      games: this.games
    };

    const reportFile = `harmonization-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
    console.log(`\n💾 Detailed report saved: ${reportFile}`);
  }
}

// Run validation
if (require.main === module) {
  const validator = new GameHarmonizationValidator();
  validator.validate().catch(console.error);
}

module.exports = GameHarmonizationValidator;
