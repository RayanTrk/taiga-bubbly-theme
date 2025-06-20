/**
 * Internationalization Testing Script for Taiga Bubbly Theme
 * Tests translation loading, RTL support, currency formatting, and locale features
 */

class I18nTester {
  constructor() {
    this.supportedLanguages = ['en', 'fr', 'es', 'de', 'ja'];
    this.rtlLanguages = ['ar', 'he', 'fa'];
    this.currencyFormats = {
      'en': { code: 'USD', symbol: '$', position: 'before' },
      'fr': { code: 'EUR', symbol: '€', position: 'after' },
      'es': { code: 'EUR', symbol: '€', position: 'after' },
      'de': { code: 'EUR', symbol: '€', position: 'after' },
      'ja': { code: 'JPY', symbol: '¥', position: 'before' }
    };
    this.testResults = {
      translationLoading: {},
      rtlSupport: {},
      currencyFormatting: {},
      dateLocalization: {},
      numberFormatting: {},
      textDirection: {},
      fontRendering: {},
      layoutIntegrity: {}
    };
  }

  // Test translation file loading and completeness
  async testTranslationLoading() {
    console.log('🌍 Testing translation loading...');
    
    for (const lang of this.supportedLanguages) {
      try {
        const response = await fetch(`/locales/${lang}.json`);
        if (response.ok) {
          const translations = await response.json();
          
          this.testResults.translationLoading[lang] = {
            loaded: true,
            keyCount: this.countKeys(translations),
            missingKeys: this.findMissingKeys(translations),
            score: this.calculateTranslationScore(translations)
          };
        } else {
          this.testResults.translationLoading[lang] = {
            loaded: false,
            error: `HTTP ${response.status}`,
            score: 0
          };
        }
      } catch (error) {
        this.testResults.translationLoading[lang] = {
          loaded: false,
          error: error.message,
          score: 0
        };
      }
    }
  }

  // Test RTL language support
  testRTLSupport() {
    console.log('↔️ Testing RTL support...');
    
    for (const lang of this.rtlLanguages) {
      const testElement = document.createElement('div');
      testElement.dir = 'rtl';
      testElement.lang = lang;
      testElement.innerHTML = 'اختبار RTL Test';
      testElement.style.cssText = `
        position: absolute;
        top: -9999px;
        font-size: 16px;
        width: 200px;
        padding: 10px;
      `;
      
      document.body.appendChild(testElement);
      
      const computedStyle = window.getComputedStyle(testElement);
      
      this.testResults.rtlSupport[lang] = {
        directionSupported: computedStyle.direction === 'rtl',
        textAlign: computedStyle.textAlign,
        marginStart: computedStyle.marginInlineStart,
        paddingStart: computedStyle.paddingInlineStart,
        score: computedStyle.direction === 'rtl' ? 10 : 0
      };
      
      document.body.removeChild(testElement);
    }
  }

  // Test currency formatting
  testCurrencyFormatting() {
    console.log('💰 Testing currency formatting...');
    
    const testAmount = 1234.56;
    
    for (const [lang, currency] of Object.entries(this.currencyFormats)) {
      try {
        const formatter = new Intl.NumberFormat(lang, {
          style: 'currency',
          currency: currency.code
        });
        
        const formatted = formatter.format(testAmount);
        
        this.testResults.currencyFormatting[lang] = {
          formatted: formatted,
          locale: lang,
          currency: currency.code,
          symbol: currency.symbol,
          position: currency.position,
          valid: formatted.includes(currency.symbol),
          score: formatted.includes(currency.symbol) ? 10 : 5
        };
      } catch (error) {
        this.testResults.currencyFormatting[lang] = {
          error: error.message,
          score: 0
        };
      }
    }
  }

  // Test date localization
  testDateLocalization() {
    console.log('📅 Testing date localization...');
    
    const testDate = new Date('2024-03-15T10:30:00');
    
    for (const lang of this.supportedLanguages) {
      try {
        const shortDate = new Intl.DateTimeFormat(lang, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }).format(testDate);
        
        const longDate = new Intl.DateTimeFormat(lang, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(testDate);
        
        const time = new Intl.DateTimeFormat(lang, {
          hour: '2-digit',
          minute: '2-digit'
        }).format(testDate);
        
        this.testResults.dateLocalization[lang] = {
          shortDate: shortDate,
          longDate: longDate,
          time: time,
          locale: lang,
          score: 10
        };
      } catch (error) {
        this.testResults.dateLocalization[lang] = {
          error: error.message,
          score: 0
        };
      }
    }
  }

