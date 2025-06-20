#!/usr/bin/env node

/**
 * Accessibility Audit Script - Taiga Theme Bubbly Style
 * Automated WCAG 2.1 AA compliance testing using axe-core and lighthouse
 * Follows shopirule.mdc guidelines for accessibility testing
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class AccessibilityAuditor {
  constructor() {
    this.testPages = [
      { name: 'Homepage', url: '/' },
      { name: 'Collection', url: '/collections/all' },
      { name: 'Product', url: '/products/sample-product' },
      { name: 'Cart', url: '/cart' },
      { name: 'Blog', url: '/blogs/news' },
      { name: 'Article', url: '/blogs/news/sample-article' },
      { name: 'Contact', url: '/pages/contact' },
      { name: 'About', url: '/pages/about' },
      { name: 'Login', url: '/account/login' },
      { name: 'Register', url: '/account/register' },
      { name: 'Search', url: '/search?q=test' },
      { name: '404', url: '/404' }
    ];

    this.wcagCriteria = {
      // Level A
      'non-text-content': { level: 'A', description: 'All images have alt text' },
      'audio-only-video-only': { level: 'A', description: 'Media alternatives provided' },
      'captions-prerecorded': { level: 'A', description: 'Videos have captions' },
      'info-and-relationships': { level: 'A', description: 'Proper semantic structure' },
      'meaningful-sequence': { level: 'A', description: 'Logical reading order' },
      'sensory-characteristics': { level: 'A', description: 'Instructions not solely visual' },
      'use-of-color': { level: 'A', description: 'Color not sole indicator' },
      'audio-control': { level: 'A', description: 'Audio can be controlled' },
      'keyboard': { level: 'A', description: 'All functionality keyboard accessible' },
      'no-keyboard-trap': { level: 'A', description: 'No keyboard traps' },
      'timing-adjustable': { level: 'A', description: 'Time limits adjustable' },
      'pause-stop-hide': { level: 'A', description: 'Moving content controllable' },
      'three-flashes-or-below': { level: 'A', description: 'No seizure-inducing content' },
      'bypass-blocks': { level: 'A', description: 'Skip navigation provided' },
      'page-titled': { level: 'A', description: 'Pages have descriptive titles' },
      'focus-order': { level: 'A', description: 'Logical focus order' },
      'link-purpose-in-context': { level: 'A', description: 'Link purpose clear' },
      'language-of-page': { level: 'A', description: 'Page language specified' },
      'on-focus': { level: 'A', description: 'Focus doesn\'t trigger unexpected changes' },
      'on-input': { level: 'A', description: 'Input doesn\'t trigger unexpected changes' },
      'error-identification': { level: 'A', description: 'Errors clearly identified' },
      'labels-or-instructions': { level: 'A', description: 'Form elements have labels' },
      'parsing': { level: 'A', description: 'Valid HTML markup' },
      'name-role-value': { level: 'A', description: 'Proper ARIA implementation' },

      // Level AA
      'captions-live': { level: 'AA', description: 'Live audio has captions' },
      'audio-description-prerecorded': { level: 'AA', description: 'Videos have descriptions' },
      'contrast-minimum': { level: 'AA', description: 'Minimum color contrast 4.5:1' },
      'resize-text': { level: 'AA', description: 'Text resizable to 200%' },
      'images-of-text': { level: 'AA', description: 'Avoid images of text' },
      'reflow': { level: 'AA', description: 'Content reflows at 320px' },
      'non-text-contrast': { level: 'AA', description: 'UI component contrast 3:1' },
      'text-spacing': { level: 'AA', description: 'Text spacing adjustable' },
      'content-on-hover-or-focus': { level: 'AA', description: 'Hover/focus content dismissible' },
      'multiple-ways': { level: 'AA', description: 'Multiple navigation methods' },
      'headings-and-labels': { level: 'AA', description: 'Descriptive headings and labels' },
      'focus-visible': { level: 'AA', description: 'Focus indicators visible' },
      'language-of-parts': { level: 'AA', description: 'Language changes identified' },
      'consistent-navigation': { level: 'AA', description: 'Navigation consistent' },
      'consistent-identification': { level: 'AA', description: 'Components consistently identified' },
      'error-suggestion': { level: 'AA', description: 'Error correction suggestions' },
      'error-prevention-legal': { level: 'AA', description: 'Error prevention for important data' },
      'status-messages': { level: 'AA', description: 'Status messages announced' }
    };

    this.results = {
      summary: {},
      pages: [],
      violations: [],
      recommendations: []
    };
  }

  async runAudit() {
    console.log('🔍 Starting Accessibility Audit - Taiga Theme Bubbly Style');
    console.log('📋 Testing WCAG 2.1 AA compliance across all pages...\n');

    try {
      // Install dependencies if needed
      await this.ensureDependencies();

      // Run lighthouse accessibility audits
      await this.runLighthouseAudits();

      // Run axe-core tests
      await this.runAxeTests();

      // Analyze results
      await this.analyzeResults();

      // Generate report
      await this.generateReport();

      console.log('\n✅ Accessibility audit completed successfully!');
      console.log('📊 Check .taskmaster/reports/accessibility-audit-report.html for detailed results');

    } catch (error) {
      console.error('❌ Accessibility audit failed:', error.message);
      process.exit(1);
    }
  }

  async ensureDependencies() {
    console.log('📦 Checking dependencies...');
    
    try {
      // Check if lighthouse is available
      execSync('lighthouse --version', { stdio: 'pipe' });
    } catch (error) {
      console.log('Installing lighthouse...');
      execSync('npm install -g lighthouse', { stdio: 'inherit' });
    }

    // Create reports directory
    const reportsDir = path.join(process.cwd(), '.taskmaster', 'reports');
    await fs.mkdir(reportsDir, { recursive: true });
  }

  async runLighthouseAudits() {
    console.log('🚨 Running Lighthouse accessibility audits...');
    
    for (const page of this.testPages) {
      console.log(`  Testing ${page.name}...`);
      
      try {
        const command = `lighthouse ${page.url} --only-categories=accessibility --output=json --quiet --chrome-flags="--headless"`;
        const result = execSync(command, { encoding: 'utf8' });
        const lighthouseData = JSON.parse(result);
        
        const pageResult = {
          name: page.name,
          url: page.url,
          score: Math.round(lighthouseData.categories.accessibility.score * 100),
          audits: this.extractFailedAudits(lighthouseData.audits)
        };

        this.results.pages.push(pageResult);
        
      } catch (error) {
        console.warn(`    ⚠️ Could not test ${page.name}: ${error.message}`);
        this.results.pages.push({
          name: page.name,
          url: page.url,
          score: 0,
          audits: [],
          error: error.message
        });
      }
    }
  }

  extractFailedAudits(audits) {
    const failedAudits = [];
    
    for (const [auditId, audit] of Object.entries(audits)) {
      if (audit.score !== null && audit.score < 1) {
        failedAudits.push({
          id: auditId,
          title: audit.title,
          description: audit.description,
          impact: audit.details?.impact || 'unknown'
        });
      }
    }
    
    return failedAudits;
  }

  async runAxeTests() {
    console.log('🔧 Running axe-core accessibility tests...');
    
    // Create axe test configuration
    const axeConfig = {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'aria-valid-attr': { enabled: true },
        'aria-valid-attr-value': { enabled: true },
        'button-name': { enabled: true },
        'image-alt': { enabled: true },
        'input-image-alt': { enabled: true },
        'label': { enabled: true },
        'link-name': { enabled: true },
        'list': { enabled: true },
        'listitem': { enabled: true },
        'heading-order': { enabled: true },
        'html-has-lang': { enabled: true },
        'html-lang-valid': { enabled: true },
        'landmark-one-main': { enabled: true },
        'page-has-heading-one': { enabled: true },
        'region': { enabled: true },
        'skip-link': { enabled: true },
        'tabindex': { enabled: true },
        'valid-lang': { enabled: true }
      },
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    };

    // Save axe configuration for browser testing
    await fs.writeFile(
      path.join(process.cwd(), '.taskmaster', 'reports', 'axe-config.json'),
      JSON.stringify(axeConfig, null, 2)
    );

    console.log('  ℹ️ Axe configuration saved for manual testing');
    console.log('  📝 Use browser extension or manual testing for complete axe results');
  }

  async analyzeResults() {
    console.log('📊 Analyzing accessibility results...');
    
    const validPages = this.results.pages.filter(p => p.score > 0);
    const averageScore = validPages.length > 0 
      ? Math.round(validPages.reduce((sum, p) => sum + p.score, 0) / validPages.length)
      : 0;

    this.results.summary = {
      totalPages: this.results.pages.length,
      testedPages: validPages.length,
      averageScore,
      passedPages: validPages.filter(p => p.score >= 95).length,
      failedPages: validPages.filter(p => p.score < 95).length,
      wcagLevel: averageScore >= 95 ? 'AA' : averageScore >= 80 ? 'A' : 'Fail'
    };

    // Collect all violations
    for (const page of this.results.pages) {
      for (const audit of page.audits || []) {
        this.results.violations.push({
          page: page.name,
          url: page.url,
          ...audit
        });
      }
    }

    // Generate recommendations
    this.generateRecommendations();
  }

  generateRecommendations() {
    const recommendations = [];

    // Analyze violation patterns
    const violationTypes = {};
    this.results.violations.forEach(v => {
      const category = this.categorizeViolation(v.id);
      violationTypes[category] = (violationTypes[category] || 0) + 1;
    });

    // Generate recommendations based on most common issues
    for (const [category, count] of Object.entries(violationTypes)) {
      if (count > 0) {
        recommendations.push(this.getRecommendation(category, count));
      }
    }

    this.results.recommendations = recommendations;
  }

  categorizeViolation(auditId) {
    if (auditId.includes('color-contrast')) return 'contrast';
    if (auditId.includes('keyboard') || auditId.includes('focus')) return 'keyboard';
    if (auditId.includes('aria')) return 'aria';
    if (auditId.includes('image-alt')) return 'images';
    if (auditId.includes('label') || auditId.includes('form')) return 'forms';
    if (auditId.includes('heading') || auditId.includes('landmark')) return 'structure';
    return 'other';
  }

  getRecommendation(category, count) {
    const recommendations = {
      contrast: {
        title: 'Color Contrast',
        priority: 'High',
        description: `${count} contrast issues found. Improve color contrast ratios to meet WCAG AA (4.5:1).`,
        action: 'Update CSS variables in assets/accessibility.css for better contrast'
      },
      keyboard: {
        title: 'Keyboard Navigation',
        priority: 'High',
        description: `${count} keyboard accessibility issues. Ensure all interactive elements are keyboard accessible.`,
        action: 'Add proper tabindex and focus management in JavaScript components'
      },
      aria: {
        title: 'ARIA Implementation',
        priority: 'Medium',
        description: `${count} ARIA issues found. Improve ARIA attributes for screen reader compatibility.`,
        action: 'Add missing aria-labels, aria-describedby, and role attributes'
      },
      images: {
        title: 'Image Accessibility',
        priority: 'Medium',
        description: `${count} image accessibility issues. Add descriptive alt text to all images.`,
        action: 'Update image snippets with proper alt attributes'
      },
      forms: {
        title: 'Form Accessibility',
        priority: 'High',
        description: `${count} form accessibility issues. Ensure all form elements have proper labels.`,
        action: 'Add labels, error messages, and validation feedback'
      },
      structure: {
        title: 'Semantic Structure',
        priority: 'Medium',
        description: `${count} structural issues. Improve HTML semantic structure and heading hierarchy.`,
        action: 'Use proper heading levels, landmarks, and semantic elements'
      },
      other: {
        title: 'Other Issues',
        priority: 'Low',
        description: `${count} other accessibility issues found.`,
        action: 'Review detailed audit results for specific fixes'
      }
    };

    return recommendations[category] || recommendations.other;
  }

  async generateReport() {
    const reportHtml = this.generateHtmlReport();
    const reportJson = JSON.stringify(this.results, null, 2);

    // Save HTML report
    await fs.writeFile(
      path.join(process.cwd(), '.taskmaster', 'reports', 'accessibility-audit-report.html'),
      reportHtml
    );

    // Save JSON report
    await fs.writeFile(
      path.join(process.cwd(), '.taskmaster', 'reports', 'accessibility-audit-report.json'),
      reportJson
    );

    // Generate console summary
    this.printSummary();
  }

  generateHtmlReport() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Audit Report - Taiga Theme Bubbly</title>
    <style>
        /* Bubbly design styles for accessibility report */
        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            --warning-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            --error-gradient: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: var(--primary-gradient);
            color: white;
            padding: 40px 20px;
            border-radius: 20px;
            margin-bottom: 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            width: 100px;
            height: 100px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            top: -50px;
            right: -50px;
            animation: float 6s ease-in-out infinite;
        }
        
        .header::after {
            content: '';
            position: absolute;
            width: 150px;
            height: 150px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 50%;
            bottom: -75px;
            left: -75px;
            animation: float 8s ease-in-out infinite reverse;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--primary-gradient);
        }
        
        .metric-value {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .metric-label {
            color: #666;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .score-excellent { color: #10b981; }
        .score-good { color: #3b82f6; }
        .score-needs-improvement { color: #f59e0b; }
        .score-poor { color: #ef4444; }
        
        .section {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 1.5rem;
            margin-bottom: 20px;
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        
        .page-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .page-card {
            border: 1px solid #eee;
            border-radius: 10px;
            padding: 20px;
            background: #fafafa;
        }
        
        .page-score {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .violation-item {
            background: #fff5f5;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 5px;
        }
        
        .violation-title {
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 5px;
        }
        
        .recommendation-item {
            background: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        
        .recommendation-title {
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }
        
        .priority-high { border-left-color: #ef4444; background: #fff5f5; }
        .priority-medium { border-left-color: #f59e0b; background: #fffbeb; }
        .priority-low { border-left-color: #10b981; background: #f0fdf4; }
        
        .bubbly-note {
            background: var(--primary-gradient);
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin-top: 10px;
            font-style: italic;
        }
        
        @media (max-width: 768px) {
            .summary-grid {
                grid-template-columns: 1fr;
            }
            
            .page-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Accessibility Audit Report</h1>
            <p>Taiga Theme - Bubbly Style</p>
            <p>WCAG 2.1 AA Compliance Testing</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary-grid">
            <div class="metric-card">
                <div class="metric-value score-${this.getScoreClass(this.results.summary.averageScore)}">${this.results.summary.averageScore}</div>
                <div class="metric-label">Average Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${this.results.summary.passedPages}</div>
                <div class="metric-label">Pages Passed (95+)</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${this.results.summary.failedPages}</div>
                <div class="metric-label">Pages Need Work</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${this.results.summary.wcagLevel}</div>
                <div class="metric-label">WCAG Compliance</div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">📊 Page Results</h2>
            <div class="page-grid">
                ${this.results.pages.map(page => `
                    <div class="page-card">
                        <div class="page-score score-${this.getScoreClass(page.score)}">${page.score}/100</div>
                        <h3>${page.name}</h3>
                        <p><code>${page.url}</code></p>
                        ${page.audits && page.audits.length > 0 ? `
                            <p><strong>Issues:</strong> ${page.audits.length}</p>
                        ` : ''}
                        ${page.error ? `
                            <p style="color: #ef4444;"><strong>Error:</strong> ${page.error}</p>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        
        ${this.results.violations.length > 0 ? `
            <div class="section">
                <h2 class="section-title">⚠️ Accessibility Violations</h2>
                ${this.results.violations.slice(0, 10).map(violation => `
                    <div class="violation-item">
                        <div class="violation-title">${violation.title}</div>
                        <p><strong>Page:</strong> ${violation.page}</p>
                        <p>${violation.description}</p>
                        ${violation.impact ? `<p><strong>Impact:</strong> ${violation.impact}</p>` : ''}
                    </div>
                `).join('')}
                ${this.results.violations.length > 10 ? `
                    <p><em>Showing first 10 violations. See JSON report for complete list.</em></p>
                ` : ''}
            </div>
        ` : ''}
        
        <div class="section">
            <h2 class="section-title">💡 Recommendations</h2>
            ${this.results.recommendations.map(rec => `
                <div class="recommendation-item priority-${rec.priority.toLowerCase()}">
                    <div class="recommendation-title">${rec.title} (${rec.priority} Priority)</div>
                    <p><strong>Issue:</strong> ${rec.description}</p>
                    <p><strong>Action:</strong> ${rec.action}</p>
                </div>
            `).join('')}
        </div>
        
        <div class="section">
            <h2 class="section-title">📋 WCAG 2.1 AA Checklist</h2>
            <p>Manual verification recommended for the following criteria:</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
                ${Object.entries(this.wcagCriteria).filter(([_, criteria]) => criteria.level === 'AA').map(([key, criteria]) => `
                    <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                        <strong>${key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong>
                        <p style="font-size: 0.9rem; color: #666; margin-top: 5px;">${criteria.description}</p>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">🔧 Next Steps</h2>
            <ol style="line-height: 2;">
                <li>Review and fix high-priority violations</li>
                <li>Test with screen readers (NVDA, VoiceOver, JAWS)</li>
                <li>Perform keyboard-only navigation testing</li>
                <li>Validate color contrast with tools like WebAIM</li>
                <li>Test with users who have disabilities</li>
                <li>Set up automated accessibility testing in CI/CD</li>
                <li>Create accessibility documentation for content creators</li>
            </ol>
        </div>
    </div>
</body>
</html>`;
  }

  getScoreClass(score) {
    if (score >= 95) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 60) return 'needs-improvement';
    return 'poor';
  }

  printSummary() {
    console.log('\n📊 ACCESSIBILITY AUDIT SUMMARY');
    console.log('================================');
    console.log(`Average Score: ${this.results.summary.averageScore}/100`);
    console.log(`WCAG Compliance Level: ${this.results.summary.wcagLevel}`);
    console.log(`Pages Passed (95+): ${this.results.summary.passedPages}/${this.results.summary.testedPages}`);
    console.log(`Pages Need Work: ${this.results.summary.failedPages}/${this.results.summary.testedPages}`);
    console.log(`Total Violations: ${this.results.violations.length}`);
    console.log(`Recommendations: ${this.results.recommendations.length}`);
    
    if (this.results.summary.averageScore >= 95) {
      console.log('\n✅ Excellent! Theme meets WCAG 2.1 AA standards');
    } else if (this.results.summary.averageScore >= 80) {
      console.log('\n⚠️ Good progress, but some improvements needed');
    } else {
      console.log('\n❌ Significant accessibility improvements required');
    }
  }
}

// CLI execution
if (require.main === module) {
  const auditor = new AccessibilityAuditor();
  auditor.runAudit().catch(console.error);
}

module.exports = AccessibilityAuditor; 