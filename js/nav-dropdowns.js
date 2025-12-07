/**
 * Navigation Dropdown System for BNL/Axiom Interface
 * Handles dropdown menus and active state management
 */

class NavigationDropdowns {
  constructor() {
    this.activeDropdown = null;
    this.overlay = null;
    this.init();
  }

  init() {
    this.createOverlay();
    this.setupEventListeners();
    this.setActiveNavItem();
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'nav-overlay';
    document.body.appendChild(this.overlay);
  }

  setupEventListeners() {
    // Handle dropdown toggle clicks
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('.nav-dropdown-toggle');
      if (toggle) {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDropdown(toggle.closest('.nav-dropdown'));
        return;
      }

      // Handle dropdown item clicks
      const dropdownItem = e.target.closest('.nav-dropdown-item');
      if (dropdownItem && !dropdownItem.classList.contains('disabled')) {
        this.closeAllDropdowns();
        return;
      }

      // Close dropdowns when clicking outside
      if (!e.target.closest('.nav-dropdown')) {
        this.closeAllDropdowns();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllDropdowns();
      }
    });

    // Handle overlay clicks
    this.overlay.addEventListener('click', () => {
      this.closeAllDropdowns();
    });
  }

  toggleDropdown(dropdown) {
    if (this.activeDropdown === dropdown) {
      this.closeDropdown(dropdown);
    } else {
      this.closeAllDropdowns();
      this.openDropdown(dropdown);
    }
  }

  openDropdown(dropdown) {
    dropdown.classList.add('active');
    this.activeDropdown = dropdown;
    this.overlay.style.display = 'block';
  }

  closeDropdown(dropdown) {
    if (dropdown) {
      dropdown.classList.remove('active');
    }
    if (this.activeDropdown === dropdown) {
      this.activeDropdown = null;
      this.overlay.style.display = 'none';
    }
  }

  closeAllDropdowns() {
    const allDropdowns = document.querySelectorAll('.nav-dropdown.active');
    allDropdowns.forEach(dropdown => {
      dropdown.classList.remove('active');
    });
    this.activeDropdown = null;
    this.overlay.style.display = 'none';
  }

  setActiveNavItem() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop();
    
    // Remove any existing active classes
    document.querySelectorAll('.nav-dropdown-item.active').forEach(item => {
      item.classList.remove('active');
    });

    // Set active state based on current page
    const activeSelectors = {
      'ocs.html': '.nav-dropdown-item[href*="ocs.html"]',
      'rankings.html': '.nav-dropdown-item[href*="rankings.html"]',
      'upcoming-commissions.html': '.nav-dropdown-item[href*="upcoming-commissions.html"]',
      'socials.html': '.nav-dropdown-item[href*="socials.html"]',
      'bio.html': '.nav-dropdown-item[href*="bio.html"]',
      'ariella.html': '.nav-dropdown-item[href*="ocs.html"]',
      'thea.html': '.nav-dropdown-item[href*="ocs.html"]',
      'caelielle.html': '.nav-dropdown-item[href*="ocs.html"]',
      'aridoe.html': '.nav-dropdown-item[href*="ocs.html"]',
      'misc.html': '.nav-dropdown-item[href*="ocs.html"]'
    };

    const selector = activeSelectors[currentPage];
    if (selector) {
      const activeItem = document.querySelector(selector);
      if (activeItem) {
        activeItem.classList.add('active');
      }
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new NavigationDropdowns();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NavigationDropdowns;
}
