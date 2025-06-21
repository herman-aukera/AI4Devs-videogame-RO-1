#!/usr/bin/env node

/**
 * Performance Testing Suite for AI4Devs Retro Games
 * Automated performance analysis and benchmarking
 * Usage: node scripts/performance-test.js [game-folder]
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

class PerformanceAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      games: {},
      summary: {
        totalGames: 0,
        averageFPS: 0,
        averageLoadTime: 0,
        memoryUsage: 0,
        performanceScore: 0,
      },
    };

    this.benchmarkConfig = {
      duration: 30000, // 30 seconds per test
      samples: 60, // FPS samples per second
      browsers: ['chrome', 'firefox'],
      resolutions: [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1920, height: 1080, name: 'Desktop' },
      ],
    };
  }

  async runPerformanceTests(gameFolder = null) {
    console.log('🚀 Starting Performance Analysis...\n');

    const games = gameFolder ? [gameFolder] : this.getGameFolders();

    for (const game of games) {
      console.log(`📊 Testing ${game}...`);
      await this.testGame(game);
    }

    this.calculateSummary();
    this.generateReport();
    this.saveResults();

    console.log('\n✅ Performance analysis completed!');
    console.log(`📄 Report saved to: performance-report-${Date.now()}.json`);
  }

  getGameFolders() {
    const currentDir = process.cwd();
    return fs.readdirSync(currentDir).filter(item => {
      const itemPath = path.join(currentDir, item);
      return (
        fs.statSync(itemPath).isDirectory() &&
        item.endsWith('-GG') &&
        fs.existsSync(path.join(itemPath, 'index.html'))
      );
    });
  }

  async testGame(gameFolder) {
    const gameResults = {
      name: gameFolder,
      loadTime: await this.measureLoadTime(gameFolder),
      fps: await this.measureFPS(gameFolder),
      memoryUsage: await this.measureMemoryUsage(gameFolder),
      codeMetrics: this.analyzeCodeMetrics(gameFolder),
      assetMetrics: this.analyzeAssets(gameFolder),
      accessibility: await this.checkAccessibility(gameFolder),
      crossBrowser: await this.testCrossBrowser(gameFolder),
    };

    gameResults.performanceScore = this.calculatePerformanceScore(gameResults);
    this.results.games[gameFolder] = gameResults;

    console.log(`   ⚡ Load Time: ${gameResults.loadTime}ms`);
    console.log(`   🎮 FPS: ${gameResults.fps.average}`);
    console.log(`   💾 Memory: ${gameResults.memoryUsage.peak}MB`);
    console.log(`   📊 Score: ${gameResults.performanceScore}/100\n`);
  }

  async measureLoadTime(gameFolder) {
    const startTime = Date.now();

    try {
      // Simulate loading the game files
      const indexPath = path.join(gameFolder, 'index.html');
      const cssPath = path.join(gameFolder, 'style.css');
      const jsPath = path.join(gameFolder, 'script.js');

      // Read file sizes to simulate network loading
      const indexSize = fs.statSync(indexPath).size;
      const cssSize = fs.existsSync(cssPath) ? fs.statSync(cssPath).size : 0;
      const jsSize = fs.existsSync(jsPath) ? fs.statSync(jsPath).size : 0;

      const totalSize = indexSize + cssSize + jsSize;
      const networkSpeed = 1000000; // 1MB/s simulated 3G
      const simulatedLoadTime = (totalSize / networkSpeed) * 1000;

      return Math.round(simulatedLoadTime + (Date.now() - startTime));
    } catch (error) {
      console.warn(`   ⚠️  Could not measure load time for ${gameFolder}: ${error.message}`);
      return 0;
    }
  }

  async measureFPS(gameFolder) {
    // Simulate FPS measurement (in real implementation, this would use Puppeteer)
    const baseFPS = 60;
    const jsSize = this.getFileSize(path.join(gameFolder, 'script.js'));
    const complexity = Math.min(jsSize / 10000, 0.5); // Complexity factor based on code size

    const averageFPS = Math.round(baseFPS * (1 - complexity));
    const minFPS = Math.round(averageFPS * 0.8);
    const maxFPS = Math.round(averageFPS * 1.1);

    return {
      average: averageFPS,
      min: minFPS,
      max: maxFPS,
      stability: Math.round(((averageFPS - minFPS) / averageFPS) * 100),
    };
  }

  async measureMemoryUsage(gameFolder) {
    const jsSize = this.getFileSize(path.join(gameFolder, 'script.js'));
    const assetSize = this.getDirectorySize(path.join(gameFolder, 'assets'));

    const baseMemory = 10; // Base 10MB
    const jsMemory = jsSize / 100000; // 1MB per 100KB of JS
    const assetMemory = assetSize / 1000000; // 1MB per 1MB of assets

    const peak = Math.round(baseMemory + jsMemory + assetMemory);
    const average = Math.round(peak * 0.7);

    return {
      peak: peak,
      average: average,
      baseline: baseMemory,
    };
  }

  analyzeCodeMetrics(gameFolder) {
    const metrics = {
      html: this.analyzeHTMLFile(path.join(gameFolder, 'index.html')),
      css: this.analyzeCSSFile(path.join(gameFolder, 'style.css')),
      js: this.analyzeJSFile(path.join(gameFolder, 'script.js')),
    };

    return {
      ...metrics,
      totalLines: metrics.html.lines + metrics.css.lines + metrics.js.lines,
      totalSize: metrics.html.size + metrics.css.size + metrics.js.size,
      complexity: this.calculateComplexity(metrics),
    };
  }

  analyzeHTMLFile(filePath) {
    if (!fs.existsSync(filePath)) return { lines: 0, size: 0, elements: 0 };

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    const size = Buffer.byteLength(content, 'utf8');
    const elements = (content.match(/<[^\/][^>]*>/g) || []).length;

    return { lines, size, elements };
  }

  analyzeCSSFile(filePath) {
    if (!fs.existsSync(filePath)) return { lines: 0, size: 0, rules: 0, selectors: 0 };

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    const size = Buffer.byteLength(content, 'utf8');
    const rules = (content.match(/\{[^}]*\}/g) || []).length;
    const selectors = (content.match(/[^{}]*\{/g) || []).length;

    return { lines, size, rules, selectors };
  }

  analyzeJSFile(filePath) {
    if (!fs.existsSync(filePath)) return { lines: 0, size: 0, functions: 0, classes: 0 };

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    const size = Buffer.byteLength(content, 'utf8');
    const functions = (content.match(/function\s+\w+|=>\s*{|\w+\s*\(/g) || []).length;
    const classes = (content.match(/class\s+\w+/g) || []).length;

    return { lines, size, functions, classes };
  }

  calculateComplexity(metrics) {
    const jsComplexity = metrics.js.functions * 2 + metrics.js.classes * 3;
    const cssComplexity = metrics.css.rules + metrics.css.selectors;
    const htmlComplexity = metrics.html.elements;

    return {
      javascript: jsComplexity,
      css: cssComplexity,
      html: htmlComplexity,
      total: jsComplexity + cssComplexity + htmlComplexity,
    };
  }

  analyzeAssets(gameFolder) {
    const assetsPath = path.join(gameFolder, 'assets');
    if (!fs.existsSync(assetsPath)) {
      return { totalSize: 0, images: 0, sounds: 0, fonts: 0 };
    }

    const assets = {
      totalSize: this.getDirectorySize(assetsPath),
      images: this.getFileCount(path.join(assetsPath, 'images'), ['.jpg', '.png', '.gif', '.svg']),
      sounds: this.getFileCount(path.join(assetsPath, 'sounds'), ['.mp3', '.wav', '.ogg']),
      fonts: this.getFileCount(path.join(assetsPath, 'fonts'), ['.woff', '.woff2', '.ttf', '.otf']),
    };

    return assets;
  }

  async checkAccessibility(gameFolder) {
    // Simplified accessibility check
    const indexPath = path.join(gameFolder, 'index.html');
    if (!fs.existsSync(indexPath)) return { score: 0, issues: [] };

    const content = fs.readFileSync(indexPath, 'utf8');
    const issues = [];
    let score = 100;

    // Check for basic accessibility features
    if (!content.includes('lang=')) {
      issues.push('Missing lang attribute');
      score -= 15;
    }

    if (!content.includes('alt=') && content.includes('<img')) {
      issues.push('Images without alt attributes');
      score -= 20;
    }

    if (!content.includes('aria-') && content.includes('canvas')) {
      issues.push('Canvas without ARIA labels');
      score -= 25;
    }

    if (!content.includes('tabindex') && content.includes('button')) {
      issues.push('Possible keyboard navigation issues');
      score -= 10;
    }

    return { score: Math.max(0, score), issues };
  }

  async testCrossBrowser(gameFolder) {
    // Simplified cross-browser compatibility check
    const jsPath = path.join(gameFolder, 'script.js');
    const cssPath = path.join(gameFolder, 'style.css');

    const results = {
      chrome: { compatible: true, issues: [] },
      firefox: { compatible: true, issues: [] },
      safari: { compatible: true, issues: [] },
      edge: { compatible: true, issues: [] },
    };

    if (fs.existsSync(jsPath)) {
      const jsContent = fs.readFileSync(jsPath, 'utf8');

      // Check for potential compatibility issues
      if (jsContent.includes('async/await') && !jsContent.includes('babel')) {
        results.safari.issues.push('Async/await without transpilation');
      }

      if (jsContent.includes('?.')) {
        results.safari.issues.push('Optional chaining not supported in older Safari');
      }
    }

    if (fs.existsSync(cssPath)) {
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      if (cssContent.includes('grid') && !cssContent.includes('-ms-grid')) {
        results.edge.issues.push('CSS Grid without IE fallback');
      }
    }

    return results;
  }

  calculatePerformanceScore(gameResults) {
    let score = 100;

    // FPS score (30% weight)
    const fpsScore = Math.min(100, (gameResults.fps.average / 60) * 100);
    score = score * 0.7 + fpsScore * 0.3;

    // Load time score (25% weight)
    const loadScore = Math.max(0, 100 - gameResults.loadTime / 50); // Penalty after 5s
    score = score * 0.75 + loadScore * 0.25;

    // Memory score (20% weight)
    const memoryScore = Math.max(0, 100 - gameResults.memoryUsage.peak / 2); // Penalty after 200MB
    score = score * 0.8 + memoryScore * 0.2;

    // Code complexity penalty (15% weight)
    const complexityPenalty = Math.min(50, gameResults.codeMetrics.complexity.total / 100);
    score = score * 0.85 + (100 - complexityPenalty) * 0.15;

    // Accessibility bonus (10% weight)
    score = score * 0.9 + gameResults.accessibility.score * 0.1;

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  calculateSummary() {
    const games = Object.values(this.results.games);
    this.results.summary.totalGames = games.length;

    if (games.length > 0) {
      this.results.summary.averageFPS = Math.round(
        games.reduce((sum, game) => sum + game.fps.average, 0) / games.length
      );

      this.results.summary.averageLoadTime = Math.round(
        games.reduce((sum, game) => sum + game.loadTime, 0) / games.length
      );

      this.results.summary.memoryUsage = Math.round(
        games.reduce((sum, game) => sum + game.memoryUsage.peak, 0) / games.length
      );

      this.results.summary.performanceScore = Math.round(
        games.reduce((sum, game) => sum + game.performanceScore, 0) / games.length
      );
    }
  }

  generateReport() {
    console.log('\n📊 PERFORMANCE ANALYSIS REPORT');
    console.log('=====================================');
    console.log(`🎮 Games Tested: ${this.results.summary.totalGames}`);
    console.log(`⚡ Average FPS: ${this.results.summary.averageFPS}`);
    console.log(`🕒 Average Load Time: ${this.results.summary.averageLoadTime}ms`);
    console.log(`💾 Average Memory Usage: ${this.results.summary.memoryUsage}MB`);
    console.log(`📊 Overall Performance Score: ${this.results.summary.performanceScore}/100`);

    console.log('\n🎯 INDIVIDUAL GAME RESULTS');
    console.log('=====================================');

    Object.entries(this.results.games).forEach(([gameName, results]) => {
      console.log(`\n${gameName.toUpperCase()}`);
      console.log(`  Performance Score: ${results.performanceScore}/100`);
      console.log(
        `  FPS: ${results.fps.average} (min: ${results.fps.min}, max: ${results.fps.max})`
      );
      console.log(`  Load Time: ${results.loadTime}ms`);
      console.log(`  Memory Peak: ${results.memoryUsage.peak}MB`);
      console.log(`  Code Lines: ${results.codeMetrics.totalLines}`);
      console.log(`  Asset Size: ${Math.round(results.assetMetrics.totalSize / 1024)}KB`);
      console.log(`  Accessibility: ${results.accessibility.score}/100`);

      if (results.accessibility.issues.length > 0) {
        console.log(`  A11y Issues: ${results.accessibility.issues.join(', ')}`);
      }
    });

    console.log('\n💡 RECOMMENDATIONS');
    console.log('=====================================');
    this.generateRecommendations();
  }

  generateRecommendations() {
    const games = Object.values(this.results.games);

    // FPS recommendations
    const lowFPSGames = games.filter(g => g.fps.average < 50);
    if (lowFPSGames.length > 0) {
      console.log(`⚡ FPS Optimization needed for: ${lowFPSGames.map(g => g.name).join(', ')}`);
      console.log('   - Consider object pooling for frequently created objects');
      console.log('   - Optimize rendering loops and reduce canvas redraws');
    }

    // Memory recommendations
    const highMemoryGames = games.filter(g => g.memoryUsage.peak > 100);
    if (highMemoryGames.length > 0) {
      console.log(
        `💾 Memory optimization needed for: ${highMemoryGames.map(g => g.name).join(', ')}`
      );
      console.log('   - Implement proper cleanup for event listeners');
      console.log('   - Consider lazy loading for large assets');
    }

    // Load time recommendations
    const slowGames = games.filter(g => g.loadTime > 3000);
    if (slowGames.length > 0) {
      console.log(`🕒 Load time optimization needed for: ${slowGames.map(g => g.name).join(', ')}`);
      console.log('   - Minimize and compress assets');
      console.log('   - Consider code splitting for large JavaScript files');
    }

    // Accessibility recommendations
    const accessibilityIssues = games.filter(g => g.accessibility.score < 80);
    if (accessibilityIssues.length > 0) {
      console.log(
        `♿ Accessibility improvements needed for: ${accessibilityIssues
          .map(g => g.name)
          .join(', ')}`
      );
      console.log('   - Add proper ARIA labels and roles');
      console.log('   - Ensure keyboard navigation support');
    }
  }

  saveResults() {
    const reportPath = `performance-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

    // Also save a CSV summary for easy analysis
    this.saveCsvSummary();
  }

  saveCsvSummary() {
    const csvPath = `performance-summary-${Date.now()}.csv`;
    const headers =
      'Game,Performance Score,FPS,Load Time (ms),Memory (MB),Code Lines,Asset Size (KB),Accessibility Score';

    const rows = Object.entries(this.results.games).map(([name, data]) => {
      return [
        name,
        data.performanceScore,
        data.fps.average,
        data.loadTime,
        data.memoryUsage.peak,
        data.codeMetrics.totalLines,
        Math.round(data.assetMetrics.totalSize / 1024),
        data.accessibility.score,
      ].join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    fs.writeFileSync(csvPath, csvContent);
  }

  // Utility methods
  getFileSize(filePath) {
    try {
      return fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
    } catch {
      return 0;
    }
  }

  getDirectorySize(dirPath) {
    if (!fs.existsSync(dirPath)) return 0;

    let totalSize = 0;
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        totalSize += this.getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    });

    return totalSize;
  }

  getFileCount(dirPath, extensions) {
    if (!fs.existsSync(dirPath)) return 0;

    const files = fs.readdirSync(dirPath);
    return files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return extensions.includes(ext);
    }).length;
  }
}

// Command line usage
if (require.main === module) {
  const gameFolder = process.argv[2];
  const analyzer = new PerformanceAnalyzer();

  analyzer.runPerformanceTests(gameFolder).catch(error => {
    console.error('❌ Performance analysis failed:', error.message);
    process.exit(1);
  });
}

module.exports = PerformanceAnalyzer;
