#!/usr/bin/env node

/**
 * 🔍 COMPREHENSIVE TDD AUDIT RUNNER
 * ==================================
 * Automated testing script for AI4Devs Retro Web Games
 * Runs complete audit checks and generates detailed reports
 */

const fs = require('fs');
const path = require('path');

class ComprehensiveAuditor {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            games: {},
            summary: {
                totalGames: 0,
                passedGames: 0,
                criticalIssues: 0,
                totalTests: 0,
                passedTests: 0
            }
        };
    }

    async runCompleteAudit() {
        console.log('🔍 STARTING COMPREHENSIVE TDD AUDIT');
        console.log('=====================================');
        
        const games = [
            'snake-GG', 
            'breakout-GG', 
            'fruit-catcher-GG', 
            'pacman-GG', 
            'mspacman-GG', // Added ms pacman
            'tetris-GG',
            'asteroids-GG',
            'space-invaders-GG',
            'pong-GG', // Added Pong GG - Physics Foundation
            'galaga-GG' // Added Galaga GG - Formation Flying
        ];
        
        for (const game of games) {
            console.log(`\n🎮 Auditing ${game}...`);
            this.results.games[game] = await this.auditGame(game);
            this.results.summary.totalGames++;
        }
        
        this.generateSummary();
        this.saveResults();
        this.printReport();
    }

    async auditGame(gameName) {
        const gameDir = path.join(__dirname, '..', gameName);
        const gameResult = {
            name: gameName,
            status: 'PASS',
            tests: {},
            criticalIssues: [],
            recommendations: []
        };

        try {
            // 1. File Structure Check
            gameResult.tests.fileStructure = this.checkFileStructure(gameDir);
            
            // 2. License Header Check
            gameResult.tests.license = this.checkLicenseHeader(gameDir);
            
            // 3. Navigation Check
            gameResult.tests.navigation = this.checkNavigation(gameDir);
            
            // 4. Language Consistency Check
            gameResult.tests.language = this.checkLanguage(gameDir);
            
            // 5. Instructions Check
            gameResult.tests.instructions = this.checkInstructions(gameDir);
            
            // 6. TDD Implementation Check
            gameResult.tests.tddImplementation = this.checkTDDImplementation(gameDir);
            
            // 7. Performance Check
            gameResult.tests.performance = this.checkPerformance(gameDir);
            
            // 8. Accessibility Check
            gameResult.tests.accessibility = this.checkAccessibility(gameDir);

            // Calculate overall status
            const criticalFails = Object.values(gameResult.tests)
                .filter(test => !test.pass && test.critical);
            
            if (criticalFails.length > 0) {
                gameResult.status = 'FAIL';
                gameResult.criticalIssues = criticalFails.map(test => test.name);
                this.results.summary.criticalIssues += criticalFails.length;
            } else {
                this.results.summary.passedGames++;
            }

        } catch (error) {
            gameResult.status = 'ERROR';
            gameResult.error = error.message;
        }

        return gameResult;
    }

    checkFileStructure(gameDir) {
        const requiredFiles = ['index.html', 'style.css', 'script.js', 'README.md', 'prompts.md'];
        const missingFiles = [];

        for (const file of requiredFiles) {
            if (!fs.existsSync(path.join(gameDir, file))) {
                missingFiles.push(file);
            }
        }

        const assetsDir = path.join(gameDir, 'assets');
        const hasAssets = fs.existsSync(assetsDir);

        return {
            name: 'File Structure',
            pass: missingFiles.length === 0 && hasAssets,
            critical: true,
            details: {
                missingFiles,
                hasAssetsDir: hasAssets
            }
        };
    }

    checkLicenseHeader(gameDir) {
        const indexPath = path.join(gameDir, 'index.html');
        
        if (!fs.existsSync(indexPath)) {
            return { name: 'License Header', pass: false, critical: true };
        }

        const content = fs.readFileSync(indexPath, 'utf8');
        const hasLicense = content.includes('© GG, MIT License');

        return {
            name: 'License Header',
            pass: hasLicense,
            critical: true,
            details: { found: hasLicense }
        };
    }

    checkNavigation(gameDir) {
        const indexPath = path.join(gameDir, 'index.html');
        
        if (!fs.existsSync(indexPath)) {
            return { name: 'Navigation', pass: false, critical: true };
        }

        const content = fs.readFileSync(indexPath, 'utf8');
        const hasBackLink = content.includes('../index.html');
        const hasInicioText = content.includes('INICIO');

        return {
            name: 'Navigation',
            pass: hasBackLink && hasInicioText,
            critical: false,
            details: {
                hasBackLink,
                hasInicioText
            }
        };
    }

    checkLanguage(gameDir) {
        const indexPath = path.join(gameDir, 'index.html');
        
        if (!fs.existsSync(indexPath)) {
            return { name: 'Language', pass: false, critical: false };
        }

        const content = fs.readFileSync(indexPath, 'utf8');
        const isSpanish = content.includes('lang="es"');

        return {
            name: 'Language Consistency',
            pass: isSpanish,
            critical: false,
            details: { language: isSpanish ? 'es' : 'other' }
        };
    }

    checkInstructions(gameDir) {
        const indexPath = path.join(gameDir, 'index.html');
        
        if (!fs.existsSync(indexPath)) {
            return { name: 'Instructions', pass: false, critical: false };
        }

        const content = fs.readFileSync(indexPath, 'utf8');
        const hasDetails = content.includes('<details');
        const hasInstructions = content.includes('¿Cómo jugar?') || content.includes('instructions');

        return {
            name: 'Instructions Section',
            pass: hasDetails && hasInstructions,
            critical: false,
            details: {
                hasDetailsTag: hasDetails,
                hasInstructionsText: hasInstructions
            }
        };
    }

    checkTDDImplementation(gameDir) {
        const scriptPath = path.join(gameDir, 'script.js');
        
        if (!fs.existsSync(scriptPath)) {
            return { name: 'TDD Implementation', pass: false, critical: true };
        }

        const content = fs.readFileSync(scriptPath, 'utf8');
        const hasAuditMethod = content.includes('runAuditTasks');
        const hasTDDComments = content.includes('TDD') || content.includes('audit');

        return {
            name: 'TDD Implementation',
            pass: hasAuditMethod,
            critical: true,
            details: {
                hasAuditMethod,
                hasTDDComments
            }
        };
    }

    checkPerformance(gameDir) {
        const scriptPath = path.join(gameDir, 'script.js');
        
        if (!fs.existsSync(scriptPath)) {
            return { name: 'Performance', pass: false, critical: true };
        }

        const content = fs.readFileSync(scriptPath, 'utf8');
        const usesRAF = content.includes('requestAnimationFrame');

        return {
            name: 'Performance (60fps)',
            pass: usesRAF,
            critical: true,
            details: { usesRequestAnimationFrame: usesRAF }
        };
    }

    checkAccessibility(gameDir) {
        const indexPath = path.join(gameDir, 'index.html');
        
        if (!fs.existsSync(indexPath)) {
            return { name: 'Accessibility', pass: false, critical: false };
        }

        const content = fs.readFileSync(indexPath, 'utf8');
        const hasAriaLabels = content.includes('aria-label') || content.includes('aria-');
        const hasCanvasRole = content.includes('role=');

        return {
            name: 'Accessibility',
            pass: hasAriaLabels || hasCanvasRole,
            critical: false,
            details: {
                hasAriaLabels,
                hasCanvasRole
            }
        };
    }

    generateSummary() {
        // Count total tests
        for (const game of Object.values(this.results.games)) {
            if (game.tests) {
                this.results.summary.totalTests += Object.keys(game.tests).length;
                this.results.summary.passedTests += Object.values(game.tests)
                    .filter(test => test.pass).length;
            }
        }
    }

    saveResults() {
        const timestamp = Date.now();
        const reportPath = path.join(__dirname, '..', `audit-report-${timestamp}.json`);
        
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 Detailed report saved: audit-report-${timestamp}.json`);
    }

    printReport() {
        console.log('\n');
        console.log('🎯 COMPREHENSIVE AUDIT RESULTS');
        console.log('===============================');
        console.log(`📊 Summary:`);
        console.log(`   • Total Games: ${this.results.summary.totalGames}`);
        console.log(`   • Passed Games: ${this.results.summary.passedGames}`);
        console.log(`   • Critical Issues: ${this.results.summary.criticalIssues}`);
        console.log(`   • Test Success Rate: ${Math.round((this.results.summary.passedTests / this.results.summary.totalTests) * 100)}%`);
        
        console.log('\n🎮 Game Details:');
        for (const [gameName, game] of Object.entries(this.results.games)) {
            const statusIcon = game.status === 'PASS' ? '✅' : game.status === 'FAIL' ? '❌' : '⚠️';
            console.log(`   ${statusIcon} ${gameName}: ${game.status}`);
            
            if (game.criticalIssues.length > 0) {
                console.log(`      Critical Issues: ${game.criticalIssues.join(', ')}`);
            }
        }
        
        const overallStatus = this.results.summary.criticalIssues === 0 ? 'PASS' : 'FAIL';
        console.log(`\n🏆 OVERALL STATUS: ${overallStatus}`);
        
        if (overallStatus === 'PASS') {
            console.log('🎉 All games passed the comprehensive audit!');
        } else {
            console.log('🔧 Some issues found. Please review the detailed report.');
        }
    }
}

// Run the audit
const auditor = new ComprehensiveAuditor();
auditor.runCompleteAudit().catch(console.error);