  // Test number formatting
  testNumberFormatting() {
    console.log('🔢 Testing number formatting...');
    
    const testNumbers = [1234.567, 1000000, 0.123];
    
    for (const lang of this.supportedLanguages) {
      const results = {};
      let totalScore = 0;
      
      for (const num of testNumbers) {
        try {
          const formatted = new Intl.NumberFormat(lang).format(num);
          results[num] = formatted;
          totalScore += 3.33;
        } catch (error) {
          results[num] = `Error: ${error.message}`;
        }
      }
      
      this.testResults.numberFormatting[lang] = {
        results: results,
        score: Math.round(totalScore)
      };
    }
  }

  // Test text direction and layout
  testTextDirection() {
    console.log('📐 Testing text direction...');
    
    const testTexts = {
      ltr: 'This is left-to-right text',
      rtl: 'هذا نص من اليمين إلى اليسار',
      mixed: 'Mixed text مختلط 123'
    };
    
    for (const [type, text] of Object.entries(testTexts)) {
      const testElement = document.createElement('div');
      testElement.textContent = text;
      testElement.style.cssText = `
        position: absolute;
        top: -9999px;
        font-size: 16px;
        width: 300px;
      `;
      
      if (type === 'rtl') {
        testElement.dir = 'rtl';
      }
      
      document.body.appendChild(testElement);
      
      const computedStyle = window.getComputedStyle(testElement);
      const rect = testElement.getBoundingClientRect();
      
      this.testResults.textDirection[type] = {
        direction: computedStyle.direction,
        textAlign: computedStyle.textAlign,
        width: rect.width,
        height: rect.height,
        score: 8
      };
      
      document.body.removeChild(testElement);
    }
  }

  // Test font rendering for different languages
  testFontRendering() {
    console.log('🔤 Testing font rendering...');
    
    const testTexts = {
      en: 'The quick brown fox jumps over the lazy dog',
      fr: 'Portez ce vieux whisky au juge blond qui fume',
      es: 'El veloz murciélago hindú comía feliz cardillo y kiwi',
      de: 'Franz jagt im komplett verwahrlosten Taxi quer durch Bayern',
      ja: 'いろはにほへと ちりぬるを わかよたれそ つねならむ'
    };
    
    for (const [lang, text] of Object.entries(testTexts)) {
      const testElement = document.createElement('div');
      testElement.textContent = text;
      testElement.lang = lang;
      testElement.style.cssText = `
        position: absolute;
        top: -9999px;
        font-size: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        width: 400px;
      `;
      
      document.body.appendChild(testElement);
      
      const computedStyle = window.getComputedStyle(testElement);
      const rect = testElement.getBoundingClientRect();
      
      // Check if font supports the characters
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.font = '16px ' + computedStyle.fontFamily;
      const textWidth = ctx.measureText(text).width;
      
      this.testResults.fontRendering[lang] = {
        fontFamily: computedStyle.fontFamily,
        fontSize: computedStyle.fontSize,
        textWidth: textWidth,
        elementWidth: rect.width,
        supportedChars: textWidth > 0,
        score: textWidth > 0 ? 10 : 3
      };
      
      document.body.removeChild(testElement);
    }
  }

  // Test layout integrity with different languages
  testLayoutIntegrity() {
    console.log('📏 Testing layout integrity...');
    
    const testLayouts = [
      { type: 'button', text: 'Add to Cart / Ajouter au panier / Añadir al carrito' },
      { type: 'navigation', text: 'Home | Products | About | Contact' },
      { type: 'price', text: '$19.99 • €18.50 • ¥2,150' }
    ];
    
    for (const layout of testLayouts) {
      const testElement = document.createElement('div');
      testElement.innerHTML = layout.text;
      testElement.className = `test-${layout.type}`;
      testElement.style.cssText = `
        position: absolute;
        top: -9999px;
        padding: 10px 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 14px;
        white-space: nowrap;
        max-width: 300px;
      `;
      
      document.body.appendChild(testElement);
      
      const rect = testElement.getBoundingClientRect();
      const hasOverflow = testElement.scrollWidth > testElement.clientWidth;
      
      this.testResults.layoutIntegrity[layout.type] = {
        width: rect.width,
        height: rect.height,
        hasOverflow: hasOverflow,
        scrollWidth: testElement.scrollWidth,
        clientWidth: testElement.clientWidth,
        score: hasOverflow ? 6 : 10
      };
      
      document.body.removeChild(testElement);
    }
  }

