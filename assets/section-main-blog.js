/**
 * Main Blog Section JavaScript
 * Handles blog layout, animations, infinite scroll, and interactions
 * Follows Bubbly design principles from shopirule.mdc
 */

class MainBlogManager {
  constructor() {
    this.mainBlog = document.querySelector('[data-main-blog]');
    this.blogGrid = this.mainBlog?.querySelector('.main-blog__grid');
    this.articles = this.mainBlog?.querySelectorAll('.article-card');
    this.layout = this.mainBlog?.dataset.layout || 'grid';
    this.animationsEnabled = this.mainBlog?.dataset.animations === 'true';
    
    // Pagination settings
    this.infiniteScrollEnabled = this.mainBlog?.dataset.infiniteScroll === 'true';
    this.loadMoreButton = this.mainBlog?.querySelector('.pagination__load-more');
    this.isLoading = false;
    this.currentPage = 1;
    
    // Performance tracking
    this.intersectionObserver = null;
    this.resizeObserver = null;
    
    // AI Navigation integration
    this.aiNavigation = window.AiNavigation || null;
    
    this.init();
  }
  
  init() {
    if (!this.mainBlog) return;
    
    this.setupLayout();
    this.setupAnimations();
    this.setupInfiniteScroll();
    this.setupLazyLoading();
    this.setupAccessibility();
    this.setupAINavigation();
    this.setupPerformanceOptimizations();
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onReady());
    } else {
      this.onReady();
    }
  }
  
  onReady() {
    this.animateArticles();
    this.setupMasonry();
    this.trackEngagement();
  }
  
  setupLayout() {
    // Handle layout switching
    const layoutSwitcher = document.querySelector('[data-layout-switcher]');
    if (layoutSwitcher) {
      layoutSwitcher.addEventListener('change', (event) => {
        this.switchLayout(event.target.value);
      });
    }
    
    // Setup responsive grid
    this.updateGridColumns();
    
    // Handle resize
    window.addEventListener('resize', this.debounce(() => {
      this.updateGridColumns();
      if (this.layout === 'masonry') {
        this.setupMasonry();
      }
    }, 250));
  }
  
  switchLayout(newLayout) {
    this.layout = newLayout;
    this.mainBlog.className = this.mainBlog.className.replace(/main-blog--\w+/g, '');
    this.mainBlog.classList.add(`main-blog--${newLayout}`);
    
    if (newLayout === 'masonry') {
      this.setupMasonry();
    }
    
    // Track layout change
    if (this.aiNavigation) {
      this.aiNavigation.trackInteraction({
        type: 'layout_change',
        layout: newLayout,
        timestamp: Date.now(),
        section: 'main_blog'
      });
    }
  }
  
  updateGridColumns() {
    const style = getComputedStyle(this.mainBlog);
    const desktopColumns = style.getPropertyValue('--posts-per-row-desktop').trim();
    const tabletColumns = style.getPropertyValue('--posts-per-row-tablet').trim();
    const mobileColumns = style.getPropertyValue('--posts-per-row-mobile').trim();
    
    // Apply responsive columns based on viewport
    const updateColumns = () => {
      const width = window.innerWidth;
      let columns = desktopColumns;
      
      if (width <= 750) {
        columns = mobileColumns;
      } else if (width <= 990) {
        columns = tabletColumns;
      }
      
      this.blogGrid.style.setProperty('--current-columns', columns);
    };
    
    updateColumns();
  }
  
  setupMasonry() {
    if (this.layout !== 'masonry' || !this.blogGrid) return;
    
    // Simple masonry implementation
    const items = Array.from(this.articles);
    const columns = parseInt(getComputedStyle(this.blogGrid).columnCount) || 3;
    
    // Reset masonry
    this.blogGrid.style.columnCount = columns;
    
    // Ensure proper spacing
    items.forEach(item => {
      item.style.breakInside = 'avoid';
      item.style.marginBottom = '3rem';
    });
  }
  
  setupAnimations() {
    if (!this.animationsEnabled) return;
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    // Setup intersection observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateArticle(entry.target);
        }
      });
    }, observerOptions);
    
    // Observe all articles
    this.articles.forEach(article => {
      this.intersectionObserver.observe(article);
    });
  }
  
  animateArticles() {
    if (!this.animationsEnabled) return;
    
    this.articles.forEach((article, index) => {
      const delay = parseInt(article.dataset.animationDelay) || (index * 100);
      
      // Initial state
      article.style.opacity = '0';
      article.style.transform = 'translateY(3rem)';
      article.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      
      // Animate in
      setTimeout(() => {
        this.animateArticle(article);
      }, delay);
    });
  }
  
  animateArticle(article) {
    article.style.opacity = '1';
    article.style.transform = 'translateY(0)';
    
    // Animate bubbles
    const bubbles = article.querySelectorAll('.article-card__bubble');
    bubbles.forEach((bubble, index) => {
      setTimeout(() => {
        bubble.style.opacity = '1';
        bubble.style.animation = 'float 8s ease-in-out infinite';
      }, index * 200);
    });
  }
  
  setupInfiniteScroll() {
    if (!this.infiniteScrollEnabled) return;
    
    const sentinel = document.createElement('div');
    sentinel.className = 'infinite-scroll-sentinel';
    this.mainBlog.appendChild(sentinel);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoading) {
          this.loadMoreArticles();
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '200px'
    });
    
    observer.observe(sentinel);
    
    // Handle load more button
    if (this.loadMoreButton) {
      this.loadMoreButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.loadMoreArticles();
      });
    }
  }
  
  async loadMoreArticles() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.currentPage++;
    
    try {
      // Show loading state
      this.showLoadingState();
      
      // Fetch next page
      const url = new URL(window.location);
      url.searchParams.set('page', this.currentPage);
      
      const response = await fetch(url.toString());
      const html = await response.text();
      
      // Parse response
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newArticles = doc.querySelectorAll('.article-card');
      
      if (newArticles.length > 0) {
        // Append new articles
        newArticles.forEach(article => {
          this.blogGrid.appendChild(article.cloneNode(true));
        });
        
        // Update articles list
        this.articles = this.mainBlog.querySelectorAll('.article-card');
        
        // Setup new articles
        this.setupNewArticles(Array.from(newArticles));
        
        // Track load more
        if (this.aiNavigation) {
          this.aiNavigation.trackInteraction({
            type: 'load_more_articles',
            page: this.currentPage,
            articlesLoaded: newArticles.length,
            timestamp: Date.now(),
            section: 'main_blog'
          });
        }
      } else {
        // No more articles
        this.hideLoadMoreButton();
      }
      
    } catch (error) {
      console.error('Error loading more articles:', error);
      this.showErrorState();
    } finally {
      this.isLoading = false;
      this.hideLoadingState();
    }
  }
  
  setupNewArticles(articles) {
    articles.forEach(article => {
      // Setup animations
      if (this.animationsEnabled && this.intersectionObserver) {
        this.intersectionObserver.observe(article);
      }
      
      // Setup lazy loading
      this.setupArticleLazyLoading(article);
      
      // Setup accessibility
      this.setupArticleAccessibility(article);
      
      // Setup AI tracking
      this.setupArticleAITracking(article);
    });
  }
  
  setupLazyLoading() {
    const images = this.mainBlog.querySelectorAll('.article-card__image');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '200px'
    });
    
    images.forEach(img => {
      if (img.dataset.src) {
        imageObserver.observe(img);
      }
    });
  }
  
  setupArticleLazyLoading(article) {
    const images = article.querySelectorAll('.article-card__image[data-src]');
    
    images.forEach(img => {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });
      
      imageObserver.observe(img);
    });
  }
  
  setupAccessibility() {
    // Setup keyboard navigation
    this.articles.forEach(article => {
      const links = article.querySelectorAll('a');
      
      links.forEach(link => {
        link.addEventListener('focus', this.handleFocus.bind(this));
        link.addEventListener('blur', this.handleBlur.bind(this));
        link.addEventListener('keydown', this.handleKeydown.bind(this));
      });
    });
    
    // Setup ARIA labels
    this.updateAriaLabels();
  }
  
  setupArticleAccessibility(article) {
    const links = article.querySelectorAll('a');
    
    links.forEach(link => {
      link.addEventListener('focus', this.handleFocus.bind(this));
      link.addEventListener('blur', this.handleBlur.bind(this));
      link.addEventListener('keydown', this.handleKeydown.bind(this));
    });
  }
  
  handleFocus(event) {
    event.target.style.outline = '2px solid rgba(102, 126, 234, 0.8)';
    event.target.style.outlineOffset = '2px';
  }
  
  handleBlur(event) {
    event.target.style.outline = '';
    event.target.style.outlineOffset = '';
  }
  
  handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      if (event.target.tagName === 'A') {
        // Let default behavior handle link navigation
        return;
      }
      event.preventDefault();
      event.target.click();
    }
  }
  
  updateAriaLabels() {
    this.articles.forEach((article, index) => {
      article.setAttribute('aria-label', `Article ${index + 1} of ${this.articles.length}`);
    });
  }
  
  setupAINavigation() {
    if (!this.aiNavigation) return;
    
    // Track article interactions
    this.articles.forEach(article => {
      this.setupArticleAITracking(article);
    });
    
    // Track scroll behavior
    this.trackScrollBehavior();
  }
  
  setupArticleAITracking(article) {
    if (!this.aiNavigation) return;
    
    const trackableElements = article.querySelectorAll(
      '.article-card__title-link, .article-card__tag, .article-card__read-more'
    );
    
    trackableElements.forEach(element => {
      element.addEventListener('click', (event) => {
        const articleTitle = article.querySelector('.article-card__title-link')?.textContent.trim();
        
        this.aiNavigation.trackInteraction({
          type: 'article_interaction',
          element: event.target.className,
          articleTitle: articleTitle,
          text: event.target.textContent.trim(),
          href: event.target.href || null,
          timestamp: Date.now(),
          section: 'main_blog'
        });
      });
    });
    
    // Track article visibility
    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const articleTitle = entry.target.querySelector('.article-card__title-link')?.textContent.trim();
          
          this.aiNavigation.trackInteraction({
            type: 'article_viewed',
            articleTitle: articleTitle,
            timestamp: Date.now(),
            section: 'main_blog'
          });
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '0px'
    });
    
    visibilityObserver.observe(article);
  }
  
  trackScrollBehavior() {
    if (!this.aiNavigation) return;
    
    let scrollDepth = 0;
    const trackingThresholds = [25, 50, 75, 100];
    const trackedThresholds = new Set();
    
    const handleScroll = this.throttle(() => {
      const scrollTop = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);
      
      scrollDepth = Math.max(scrollDepth, scrollPercentage);
      
      trackingThresholds.forEach(threshold => {
        if (scrollPercentage >= threshold && !trackedThresholds.has(threshold)) {
          trackedThresholds.add(threshold);
          this.aiNavigation.trackInteraction({
            type: 'blog_scroll_depth',
            depth: threshold,
            timestamp: Date.now(),
            section: 'main_blog'
          });
        }
      });
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
  
  trackEngagement() {
    const startTime = Date.now();
    
    // Track time spent on blog
    window.addEventListener('beforeunload', () => {
      const timeSpent = Date.now() - startTime;
      
      if (this.aiNavigation && timeSpent > 5000) { // Only track if more than 5 seconds
        this.aiNavigation.trackInteraction({
          type: 'time_on_blog',
          duration: timeSpent,
          articlesViewed: this.getViewedArticlesCount(),
          timestamp: Date.now(),
          section: 'main_blog'
        });
      }
    });
  }
  
  getViewedArticlesCount() {
    // Count articles that have been in viewport
    let count = 0;
    this.articles.forEach(article => {
      const rect = article.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        count++;
      }
    });
    return count;
  }
  
  setupPerformanceOptimizations() {
    // Setup resize observer for performance
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(this.debounce(() => {
        this.updateGridColumns();
      }, 250));
      
      this.resizeObserver.observe(this.mainBlog);
    }
    
    // Optimize images
    this.optimizeImages();
  }
  
  optimizeImages() {
    const images = this.mainBlog.querySelectorAll('.article-card__image');
    
    images.forEach(img => {
      // Add loading attribute
      img.loading = 'lazy';
      
      // Add error handling
      img.addEventListener('error', () => {
        img.style.display = 'none';
      });
    });
  }
  
  // Loading states
  showLoadingState() {
    if (this.loadMoreButton) {
      this.loadMoreButton.textContent = 'Loading...';
      this.loadMoreButton.disabled = true;
    }
  }
  
  hideLoadingState() {
    if (this.loadMoreButton) {
      this.loadMoreButton.textContent = 'Load More';
      this.loadMoreButton.disabled = false;
    }
  }
  
  showErrorState() {
    if (this.loadMoreButton) {
      this.loadMoreButton.textContent = 'Error - Try Again';
      this.loadMoreButton.disabled = false;
    }
  }
  
  hideLoadMoreButton() {
    if (this.loadMoreButton) {
      this.loadMoreButton.style.display = 'none';
    }
  }
  
  // Utility functions
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  // Cleanup method
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.updateGridColumns);
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new MainBlogManager();
});

// Handle Shopify section reloads
document.addEventListener('shopify:section:load', (event) => {
  if (event.target.querySelector('[data-main-blog]')) {
    new MainBlogManager();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MainBlogManager;
} 