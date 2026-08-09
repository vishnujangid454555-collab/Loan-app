/* ===== RESPONSIVE LAYOUT HANDLER ===== */

/**
 * Responsive Manager - Handles responsive behavior across all devices
 * Automatically detects device type and screen size
 * Handles orientation changes, window resizing, and dynamic layout adjustments
 */

const ResponsiveManager = {
  // Screen size breakpoints
  breakpoints: {
    mobile: 480,
    smallTablet: 768,
    tablet: 1024,
    desktop: 1200,
    large: 1440
  },

  // Current device type
  currentDevice: null,
  currentOrientation: null,

  /**
   * Initialize responsive manager
   */
  init() {
    this.detectDevice();
    this.setupEventListeners();
    this.adjustLayout();
    console.log('Responsive Manager initialized for:', this.currentDevice);
  },

  /**
   * Detect current device type based on screen width
   */
  detectDevice() {
    const width = window.innerWidth;

    if (width < this.breakpoints.mobile) {
      this.currentDevice = 'mobile';
    } else if (width < this.breakpoints.smallTablet) {
      this.currentDevice = 'mobile';
    } else if (width < this.breakpoints.tablet) {
      this.currentDevice = 'tablet';
    } else if (width < this.breakpoints.desktop) {
      this.currentDevice = 'tablet';
    } else if (width < this.breakpoints.large) {
      this.currentDevice = 'desktop';
    } else {
      this.currentDevice = 'large-desktop';
    }

    // Detect orientation
    this.currentOrientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
  },

  /**
   * Setup event listeners for responsive changes
   */
  setupEventListeners() {
    // Handle window resize
    window.addEventListener('resize', () => {
      const previousDevice = this.currentDevice;
      this.detectDevice();

      // Only adjust if device type changed
      if (previousDevice !== this.currentDevice) {
        this.adjustLayout();
      }
    });

    // Handle orientation change
    window.addEventListener('orientationchange', () => {
      this.detectDevice();
      this.adjustLayout();
      // Delay to allow browser to complete orientation animation
      setTimeout(() => {
        this.adjustTableLayout();
      }, 500);
    });

    // Handle visibility change (tab switch)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.detectDevice();
        this.adjustLayout();
      }
    });
  },

  /**
   * Adjust layout based on device type
   */
  adjustLayout() {
    this.adjustSidebarLayout();
    this.adjustMainContentLayout();
    this.adjustTableLayout();
    this.adjustFormLayout();
    this.adjustButtonLayout();
  },

  /**
   * Adjust sidebar for current device
   */
  adjustSidebarLayout() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    if (this.currentDevice === 'large-desktop' || (this.currentDevice === 'desktop' && window.innerWidth > this.breakpoints.desktop)) {
      // Desktop: vertical sidebar on left
      sidebar.style.flexDirection = 'column';
      sidebar.style.position = 'relative';
      sidebar.style.minHeight = 'auto';
    } else if (this.currentDevice === 'tablet') {
      // Tablet: horizontal scrolling navigation bar
      sidebar.style.flexDirection = 'row';
      sidebar.style.position = 'sticky';
      sidebar.style.top = '0';
      sidebar.style.overflowX = 'auto';
      sidebar.style.minHeight = 'auto';
    } else {
      // Mobile: wrapped horizontal navigation
      sidebar.style.flexDirection = 'row';
      sidebar.style.flexWrap = 'wrap';
      sidebar.style.position = 'sticky';
      sidebar.style.top = '0';
    }
  },

  /**
   * Adjust main content area
   */
  adjustMainContentLayout() {
    const main = document.querySelector('.main');
    if (!main) return;

    if (this.currentDevice === 'large-desktop' || this.currentDevice === 'desktop') {
      main.style.flex = '1';
      main.style.width = 'auto';
      main.style.overflowY = 'auto';
    } else {
      main.style.flex = '1';
      main.style.width = '100%';
      main.style.overflowY = 'auto';
    }
  },

  /**
   * Adjust table layout for readability on all devices
   */
  adjustTableLayout() {
    const tables = document.querySelectorAll('table');

    tables.forEach(table => {
      if (this.currentDevice === 'mobile') {
        // Convert table to card layout on mobile
        this.makeTableMobileOptimized(table);
      } else {
        // Keep normal table layout
        this.makeTableDesktopOptimized(table);
      }
    });
  },

  /**
   * Optimize table for mobile devices
   */
  makeTableMobileOptimized(table) {
    table.style.display = 'block';
    table.style.width = '100%';
    table.style.overflowX = 'auto';
    table.style.WebkitOverflowScrolling = 'touch';

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    if (thead) {
      thead.style.display = 'block';
      thead.style.width = '100%';
    }

    if (tbody) {
      tbody.style.display = 'block';
      tbody.style.width = '100%';
    }

    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
      row.style.display = 'block';
      row.style.width = '100%';
      row.style.borderBottom = '1px solid #e5e7eb';
    });
  },

  /**
   * Optimize table for desktop/tablet
   */
  makeTableDesktopOptimized(table) {
    table.style.display = 'table';
    table.style.width = '100%';
    table.style.overflowX = 'auto';

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    if (thead) {
      thead.style.display = 'table-header-group';
      thead.style.width = '100%';
    }

    if (tbody) {
      tbody.style.display = 'table-row-group';
      tbody.style.width = '100%';
    }

    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
      row.style.display = 'table-row';
      row.style.width = '100%';
    });
  },

  /**
   * Adjust form layout based on device
   */
  adjustFormLayout() {
    const formRows = document.querySelectorAll('.form-row');

    formRows.forEach(row => {
      if (this.currentDevice === 'mobile') {
        row.style.flexDirection = 'column';
        row.style.gap = '8px';
      } else if (this.currentDevice === 'tablet') {
        row.style.flexDirection = 'row';
        row.style.gap = '12px';
        row.style.flexWrap = 'wrap';
      } else {
        row.style.flexDirection = 'row';
        row.style.gap = '15px';
        row.style.flexWrap = 'nowrap';
      }
    });

    // Adjust form groups
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
      if (this.currentDevice === 'mobile') {
        group.style.flex = '1 1 100%';
        group.style.width = '100%';
      } else if (this.currentDevice === 'tablet') {
        group.style.flex = '1 1 calc(50% - 8px)';
      } else {
        group.style.flex = '1';
      }
    });
  },

  /**
   * Adjust button layout
   */
  adjustButtonLayout() {
    const buttons = document.querySelectorAll('.primary-btn, .secondary-btn, button[type="submit"], button[type="button"]');

    buttons.forEach(btn => {
      if (this.currentDevice === 'mobile') {
        btn.style.width = '100%';
        btn.style.minHeight = '44px';
        btn.style.fontSize = '14px';
      } else if (this.currentDevice === 'tablet') {
        btn.style.width = 'auto';
        btn.style.minHeight = '40px';
        btn.style.fontSize = '13px';
      } else {
        btn.style.width = 'auto';
        btn.style.minHeight = '38px';
        btn.style.fontSize = '14px';
      }
    });
  },

  /**
   * Get current device information
   */
  getDeviceInfo() {
    return {
      device: this.currentDevice,
      orientation: this.currentOrientation,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      isMobile: this.currentDevice === 'mobile',
      isTablet: this.currentDevice === 'tablet',
      isDesktop: this.currentDevice === 'desktop' || this.currentDevice === 'large-desktop',
      pixelRatio: window.devicePixelRatio
    };
  },

  /**
   * Check if device is mobile
   */
  isMobile() {
    return this.currentDevice === 'mobile';
  },

  /**
   * Check if device is tablet
   */
  isTablet() {
    return this.currentDevice === 'tablet';
  },

  /**
   * Check if device is desktop
   */
  isDesktop() {
    return this.currentDevice === 'desktop' || this.currentDevice === 'large-desktop';
  },

  /**
   * Get screen width
   */
  getScreenWidth() {
    return window.innerWidth;
  },

  /**
   * Get screen height
   */
  getScreenHeight() {
    return window.innerHeight;
  }
};

// Initialize responsive manager when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ResponsiveManager.init();
  });
} else {
  ResponsiveManager.init();
}

// Also initialize when window loads for safety
window.addEventListener('load', () => {
  ResponsiveManager.detectDevice();
  ResponsiveManager.adjustLayout();
});
