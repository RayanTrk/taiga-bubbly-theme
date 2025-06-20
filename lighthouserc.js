module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: [
        'http://localhost:9292',
        'http://localhost:9292/collections/all',
        'http://localhost:9292/products/example-product',
        'http://localhost:9292/pages/about',
        'http://localhost:9292/blogs/news',
        'http://localhost:9292/cart',
        'http://localhost:9292/search?q=test'
      ],
      startServerCommand: 'shopify theme serve',
      startServerReadyPattern: 'Preview your theme',
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-gpu',
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        skipAudits: [
          'unused-javascript',
          'unused-css-rules', // Shopify themes often have conditional CSS
          'render-blocking-resources' // Shopify requires some blocking resources
        ]
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Core Web Vitals
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 3400 }],
        
        // Taiga Theme Specific Requirements
        'interactive': ['error', { maxNumericValue: 3800 }],
        'max-potential-fid': ['error', { maxNumericValue: 130 }],
        
        // Shopify Specific
        'uses-text-compression': 'off', // Shopify handles this
        'uses-rel-preconnect': 'warn',
        'preload-lcp-image': 'warn',
        
        // Bubbly Theme Specific (allow some animation/visual trade-offs)
        'non-composited-animations': 'warn',
        'layout-shift-elements': 'warn'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    },
    server: {
      port: 9001,
      storage: './lighthouse-results'
    }
  }
}; 