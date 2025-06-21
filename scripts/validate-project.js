#!/usr/bin/env node

/**
 * Project Validation Script for AI4Devs Retro Games
 * Validates project structure, configurations, and functionality
 * Usage: node scripts/validate-project.js
 */

const fs = require('fs');
const path = require('path');

class ProjectValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      projectStructure: { passed: 0, failed: 0, issues: [] },
      vsCodeConfig: { passed: 0, failed: 0, issues: [] },
      games: { passed: 0, failed: 0, issues: [] },
      documentation: { passed: 0, failed: 0, issues: [] },
      scripts: { passed: 0, failed: 0, issues: [] },
      overall: { score: 0, status: 'UNKNOWN' }
    };
    
    this.requiredFiles = [
      'README.md',
      'TECHNICAL_GUIDE.md',
      'package.json',
      '.vscode/settings.json',
      '.vscode/tasks.json',
      '.vscode/launch.json',
      '.vscode/extensions.json',
      '.github/copilot-instructions.md',
      'scripts/generate-template.js',
      'scripts/performance-test.js',
      'scripts/optimize-assets.js'
    ];

    this.requiredGameFiles = [
      'index.html',
      'style.css',
      'script.js',
      'README.md',
      'prompts.md'
    ];
  }

  async validateProject() {
    console.log('🔍 Starting Project Validation...\n');
    
    try {
      this.validateProjectStructure();
      this.validateVSCodeConfiguration();
      this.validateGames();
      this.validateDocumentation();
      this.validateScripts();
      
      this.calculateOverallScore();
      this.generateReport();
      this.saveResults();
      
      console.log('\n✅ Project validation completed!');
      return this.results.overall.status === 'PASS';
      
    } catch (error) {
      console.error(`❌ Validation failed: ${error.message}`);
      return false;
    }
  }

  validateProjectStructure() {
    console.log('📁 Validating Project Structure...');
    
    // Check required files exist
    this.requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.results.projectStructure.passed++;
        console.log(`   ✅ ${file}`);
      } else {
        this.results.projectStructure.failed++;
        this.results.projectStructure.issues.push(`Missing file: ${file}`);
        console.log(`   ❌ ${file} - Missing`);
      }
    });

    // Check scripts directory
    if (fs.existsSync('scripts') && fs.statSync('scripts').isDirectory()) {
      this.results.projectStructure.passed++;
      console.log('   ✅ scripts/ directory');
    } else {
      this.results.projectStructure.failed++;
      this.results.projectStructure.issues.push('Missing scripts directory');
      console.log('   ❌ scripts/ directory - Missing');
    }

    // Check .vscode directory
    if (fs.existsSync('.vscode') && fs.statSync('.vscode').isDirectory()) {
      this.results.projectStructure.passed++;
      console.log('   ✅ .vscode/ directory');
    } else {
      this.results.projectStructure.failed++;
      this.results.projectStructure.issues.push('Missing .vscode directory');
      console.log('   ❌ .vscode/ directory - Missing');
    }

    console.log('');
  }

  validateVSCodeConfiguration() {
    console.log('⚙️  Validating VS Code Configuration...');
    
    const configFiles = {
      'settings.json': this.validateSettings,
      'tasks.json': this.validateTasks,
      'launch.json': this.validateLaunch,
      'extensions.json': this.validateExtensions
    };

    Object.entries(configFiles).forEach(([file, validator]) => {
      const filePath = path.join('.vscode', file);
      if (fs.existsSync(filePath)) {
        try {
          const config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const validation = validator.call(this, config);
          
          if (validation.valid) {
            this.results.vsCodeConfig.passed++;
            console.log(`   ✅ ${file}`);
          } else {
            this.results.vsCodeConfig.failed++;
            this.results.vsCodeConfig.issues.push(`${file}: ${validation.issues.join(', ')}`);
            console.log(`   ⚠️  ${file} - ${validation.issues.join(', ')}`);
          }
        } catch (error) {
          this.results.vsCodeConfig.failed++;
          this.results.vsCodeConfig.issues.push(`${file}: Invalid JSON`);
          console.log(`   ❌ ${file} - Invalid JSON`);
        }
      } else {
        this.results.vsCodeConfig.failed++;
        this.results.vsCodeConfig.issues.push(`Missing ${file}`);
        console.log(`   ❌ ${file} - Missing`);
      }
    });

    console.log('');
  }

  validateSettings(config) {
    const issues = [];
    
    if (!config['github.copilot.enable']) {
      issues.push('GitHub Copilot not enabled');
    }
    
    if (!config['editor.formatOnSave']) {
      issues.push('Format on save not enabled');
    }
    
    if (!config['liveServer.settings.port']) {
      issues.push('Live Server port not configured');
    }

    return { valid: issues.length === 0, issues };
  }

  validateTasks(config) {
    const issues = [];
    const requiredTasks = [
      'Start Development Server',
      'Create New Game',
      'Run All Validations',
      'Performance Benchmark'
    ];

    const taskLabels = config.tasks ? config.tasks.map(t => t.label) : [];
    
    requiredTasks.forEach(task => {
      if (!taskLabels.includes(task)) {
        issues.push(`Missing task: ${task}`);
      }
    });

    return { valid: issues.length === 0, issues };
  }

  validateLaunch(config) {
    const issues = [];
    const requiredConfigs = [
      'Debug Current Game (Chrome)',
      'Debug Main Index (Chrome)',
      'Mobile Debug (Chrome)'
    ];

    const configNames = config.configurations ? config.configurations.map(c => c.name) : [];
    
    requiredConfigs.forEach(configName => {
      if (!configNames.includes(configName)) {
        issues.push(`Missing debug config: ${configName}`);
      }
    });

    return { valid: issues.length === 0, issues };
  }

  validateExtensions(config) {
    const issues = [];
    const requiredExtensions = [
      'ms-vscode.vscode-typescript-next',
      'esbenp.prettier-vscode',
      'dbaeumer.vscode-eslint',
      'ritwickdey.liveserver',
      'github.copilot'
    ];

    const recommendations = config.recommendations || [];
    
    requiredExtensions.forEach(ext => {
      if (!recommendations.includes(ext)) {
        issues.push(`Missing extension: ${ext}`);
      }
    });

    return { valid: issues.length === 0, issues };
  }

  validateGames() {
    console.log('🎮 Validating Games...');
    
    const gameDirectories = fs.readdirSync('.')
      .filter(item => {
        const itemPath = path.join('.', item);
        return fs.statSync(itemPath).isDirectory() && item.endsWith('-GG');
      });

    if (gameDirectories.length === 0) {
      this.results.games.failed++;
      this.results.games.issues.push('No game directories found');
      console.log('   ❌ No game directories found');
      console.log('');
      return;
    }

    gameDirectories.forEach(gameDir => {
      console.log(`   📂 Validating ${gameDir}...`);
      
      let gameValid = true;
      const gameIssues = [];

      // Check required files
      this.requiredGameFiles.forEach(file => {
        const filePath = path.join(gameDir, file);
        if (fs.existsSync(filePath)) {
          console.log(`      ✅ ${file}`);
        } else {
          gameValid = false;
          gameIssues.push(`Missing ${file}`);
          console.log(`      ❌ ${file} - Missing`);
        }
      });

      // Check assets directory
      const assetsPath = path.join(gameDir, 'assets');
      if (fs.existsSync(assetsPath) && fs.statSync(assetsPath).isDirectory()) {
        console.log('      ✅ assets/ directory');
      } else {
        gameIssues.push('Missing assets directory');
        console.log('      ⚠️  assets/ directory - Missing (optional)');
      }

      // Validate HTML structure
      const indexPath = path.join(gameDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        const htmlValidation = this.validateGameHTML(indexPath);
        if (!htmlValidation.valid) {
          gameValid = false;
          gameIssues.push(...htmlValidation.issues);
        }
      }

      // Validate JavaScript structure
      const scriptPath = path.join(gameDir, 'script.js');
      if (fs.existsSync(scriptPath)) {
        const jsValidation = this.validateGameJS(scriptPath);
        if (!jsValidation.valid) {
          gameValid = false;
          gameIssues.push(...jsValidation.issues);
        }
      }

      if (gameValid) {
        this.results.games.passed++;
        console.log(`      ✅ ${gameDir} validation passed`);
      } else {
        this.results.games.failed++;
        this.results.games.issues.push(`${gameDir}: ${gameIssues.join(', ')}`);
        console.log(`      ❌ ${gameDir} validation failed`);
      }
    });

    console.log('');
  }

  validateGameHTML(filePath) {
    const issues = [];
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for required elements
    if (!content.includes('<canvas')) {
      issues.push('Missing canvas element');
    }

    if (!content.includes('lang=')) {
      issues.push('Missing lang attribute');
    }

    if (!content.includes('viewport')) {
      issues.push('Missing viewport meta tag');
    }

    if (!content.includes('back-button')) {
      issues.push('Missing back navigation');
    }

    return { valid: issues.length === 0, issues };
  }

  validateGameJS(filePath) {
    const issues = [];
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for basic game structure
    if (!content.includes('class ') && !content.includes('function ')) {
      issues.push('No classes or functions found');
    }

    if (!content.includes('canvas') && !content.includes('Canvas')) {
      issues.push('No canvas usage detected');
    }

    if (!content.includes('requestAnimationFrame')) {
      issues.push('No game loop detected');
    }

    if (!content.includes('addEventListener')) {
      issues.push('No event listeners detected');
    }

    return { valid: issues.length === 0, issues };
  }

  validateDocumentation() {
    console.log('📚 Validating Documentation...');
    
    const docs = [
      { file: 'README.md', validator: this.validateMainReadme },
      { file: 'TECHNICAL_GUIDE.md', validator: this.validateTechnicalGuide },
      { file: '.github/copilot-instructions.md', validator: this.validateCopilotInstructions }
    ];

    docs.forEach(({ file, validator }) => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const validation = validator.call(this, content);
        
        if (validation.valid) {
          this.results.documentation.passed++;
          console.log(`   ✅ ${file}`);
        } else {
          this.results.documentation.failed++;
          this.results.documentation.issues.push(`${file}: ${validation.issues.join(', ')}`);
          console.log(`   ⚠️  ${file} - ${validation.issues.join(', ')}`);
        }
      } else {
        this.results.documentation.failed++;
        this.results.documentation.issues.push(`Missing ${file}`);
        console.log(`   ❌ ${file} - Missing`);
      }
    });

    console.log('');
  }

  validateMainReadme(content) {
    const issues = [];
    const requiredSections = [
      'Development Roadmap',
      'Project Metrics',
      'Developer Tools',
      'Contributing Guidelines'
    ];

    requiredSections.forEach(section => {
      if (!content.includes(section)) {
        issues.push(`Missing section: ${section}`);
      }
    });

    return { valid: issues.length === 0, issues };
  }

  validateTechnicalGuide(content) {
    const issues = [];
    const requiredSections = [
      'Advanced Game Patterns',
      'Advanced AI Systems',
      'Performance Optimization',
      'Mobile & PWA'
    ];

    requiredSections.forEach(section => {
      if (!content.includes(section)) {
        issues.push(`Missing section: ${section}`);
      }
    });

    return { valid: issues.length === 0, issues };
  }

  validateCopilotInstructions(content) {
    const issues = [];
    const requiredSections = [
      'JavaScript ES6+',
      'HTML5 Semantic',
      'CSS3 Responsive',
      'Performance & UX'
    ];

    requiredSections.forEach(section => {
      if (!content.includes(section)) {
        issues.push(`Missing section: ${section}`);
      }
    });

    return { valid: issues.length === 0, issues };
  }

  validateScripts() {
    console.log('🔧 Validating Scripts...');
    
    const scripts = [
      'generate-template.js',
      'performance-test.js',
      'optimize-assets.js',
      'validate-project.js'
    ];

    scripts.forEach(script => {
      const scriptPath = path.join('scripts', script);
      if (fs.existsSync(scriptPath)) {
        try {
          const content = fs.readFileSync(scriptPath, 'utf8');
          
          // Basic validation - check if it's a valid Node.js script
          if (content.includes('#!/usr/bin/env node') && content.includes('module.exports')) {
            this.results.scripts.passed++;
            console.log(`   ✅ ${script}`);
          } else {
            this.results.scripts.failed++;
            this.results.scripts.issues.push(`${script}: Invalid script structure`);
            console.log(`   ⚠️  ${script} - Invalid structure`);
          }
        } catch (error) {
          this.results.scripts.failed++;
          this.results.scripts.issues.push(`${script}: ${error.message}`);
          console.log(`   ❌ ${script} - ${error.message}`);
        }
      } else {
        this.results.scripts.failed++;
        this.results.scripts.issues.push(`Missing ${script}`);
        console.log(`   ❌ ${script} - Missing`);
      }
    });

    console.log('');
  }

  calculateOverallScore() {
    const categories = ['projectStructure', 'vsCodeConfig', 'games', 'documentation', 'scripts'];
    let totalPassed = 0;
    let totalTests = 0;

    categories.forEach(category => {
      totalPassed += this.results[category].passed;
      totalTests += this.results[category].passed + this.results[category].failed;
    });

    this.results.overall.score = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
    
    if (this.results.overall.score >= 90) {
      this.results.overall.status = 'EXCELLENT';
    } else if (this.results.overall.score >= 80) {
      this.results.overall.status = 'GOOD';
    } else if (this.results.overall.score >= 70) {
      this.results.overall.status = 'PASS';
    } else {
      this.results.overall.status = 'FAIL';
    }
  }

  generateReport() {
    console.log('\n📊 PROJECT VALIDATION REPORT');
    console.log('===============================');
    console.log(`🎯 Overall Score: ${this.results.overall.score}/100 (${this.results.overall.status})`);
    console.log('');
    
    const categories = [
      { key: 'projectStructure', name: 'Project Structure' },
      { key: 'vsCodeConfig', name: 'VS Code Configuration' },
      { key: 'games', name: 'Games Validation' },
      { key: 'documentation', name: 'Documentation' },
      { key: 'scripts', name: 'Scripts' }
    ];

    categories.forEach(({ key, name }) => {
      const result = this.results[key];
      const total = result.passed + result.failed;
      const percentage = total > 0 ? Math.round((result.passed / total) * 100) : 0;
      
      console.log(`📋 ${name}: ${result.passed}/${total} (${percentage}%)`);
      
      if (result.issues.length > 0) {
        result.issues.forEach(issue => {
          console.log(`   ⚠️  ${issue}`);
        });
      }
      console.log('');
    });

    if (this.results.overall.status !== 'EXCELLENT') {
      console.log('💡 IMPROVEMENT RECOMMENDATIONS');
      console.log('==============================');
      this.generateRecommendations();
    }
  }

  generateRecommendations() {
    if (this.results.projectStructure.failed > 0) {
      console.log('📁 Project Structure:');
      console.log('   - Ensure all required files are present');
      console.log('   - Create missing directories (.vscode, scripts)');
    }

    if (this.results.vsCodeConfig.failed > 0) {
      console.log('⚙️  VS Code Configuration:');
      console.log('   - Review and update VS Code configuration files');
      console.log('   - Install recommended extensions');
    }

    if (this.results.games.failed > 0) {
      console.log('🎮 Games:');
      console.log('   - Complete game implementations with all required files');
      console.log('   - Ensure proper HTML5/CSS3/JS structure');
    }

    if (this.results.documentation.failed > 0) {
      console.log('📚 Documentation:');
      console.log('   - Complete missing documentation sections');
      console.log('   - Keep documentation up to date with implementation');
    }

    if (this.results.scripts.failed > 0) {
      console.log('🔧 Scripts:');
      console.log('   - Implement missing utility scripts');
      console.log('   - Ensure scripts follow Node.js conventions');
    }
  }

  saveResults() {
    const reportPath = `validation-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }
}

// Command line usage
if (require.main === module) {
  const validator = new ProjectValidator();
  
  validator.validateProject().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Validation error:', error.message);
    process.exit(1);
  });
}

module.exports = ProjectValidator;
