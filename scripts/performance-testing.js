#!/usr/bin/env node

/**
 * Performance Testing and Reporting Script for Shopify Taiga Theme (Bubbly Design)
 * Automates Lighthouse CI testing, budget validation, and report generation
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync, spawn } = require('child_process');

class PerformanceTester {
  constructor() {
    this.config = {
      lighthouseConfig: path.join(process.cwd(), 'lighthouserc.js'),
      budgetConfig: path.join(process.cwd(), 'performance-budget.json'),
      reportsDir: path.join(process.cwd(), 'performance-reports'),
      resultsDir: path.join(process.cwd(), 'lighthouse-results'),
      themeUrl: 'http://localhost:9292',
      testPages: [
        '/',
        '/collections/all',
        '/products/example-product',
        '/pages/about',
        '/blogs/news',
        '/cart',
        '/search?q=test'
      ]
    };

    this.results = {
      timestamp: new Date().toISOString(),
      summary: {},
      pages: {},
      budgetViolations: [],
      recommendations: []
    };
  }

  /**
   * Run complete performance testing suite
   */
  async runTests() {
    console.log('🚀 Starting Taiga Bubbly Theme Performance Testing...\n');

    try {
      // Ensure directories exist
      await this.ensureDirectories();

      // Load configurations
      await this.loadConfigurations();

      // Start development server if needed
      await this.startDevServer();

      // Run Lighthouse CI tests
      await this.runLighthouseTests();

      // Analyze results
      await this.analyzeResults();

      // Check budget violations
      await this.checkBudgetViolations();

      // Generate recommendations
      await this.generateRecommendations();

      // Generate reports
      await this.generateReports();

      // Display summary
      this.displaySummary();

      console.log('\n✅ Performance testing completed successfully!');
      console.log(`📊 Reports saved to: ${this.config.reportsDir}`);

    } catch (error) {
      console.error('❌ Performance testing failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Ensure required directories exist
   */
  async ensureDirectories() {
    const dirs = [this.config.reportsDir, this.config.resultsDir];
    
    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    }
  }

  /**
   * Load configuration files
   */
  async loadConfigurations() {
    try {
      // Load performance budget
      const budgetContent = await fs.readFile(this.config.budgetConfig, 'utf8');
      this.budget = JSON.parse(budgetContent);
      console.log('📋 Loaded performance budget configuration');

    } catch (error) {
      console.warn('⚠️  Could not load performance budget:', error.message);
      this.budget = null;
    }
  }

  /**
   * Start development server if not running
   */
  async startDevServer() {
    try {
      // Check if server is already running
      const response = await fetch(this.config.themeUrl);
      if (response.ok) {
        console.log('🌐 Development server is already running');
        return;
      }
    } catch {
      // Server not running, need to start it
    }

    console.log('🚀 Starting development server...');
    
    // This would typically be handled by Lighthouse CI's startServerCommand
    // but we can add additional logic here if needed
    console.log('💡 Server will be started by Lighthouse CI');
  }

  /**
   * Run Lighthouse CI tests
   */
  async runLighthouseTests() {
    console.log('🔍 Running Lighthouse CI tests...');

    try {
      const output = execSync('npx lighthouse-ci autorun', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      console.log('✅ Lighthouse tests completed');
      this.lighthouseOutput = output;

    } catch (error) {
      console.error('❌ Lighthouse tests failed:', error.message);
      throw error;
    }
  }

  /**
   * Analyze Lighthouse results
   */
  async analyzeResults() {
    console.log('📊 Analyzing Lighthouse results...');

    try {
      // Read Lighthouse results from the results directory
      const resultFiles = await fs.readdir(this.config.resultsDir);
      const jsonFiles = resultFiles.filter(file => file.endsWith('.json'));

      for (const file of jsonFiles) {
        const filePath = path.join(this.config.resultsDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const result = JSON.parse(content);

        // Extract page URL from result
        const pageUrl = new URL(result.finalUrl);
        const pagePath = pageUrl.pathname + pageUrl.search;

        // Analyze page results
        this.results.pages[pagePath] = this.analyzePage(result);
      }

      // Calculate overall summary
      this.calculateSummary();

    } catch (error) {
      console.error('❌ Failed to analyze results:', error.message);
      throw error;
    }
  }

  /**
   * Analyze individual page results
   */
  analyzePage(result) {
    const audits = result.audits;
    const categories = result.categories;

    return {
      url: result.finalUrl,
      scores: {
        performance: Math.round(categories.performance.score * 100),
        accessibility: Math.round(categories.accessibility.score * 100),
        bestPractices: Math.round(categories['best-practices'].score * 100),
        seo: Math.round(categories.seo.score * 100)
      },
      metrics: {
        firstContentfulPaint: audits['first-contentful-paint'].numericValue,
        largestContentfulPaint: audits['largest-contentful-paint'].numericValue,
        cumulativeLayoutShift: audits['cumulative-layout-shift'].numericValue,
        totalBlockingTime: audits['total-blocking-time'].numericValue,
        speedIndex: audits['speed-index'].numericValue,
        interactive: audits.interactive.numericValue
      },
      opportunities: this.extractOpportunities(audits),
      diagnostics: this.extractDiagnostics(audits)
    };
  }

  /**
   * Extract performance opportunities from audits
   */
  extractOpportunities(audits) {
    const opportunities = [];
    const opportunityAudits = [
      'unused-css-rules',
      'unused-javascript',
      'render-blocking-resources',
      'unminified-css',
      'unminified-javascript',
      'efficient-animated-content',
      'modern-image-formats',
      'uses-optimized-images',
      'uses-text-compression',
      'uses-responsive-images'
    ];

    for (const auditId of opportunityAudits) {
      const audit = audits[auditId];
      if (audit && audit.score < 1 && audit.details) {
        opportunities.push({
          id: auditId,
          title: audit.title,
          description: audit.description,
          score: audit.score,
          savings: audit.details.overallSavingsMs || 0,
          items: audit.details.items || []
        });
      }
    }

    return opportunities.sort((a, b) => b.savings - a.savings);
  }

  /**
   * Extract diagnostics from audits
   */
  extractDiagnostics(audits) {
    const diagnostics = [];
    const diagnosticAudits = [
      'mainthread-work-breakdown',
      'bootup-time',
      'uses-long-cache-ttl',
      'total-byte-weight',
      'dom-size',
      'critical-request-chains',
      'user-timings',
      'layout-shift-elements'
    ];

    for (const auditId of diagnosticAudits) {
      const audit = audits[auditId];
      if (audit && (audit.score < 1 || audit.details)) {
        diagnostics.push({
          id: auditId,
          title: audit.title,
          description: audit.description,
          score: audit.score,
          displayValue: audit.displayValue,
          details: audit.details
        });
      }
    }

    return diagnostics;
  }

  /**
   * Calculate overall summary
   */
  calculateSummary() {
    const pages = Object.values(this.results.pages);
    if (pages.length === 0) return;

    this.results.summary = {
      averageScores: {
        performance: Math.round(pages.reduce((sum, page) => sum + page.scores.performance, 0) / pages.length),
        accessibility: Math.round(pages.reduce((sum, page) => sum + page.scores.accessibility, 0) / pages.length),
        bestPractices: Math.round(pages.reduce((sum, page) => sum + page.scores.bestPractices, 0) / pages.length),
        seo: Math.round(pages.reduce((sum, page) => sum + page.scores.seo, 0) / pages.length)
      },
      averageMetrics: {
        firstContentfulPaint: Math.round(pages.reduce((sum, page) => sum + page.metrics.firstContentfulPaint, 0) / pages.length),
        largestContentfulPaint: Math.round(pages.reduce((sum, page) => sum + page.metrics.largestContentfulPaint, 0) / pages.length),
        cumulativeLayoutShift: Math.round((pages.reduce((sum, page) => sum + page.metrics.cumulativeLayoutShift, 0) / pages.length) * 1000) / 1000,
        totalBlockingTime: Math.round(pages.reduce((sum, page) => sum + page.metrics.totalBlockingTime, 0) / pages.length),
        speedIndex: Math.round(pages.reduce((sum, page) => sum + page.metrics.speedIndex, 0) / pages.length),
        interactive: Math.round(pages.reduce((sum, page) => sum + page.metrics.interactive, 0) / pages.length)
      },
      totalPages: pages.length,
      passedPages: pages.filter(page => page.scores.performance >= 90).length,
      failedPages: pages.filter(page => page.scores.performance < 90).length
    };
  }

  /**
   * Check budget violations
   */
  async checkBudgetViolations() {
    if (!this.budget) return;

    console.log('💰 Checking performance budget violations...');

    for (const [pagePath, pageResult] of Object.entries(this.results.pages)) {
      const budgetConfig = this.findBudgetConfig(pagePath);
      if (!budgetConfig) continue;

      // Check timing budgets
      for (const timingBudget of budgetConfig.timings || []) {
        const metricValue = this.getMetricValue(pageResult.metrics, timingBudget.metric);
        if (metricValue > timingBudget.budget) {
          const violation = {
            page: pagePath,
            type: 'timing',
            metric: timingBudget.metric,
            budget: timingBudget.budget,
            actual: metricValue,
            excess: metricValue - timingBudget.budget,
            severity: metricValue > (timingBudget.budget + timingBudget.tolerance) ? 'critical' : 'warning'
          };
          this.results.budgetViolations.push(violation);
        }
      }
    }

    console.log(`📊 Found ${this.results.budgetViolations.length} budget violations`);
  }

  /**
   * Find budget configuration for a page path
   */
  findBudgetConfig(pagePath) {
    if (!this.budget || !this.budget.budgets) return null;

    // Find most specific matching budget
    return this.budget.budgets
      .filter(budget => this.matchesPath(pagePath, budget.path))
      .sort((a, b) => b.path.length - a.path.length)[0];
  }

  /**
   * Check if page path matches budget path pattern
   */
  matchesPath(pagePath, budgetPath) {
    if (budgetPath === '/*') return true;
    if (budgetPath === pagePath) return true;
    if (budgetPath.endsWith('/*')) {
      const prefix = budgetPath.slice(0, -2);
      return pagePath.startsWith(prefix);
    }
    return false;
  }

  /**
   * Get metric value by name
   */
  getMetricValue(metrics, metricName) {
    const metricMap = {
      'first-contentful-paint': 'firstContentfulPaint',
      'largest-contentful-paint': 'largestContentfulPaint',
      'cumulative-layout-shift': 'cumulativeLayoutShift',
      'total-blocking-time': 'totalBlockingTime',
      'speed-index': 'speedIndex',
      'interactive': 'interactive'
    };

    return metrics[metricMap[metricName]] || 0;
  }

  /**
   * Generate performance recommendations
   */
  async generateRecommendations() {
    console.log('💡 Generating performance recommendations...');

    const recommendations = [];

    // Analyze common issues across pages
    const allOpportunities = Object.values(this.results.pages)
      .flatMap(page => page.opportunities);

    // Group opportunities by type
    const opportunityGroups = {};
    for (const opportunity of allOpportunities) {
      if (!opportunityGroups[opportunity.id]) {
        opportunityGroups[opportunity.id] = [];
      }
      opportunityGroups[opportunity.id].push(opportunity);
    }

    // Generate recommendations based on frequency and impact
    for (const [opportunityId, opportunities] of Object.entries(opportunityGroups)) {
      if (opportunities.length >= Math.ceil(Object.keys(this.results.pages).length * 0.5)) {
        const totalSavings = opportunities.reduce((sum, opp) => sum + opp.savings, 0);
        const avgSavings = totalSavings / opportunities.length;

        if (avgSavings > 100) { // Only recommend if significant savings
          recommendations.push({
            type: 'optimization',
            priority: avgSavings > 500 ? 'high' : avgSavings > 250 ? 'medium' : 'low',
            title: opportunities[0].title,
            description: opportunities[0].description,
            impact: `Average savings: ${Math.round(avgSavings)}ms`,
            affectedPages: opportunities.length,
            implementation: this.getImplementationGuide(opportunityId)
          });
        }
      }
    }

    // Budget-specific recommendations
    for (const violation of this.results.budgetViolations) {
      if (violation.severity === 'critical') {
        recommendations.push({
          type: 'budget-violation',
          priority: 'high',
          title: `Critical budget violation: ${violation.metric}`,
          description: `Page ${violation.page} exceeds ${violation.metric} budget by ${Math.round(violation.excess)}ms`,
          impact: `Budget: ${violation.budget}ms, Actual: ${Math.round(violation.actual)}ms`,
          implementation: this.getBudgetFixGuide(violation.metric)
        });
      }
    }

    // Bubbly theme specific recommendations
    recommendations.push(...this.getBubblyThemeRecommendations());

    this.results.recommendations = recommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }

  /**
   * Get implementation guide for optimization
   */
  getImplementationGuide(opportunityId) {
    const guides = {
      'unused-css-rules': 'Remove unused CSS rules or implement critical CSS loading',
      'unused-javascript': 'Remove unused JavaScript or implement code splitting',
      'render-blocking-resources': 'Defer non-critical CSS/JS or use resource hints',
      'unminified-css': 'Enable CSS minification in build process',
      'unminified-javascript': 'Enable JavaScript minification in build process',
      'efficient-animated-content': 'Optimize animations for Bubbly theme performance',
      'modern-image-formats': 'Convert images to WebP format with fallbacks',
      'uses-optimized-images': 'Implement responsive images and proper compression',
      'uses-text-compression': 'Enable gzip/brotli compression on server',
      'uses-responsive-images': 'Implement srcset and sizes attributes'
    };

    return guides[opportunityId] || 'Refer to Lighthouse documentation for implementation details';
  }

  /**
   * Get budget fix guide
   */
  getBudgetFixGuide(metric) {
    const guides = {
      'first-contentful-paint': 'Optimize critical rendering path and reduce render-blocking resources',
      'largest-contentful-paint': 'Optimize largest element (usually hero image) loading and rendering',
      'cumulative-layout-shift': 'Add size attributes to images and reserve space for dynamic content',
      'total-blocking-time': 'Reduce JavaScript execution time and implement code splitting',
      'speed-index': 'Optimize above-the-fold content loading and critical resource prioritization',
      'interactive': 'Reduce JavaScript bundle size and optimize third-party scripts'
    };

    return guides[metric] || 'Optimize the specific metric according to Core Web Vitals guidelines';
  }

  /**
   * Get Bubbly theme specific recommendations
   */
  getBubblyThemeRecommendations() {
    const bubblyRecommendations = [];

    // Check if reduced motion is respected
    bubblyRecommendations.push({
      type: 'accessibility',
      priority: 'medium',
      title: 'Ensure Bubbly animations respect reduced motion preferences',
      description: 'Implement prefers-reduced-motion media query for all animations',
      impact: 'Improves accessibility and performance for users with motion sensitivity',
      implementation: 'Add @media (prefers-reduced-motion: reduce) rules to disable animations'
    });

    // Gradient optimization
    bubblyRecommendations.push({
      type: 'optimization',
      priority: 'low',
      title: 'Optimize CSS gradients for Bubbly theme',
      description: 'Use efficient gradient syntax and consider caching gradient backgrounds',
      impact: 'Reduces CSS parsing time and improves rendering performance',
      implementation: 'Use linear-gradient() efficiently and avoid complex gradient patterns'
    });

    return bubblyRecommendations;
  }

  /**
   * Generate performance reports
   */
  async generateReports() {
    console.log('📝 Generating performance reports...');

    // Generate JSON report
    await this.generateJSONReport();

    // Generate HTML report
    await this.generateHTMLReport();

    // Generate CSV report
    await this.generateCSVReport();
  }

  /**
   * Generate JSON report
   */
  async generateJSONReport() {
    const reportPath = path.join(this.config.reportsDir, `performance-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 JSON report saved: ${reportPath}`);
  }

  /**
   * Generate HTML report
   */
  async generateHTMLReport() {
    const html = this.generateHTMLContent();
    const reportPath = path.join(this.config.reportsDir, `performance-report-${Date.now()}.html`);
    await fs.writeFile(reportPath, html);
    console.log(`📄 HTML report saved: ${reportPath}`);
  }

  /**
   * Generate HTML content for report
   */
  generateHTMLContent() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Taiga Bubbly Theme - Performance Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 20px; padding: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
        h1, h2, h3 { color: #333; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; }
        .metric-label { font-size: 0.9em; opacity: 0.9; }
        .page-results { margin: 30px 0; }
        .page-card { border: 1px solid #e0e0e0; border-radius: 10px; margin: 10px 0; padding: 20px; }
        .score { display: inline-block; padding: 5px 10px; border-radius: 20px; color: white; font-weight: bold; }
        .score.good { background: #0cce6b; }
        .score.average { background: #ffa400; }
        .score.poor { background: #ff4e42; }
        .violations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .recommendations { background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .priority-high { border-left: 4px solid #ff4e42; }
        .priority-medium { border-left: 4px solid #ffa400; }
        .priority-low { border-left: 4px solid #0cce6b; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Taiga Bubbly Theme - Performance Report</h1>
        <p><strong>Generated:</strong> ${this.results.timestamp}</p>
        
        <h2>📊 Summary</h2>
        <div class="summary">
            <div class="metric-card">
                <div class="metric-value">${this.results.summary.averageScores?.performance || 0}</div>
                <div class="metric-label">Avg Performance Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${this.results.summary.averageScores?.accessibility || 0}</div>
                <div class="metric-label">Avg Accessibility Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${this.results.summary.averageMetrics?.largestContentfulPaint || 0}ms</div>
                <div class="metric-label">Avg LCP</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${this.results.summary.averageMetrics?.firstContentfulPaint || 0}ms</div>
                <div class="metric-label">Avg FCP</div>
            </div>
        </div>

        <h2>📄 Page Results</h2>
        <div class="page-results">
            ${Object.entries(this.results.pages).map(([path, page]) => `
                <div class="page-card">
                    <h3>${path}</h3>
                    <div>
                        <span class="score ${this.getScoreClass(page.scores.performance)}">${page.scores.performance}</span>
                        Performance
                        <span class="score ${this.getScoreClass(page.scores.accessibility)}">${page.scores.accessibility}</span>
                        Accessibility
                    </div>
                    <p><strong>LCP:</strong> ${Math.round(page.metrics.largestContentfulPaint)}ms | 
                       <strong>FCP:</strong> ${Math.round(page.metrics.firstContentfulPaint)}ms | 
                       <strong>CLS:</strong> ${page.metrics.cumulativeLayoutShift.toFixed(3)}</p>
                </div>
            `).join('')}
        </div>

        ${this.results.budgetViolations.length > 0 ? `
        <h2>⚠️ Budget Violations</h2>
        <div class="violations">
            ${this.results.budgetViolations.map(violation => `
                <div class="priority-${violation.severity === 'critical' ? 'high' : 'medium'}">
                    <strong>${violation.page}</strong> - ${violation.metric}<br>
                    Budget: ${violation.budget}ms, Actual: ${Math.round(violation.actual)}ms
                    (${Math.round(violation.excess)}ms over)
                </div>
            `).join('<br>')}
        </div>
        ` : ''}

        <h2>💡 Recommendations</h2>
        <div class="recommendations">
            ${this.results.recommendations.map(rec => `
                <div class="priority-${rec.priority}" style="margin: 10px 0; padding: 10px;">
                    <strong>${rec.title}</strong><br>
                    ${rec.description}<br>
                    <em>Impact: ${rec.impact}</em><br>
                    <small>Implementation: ${rec.implementation}</small>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Get CSS class for score
   */
  getScoreClass(score) {
    if (score >= 90) return 'good';
    if (score >= 50) return 'average';
    return 'poor';
  }

  /**
   * Generate CSV report
   */
  async generateCSVReport() {
    const csvData = [
      ['Page', 'Performance', 'Accessibility', 'Best Practices', 'SEO', 'FCP (ms)', 'LCP (ms)', 'CLS', 'TBT (ms)'],
      ...Object.entries(this.results.pages).map(([path, page]) => [
        path,
        page.scores.performance,
        page.scores.accessibility,
        page.scores.bestPractices,
        page.scores.seo,
        Math.round(page.metrics.firstContentfulPaint),
        Math.round(page.metrics.largestContentfulPaint),
        page.metrics.cumulativeLayoutShift.toFixed(3),
        Math.round(page.metrics.totalBlockingTime)
      ])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const reportPath = path.join(this.config.reportsDir, `performance-data-${Date.now()}.csv`);
    await fs.writeFile(reportPath, csv);
    console.log(`📄 CSV report saved: ${reportPath}`);
  }

  /**
   * Display summary in console
   */
  displaySummary() {
    console.log('\n📊 Performance Testing Summary');
    console.log('================================');
    console.log(`Average Performance Score: ${this.results.summary.averageScores?.performance || 0}/100`);
    console.log(`Average Accessibility Score: ${this.results.summary.averageScores?.accessibility || 0}/100`);
    console.log(`Average LCP: ${this.results.summary.averageMetrics?.largestContentfulPaint || 0}ms`);
    console.log(`Average FCP: ${this.results.summary.averageMetrics?.firstContentfulPaint || 0}ms`);
    console.log(`Budget Violations: ${this.results.budgetViolations.length}`);
    console.log(`Recommendations: ${this.results.recommendations.length}`);
    console.log(`Pages Tested: ${this.results.summary.totalPages || 0}`);
    console.log(`Pages Passing (90+): ${this.results.summary.passedPages || 0}`);
  }
}

// CLI interface
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.runTests().catch(error => {
    console.error('❌ Performance testing failed:', error);
    process.exit(1);
  });
}

module.exports = PerformanceTester; 