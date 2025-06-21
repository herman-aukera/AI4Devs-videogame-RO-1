#!/usr/bin/env node

/**
 * Asset Optimization Script for AI4Devs Retro Games
 * Optimizes images, audio files, and other game assets
 * Usage: node scripts/optimize-assets.js [game-folder]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AssetOptimizer {
  constructor() {
    this.optimizationResults = {
      timestamp: new Date().toISOString(),
      games: {},
      totalSaved: 0,
      summary: {
        imagesOptimized: 0,
        audioOptimized: 0,
        fontsOptimized: 0,
        originalSize: 0,
        optimizedSize: 0,
        compressionRatio: 0
      }
    };

    this.supportedFormats = {
      images: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'],
      audio: ['.mp3', '.wav', '.ogg', '.m4a'],
      fonts: ['.ttf', '.otf', '.woff', '.woff2']
    };

    this.optimizationSettings = {
      images: {
        jpeg: { quality: 85, progressive: true },
        png: { quality: 90, strip: true },
        webp: { quality: 80, lossless: false },
        svg: { removeComments: true, removeMetadata: true }
      },
      audio: {
        mp3: { bitrate: 128, stereo: true },
        ogg: { quality: 6 },
        wav: { bitrate: 16 }
      }
    };
  }

  async optimizeAssets(gameFolder = null) {
    console.log('🎨 Starting Asset Optimization...\n');

    try {
      this.checkDependencies();
      
      const games = gameFolder ? [gameFolder] : this.getGameFolders();
      
      for (const game of games) {
        console.log(`📁 Optimizing assets for ${game}...`);
        await this.optimizeGameAssets(game);
      }

      this.calculateSummary();
      this.generateReport();
      this.saveResults();

      console.log('\n✅ Asset optimization completed!');
      console.log(`💾 Total space saved: ${this.formatBytes(this.optimizationResults.totalSaved)}`);

    } catch (error) {
      console.error(`❌ Optimization failed: ${error.message}`);
      if (error.message.includes('dependencies')) {
        this.showDependencyInstructions();
      }
      process.exit(1);
    }
  }

  checkDependencies() {
    const dependencies = [
      { command: 'imagemin', package: 'imagemin-cli', description: 'Image optimization' },
      { command: 'ffmpeg', package: 'ffmpeg', description: 'Audio optimization' }
    ];

    const missing = [];
    
    dependencies.forEach(dep => {
      try {
        execSync(`which ${dep.command}`, { stdio: 'ignore' });
      } catch {
        missing.push(dep);
      }
    });

    if (missing.length > 0) {
      throw new Error(`Missing dependencies: ${missing.map(d => d.command).join(', ')}`);
    }
  }

  showDependencyInstructions() {
    console.log('\n📦 DEPENDENCY INSTALLATION INSTRUCTIONS');
    console.log('=========================================');
    console.log('Install the following tools for full optimization:');
    console.log('');
    console.log('# Image optimization (imagemin)');
    console.log('npm install -g imagemin-cli imagemin-pngquant imagemin-mozjpeg');
    console.log('');
    console.log('# Audio optimization (ffmpeg)');
    console.log('# macOS: brew install ffmpeg');
    console.log('# Ubuntu: sudo apt install ffmpeg');
    console.log('# Windows: Download from https://ffmpeg.org/');
    console.log('');
    console.log('# Alternative: Run optimization without these tools (limited features)');
    console.log('node scripts/optimize-assets.js --basic');
  }

  getGameFolders() {
    const currentDir = process.cwd();
    return fs.readdirSync(currentDir)
      .filter(item => {
        const itemPath = path.join(currentDir, item);
        return fs.statSync(itemPath).isDirectory() && 
               item.endsWith('-GG') &&
               fs.existsSync(path.join(itemPath, 'assets'));
      });
  }

  async optimizeGameAssets(gameFolder) {
    const assetsPath = path.join(gameFolder, 'assets');
    if (!fs.existsSync(assetsPath)) {
      console.log(`   ⚠️  No assets folder found in ${gameFolder}`);
      return;
    }

    const gameResults = {
      name: gameFolder,
      images: await this.optimizeImages(path.join(assetsPath, 'images')),
      audio: await this.optimizeAudio(path.join(assetsPath, 'sounds')),
      fonts: await this.optimizeFonts(path.join(assetsPath, 'fonts')),
      originalSize: 0,
      optimizedSize: 0,
      spaceSaved: 0
    };

    // Calculate totals for this game
    ['images', 'audio', 'fonts'].forEach(type => {
      gameResults.originalSize += gameResults[type].originalSize;
      gameResults.optimizedSize += gameResults[type].optimizedSize;
    });
    
    gameResults.spaceSaved = gameResults.originalSize - gameResults.optimizedSize;
    this.optimizationResults.games[gameFolder] = gameResults;

    console.log(`   💾 Space saved: ${this.formatBytes(gameResults.spaceSaved)}`);
    console.log(`   📊 Compression: ${this.getCompressionRatio(gameResults)}%\n`);
  }

  async optimizeImages(imagesPath) {
    const results = {
      processed: 0,
      originalSize: 0,
      optimizedSize: 0,
      formats: {}
    };

    if (!fs.existsSync(imagesPath)) {
      return results;
    }

    const imageFiles = this.getFilesByExtensions(imagesPath, this.supportedFormats.images);
    
    console.log(`   🖼️  Processing ${imageFiles.length} images...`);

    for (const file of imageFiles) {
      const filePath = path.join(imagesPath, file);
      const originalSize = fs.statSync(filePath).size;
      results.originalSize += originalSize;

      try {
        const optimizedSize = await this.optimizeImage(filePath);
        results.optimizedSize += optimizedSize;
        results.processed++;

        const ext = path.extname(file).toLowerCase();
        if (!results.formats[ext]) {
          results.formats[ext] = { count: 0, saved: 0 };
        }
        results.formats[ext].count++;
        results.formats[ext].saved += (originalSize - optimizedSize);

      } catch (error) {
        console.warn(`     ⚠️  Failed to optimize ${file}: ${error.message}`);
        results.optimizedSize += originalSize; // No optimization, keep original size
      }
    }

    return results;
  }

  async optimizeImage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const backupPath = filePath + '.backup';
    
    // Create backup
    fs.copyFileSync(filePath, backupPath);

    try {
      switch (ext) {
        case '.jpg':
        case '.jpeg':
          await this.optimizeJpeg(filePath);
          break;
        case '.png':
          await this.optimizePng(filePath);
          break;
        case '.svg':
          await this.optimizeSvg(filePath);
          break;
        case '.webp':
          // WebP is already optimized, just verify
          break;
        default:
          console.warn(`     ⚠️  Unsupported image format: ${ext}`);
      }

      const optimizedSize = fs.statSync(filePath).size;
      
      // If optimization made file larger, restore backup
      const originalSize = fs.statSync(backupPath).size;
      if (optimizedSize > originalSize) {
        fs.copyFileSync(backupPath, filePath);
        fs.unlinkSync(backupPath);
        return originalSize;
      }

      // Remove backup
      fs.unlinkSync(backupPath);
      return optimizedSize;

    } catch (error) {
      // Restore backup on error
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, filePath);
        fs.unlinkSync(backupPath);
      }
      throw error;
    }
  }

  async optimizeJpeg(filePath) {
    const { quality, progressive } = this.optimizationSettings.images.jpeg;
    const cmd = `imagemin "${filePath}" --plugin=mozjpeg --plugin.mozjpeg.quality=${quality} ${progressive ? '--plugin.mozjpeg.progressive' : ''} > "${filePath}.tmp"`;
    
    try {
      execSync(cmd, { stdio: 'ignore' });
      fs.renameSync(filePath + '.tmp', filePath);
    } catch (error) {
      if (fs.existsSync(filePath + '.tmp')) {
        fs.unlinkSync(filePath + '.tmp');
      }
      throw new Error(`JPEG optimization failed: ${error.message}`);
    }
  }

  async optimizePng(filePath) {
    const { quality, strip } = this.optimizationSettings.images.png;
    const cmd = `imagemin "${filePath}" --plugin=pngquant --plugin.pngquant.quality=0.6-${quality/100} ${strip ? '--plugin.pngquant.strip' : ''} > "${filePath}.tmp"`;
    
    try {
      execSync(cmd, { stdio: 'ignore' });
      fs.renameSync(filePath + '.tmp', filePath);
    } catch (error) {
      if (fs.existsSync(filePath + '.tmp')) {
        fs.unlinkSync(filePath + '.tmp');
      }
      throw new Error(`PNG optimization failed: ${error.message}`);
    }
  }

  async optimizeSvg(filePath) {
    // Basic SVG optimization by removing comments and unnecessary whitespace
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove comments
    content = content.replace(/<!--[\s\S]*?-->/g, '');
    
    // Remove unnecessary whitespace
    content = content.replace(/>\s+</g, '><');
    content = content.replace(/\s+/g, ' ');
    content = content.trim();
    
    fs.writeFileSync(filePath, content, 'utf8');
  }

  async optimizeAudio(audioPath) {
    const results = {
      processed: 0,
      originalSize: 0,
      optimizedSize: 0,
      formats: {}
    };

    if (!fs.existsSync(audioPath)) {
      return results;
    }

    const audioFiles = this.getFilesByExtensions(audioPath, this.supportedFormats.audio);
    
    console.log(`   🔊 Processing ${audioFiles.length} audio files...`);

    for (const file of audioFiles) {
      const filePath = path.join(audioPath, file);
      const originalSize = fs.statSync(filePath).size;
      results.originalSize += originalSize;

      try {
        const optimizedSize = await this.optimizeAudioFile(filePath);
        results.optimizedSize += optimizedSize;
        results.processed++;

        const ext = path.extname(file).toLowerCase();
        if (!results.formats[ext]) {
          results.formats[ext] = { count: 0, saved: 0 };
        }
        results.formats[ext].count++;
        results.formats[ext].saved += (originalSize - optimizedSize);

      } catch (error) {
        console.warn(`     ⚠️  Failed to optimize ${file}: ${error.message}`);
        results.optimizedSize += originalSize;
      }
    }

    return results;
  }

  async optimizeAudioFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const backupPath = filePath + '.backup';
    const tempPath = filePath + '.tmp';
    
    // Create backup
    fs.copyFileSync(filePath, backupPath);

    try {
      let cmd;
      
      switch (ext) {
        case '.mp3':
          const { bitrate, stereo } = this.optimizationSettings.audio.mp3;
          cmd = `ffmpeg -i "${filePath}" -b:a ${bitrate}k ${stereo ? '-ac 2' : '-ac 1'} "${tempPath}" -y`;
          break;
        case '.wav':
          const { bitrate: wavBitrate } = this.optimizationSettings.audio.wav;
          cmd = `ffmpeg -i "${filePath}" -acodec pcm_s${wavBitrate}le "${tempPath}" -y`;
          break;
        case '.ogg':
          const { quality } = this.optimizationSettings.audio.ogg;
          cmd = `ffmpeg -i "${filePath}" -codec:a libvorbis -q:a ${quality} "${tempPath}" -y`;
          break;
        default:
          // Unsupported format, return original size
          fs.unlinkSync(backupPath);
          return fs.statSync(filePath).size;
      }

      execSync(cmd, { stdio: 'ignore' });
      
      const optimizedSize = fs.statSync(tempPath).size;
      const originalSize = fs.statSync(backupPath).size;
      
      // If optimization made file larger, keep original
      if (optimizedSize > originalSize) {
        fs.unlinkSync(tempPath);
        fs.unlinkSync(backupPath);
        return originalSize;
      }

      // Replace original with optimized version
      fs.renameSync(tempPath, filePath);
      fs.unlinkSync(backupPath);
      return optimizedSize;

    } catch (error) {
      // Cleanup on error
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, filePath);
        fs.unlinkSync(backupPath);
      }
      throw new Error(`Audio optimization failed: ${error.message}`);
    }
  }

  async optimizeFonts(fontsPath) {
    const results = {
      processed: 0,
      originalSize: 0,
      optimizedSize: 0,
      formats: {}
    };

    if (!fs.existsSync(fontsPath)) {
      return results;
    }

    const fontFiles = this.getFilesByExtensions(fontsPath, this.supportedFormats.fonts);
    
    if (fontFiles.length > 0) {
      console.log(`   🔤 Analyzing ${fontFiles.length} font files...`);
      
      for (const file of fontFiles) {
        const filePath = path.join(fontsPath, file);
        const size = fs.statSync(filePath).size;
        results.originalSize += size;
        results.optimizedSize += size; // No optimization for now, just analysis
        results.processed++;

        const ext = path.extname(file).toLowerCase();
        if (!results.formats[ext]) {
          results.formats[ext] = { count: 0, saved: 0 };
        }
        results.formats[ext].count++;

        // Suggest WOFF2 conversion for TTF/OTF files
        if (['.ttf', '.otf'].includes(ext)) {
          console.log(`     💡 Consider converting ${file} to WOFF2 for better compression`);
        }
      }
    }

    return results;
  }

  getFilesByExtensions(dirPath, extensions) {
    if (!fs.existsSync(dirPath)) return [];
    
    return fs.readdirSync(dirPath)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return extensions.includes(ext);
      });
  }

  calculateSummary() {
    const games = Object.values(this.optimizationResults.games);
    
    games.forEach(game => {
      this.optimizationResults.summary.imagesOptimized += game.images.processed;
      this.optimizationResults.summary.audioOptimized += game.audio.processed;
      this.optimizationResults.summary.fontsOptimized += game.fonts.processed;
      this.optimizationResults.summary.originalSize += game.originalSize;
      this.optimizationResults.summary.optimizedSize += game.optimizedSize;
    });

    this.optimizationResults.totalSaved = 
      this.optimizationResults.summary.originalSize - 
      this.optimizationResults.summary.optimizedSize;

    if (this.optimizationResults.summary.originalSize > 0) {
      this.optimizationResults.summary.compressionRatio = Math.round(
        (this.optimizationResults.totalSaved / this.optimizationResults.summary.originalSize) * 100
      );
    }
  }

  generateReport() {
    const summary = this.optimizationResults.summary;
    
    console.log('\n📊 ASSET OPTIMIZATION REPORT');
    console.log('===============================');
    console.log(`🖼️  Images optimized: ${summary.imagesOptimized}`);
    console.log(`🔊 Audio files optimized: ${summary.audioOptimized}`);
    console.log(`🔤 Font files analyzed: ${summary.fontsOptimized}`);
    console.log(`📦 Original size: ${this.formatBytes(summary.originalSize)}`);
    console.log(`📉 Optimized size: ${this.formatBytes(summary.optimizedSize)}`);
    console.log(`💾 Space saved: ${this.formatBytes(this.optimizationResults.totalSaved)}`);
    console.log(`📊 Compression ratio: ${summary.compressionRatio}%`);

    console.log('\n🎯 INDIVIDUAL GAME RESULTS');
    console.log('============================');
    
    Object.entries(this.optimizationResults.games).forEach(([gameName, results]) => {
      console.log(`\n${gameName.toUpperCase()}`);
      console.log(`  Original size: ${this.formatBytes(results.originalSize)}`);
      console.log(`  Optimized size: ${this.formatBytes(results.optimizedSize)}`);
      console.log(`  Space saved: ${this.formatBytes(results.spaceSaved)}`);
      console.log(`  Compression: ${this.getCompressionRatio(results)}%`);
      
      if (results.images.processed > 0) {
        console.log(`  Images: ${results.images.processed} files, ${this.formatBytes(results.images.originalSize - results.images.optimizedSize)} saved`);
      }
      
      if (results.audio.processed > 0) {
        console.log(`  Audio: ${results.audio.processed} files, ${this.formatBytes(results.audio.originalSize - results.audio.optimizedSize)} saved`);
      }
      
      if (results.fonts.processed > 0) {
        console.log(`  Fonts: ${results.fonts.processed} files analyzed`);
      }
    });

    console.log('\n💡 OPTIMIZATION RECOMMENDATIONS');
    console.log('================================');
    this.generateRecommendations();
  }

  generateRecommendations() {
    const games = Object.values(this.optimizationResults.games);
    
    // Large asset recommendations
    const largeAssetGames = games.filter(g => g.originalSize > 5 * 1024 * 1024); // > 5MB
    if (largeAssetGames.length > 0) {
      console.log(`📦 Large asset games: ${largeAssetGames.map(g => g.name).join(', ')}`);
      console.log('   - Consider lazy loading for non-critical assets');
      console.log('   - Implement progressive loading for large images');
    }

    // Audio optimization suggestions
    const audioGames = games.filter(g => g.audio.processed > 0);
    if (audioGames.length > 0) {
      console.log(`🔊 Audio optimization opportunities:`);
      console.log('   - Convert large WAV files to compressed formats (MP3, OGG)');
      console.log('   - Use Web Audio API for runtime effects instead of pre-rendered audio');
    }

    // Font optimization suggestions
    const fontGames = games.filter(g => g.fonts.processed > 0);
    if (fontGames.length > 0) {
      console.log(`🔤 Font optimization recommendations:`);
      console.log('   - Convert TTF/OTF fonts to WOFF2 for better compression');
      console.log('   - Consider using web fonts with font-display: swap');
      console.log('   - Subset fonts to include only required characters');
    }

    // General recommendations
    console.log(`🚀 General optimization tips:`);
    console.log('   - Enable gzip compression on your web server');
    console.log('   - Use browser caching headers for static assets');
    console.log('   - Consider implementing a Content Delivery Network (CDN)');
    console.log('   - Preload critical assets using <link rel="preload">');
  }

  saveResults() {
    const reportPath = `asset-optimization-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(this.optimizationResults, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }

  getCompressionRatio(results) {
    if (results.originalSize === 0) return 0;
    return Math.round((results.spaceSaved / results.originalSize) * 100);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const gameFolder = args.find(arg => !arg.startsWith('--'));
  const basicMode = args.includes('--basic');
  
  const optimizer = new AssetOptimizer();
  
  if (basicMode) {
    console.log('🔧 Running in basic mode (limited optimization features)');
  }
  
  optimizer.optimizeAssets(gameFolder).catch(error => {
    console.error('❌ Asset optimization failed:', error.message);
    process.exit(1);
  });
}

module.exports = AssetOptimizer;