  // Helper methods
  countKeys(obj, prefix = '') {
    let count = 0;
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        count += this.countKeys(obj[key], prefix + key + '.');
      } else {
        count++;
      }
    }
    return count;
  }

  findMissingKeys(translations) {
    const requiredKeys = [
      'general.accessibility.skip_to_content',
      'products.product.add_to_cart',
      'sections.cart.title',
      'customer.login_page.title'
    ];
    
    const missing = [];
    for (const key of requiredKeys) {
      if (!this.getNestedValue(translations, key)) {
        missing.push(key);
      }
    }
    return missing;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  calculateTranslationScore(translations) {
    const keyCount = this.countKeys(translations);
    const missingKeys = this.findMissingKeys(translations);
    const completeness = Math.max(0, (keyCount - missingKeys.length) / keyCount);
    return Math.round(completeness * 10);
  }

  // Generate comprehensive test report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      theme: 'Taiga Bubbly',
      testSuite: 'Internationalization',
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        averageScore: 0
      },
      results: this.testResults,
      recommendations: []
    };

    // Calculate summary
    let totalScore = 0;
    let testCount = 0;

    for (const category of Object.values(this.testResults)) {
      for (const result of Object.values(category)) {
        if (result.score !== undefined) {
          totalScore += result.score;
          testCount++;
          
          if (result.score >= 8) {
            report.summary.passedTests++;
          } else {
            report.summary.failedTests++;
          }
        }
      }
    }

    report.summary.totalTests = testCount;
    report.summary.averageScore = testCount > 0 ? (totalScore / testCount).toFixed(1) : 0;

    // Generate recommendations
    this.generateRecommendations(report);

    return report;
  }

  generateRecommendations(report) {
    // Translation recommendations
    for (const [lang, result] of Object.entries(this.testResults.translationLoading)) {
      if (result.score < 8) {
        report.recommendations.push(`Improve translation completeness for ${lang} (current score: ${result.score}/10)`);
      }
    }

    // RTL recommendations
    const rtlScores = Object.values(this.testResults.rtlSupport).map(r => r.score);
    if (rtlScores.some(score => score < 8)) {
      report.recommendations.push('Add proper RTL language support with logical properties');
    }

    // Font rendering recommendations
    for (const [lang, result] of Object.entries(this.testResults.fontRendering)) {
      if (result.score < 8) {
        report.recommendations.push(`Improve font support for ${lang} language characters`);
      }
    }

    // Layout recommendations
    for (const [type, result] of Object.entries(this.testResults.layoutIntegrity)) {
      if (result.hasOverflow) {
        report.recommendations.push(`Fix text overflow in ${type} elements for long translations`);
      }
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting I18n tests for Taiga Bubbly theme...');
    
    await this.testTranslationLoading();
    this.testRTLSupport();
    this.testCurrencyFormatting();
    this.testDateLocalization();
    this.testNumberFormatting();
    this.testTextDirection();
    this.testFontRendering();
    this.testLayoutIntegrity();
    
    const report = this.generateReport();
    
    console.log('✅ I18n testing completed!');
    console.log(`📊 Overall Score: ${report.summary.averageScore}/10`);
    console.log(`✅ Passed: ${report.summary.passedTests}`);
    console.log(`❌ Failed: ${report.summary.failedTests}`);
    
    return report;
  }
}

// Auto-run when script loads
if (typeof window !== 'undefined') {
  window.I18nTester = I18nTester;
  
  // Add convenience method to window
  window.testI18n = async function() {
    const tester = new I18nTester();
    return await tester.runAllTests();
  };
  
  console.log('🌍 I18n testing tools loaded. Run window.testI18n() to start testing.');
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18nTester;
} 