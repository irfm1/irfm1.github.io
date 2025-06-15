// Menu hambúrguer
document.addEventListener('DOMContentLoaded', function () {
  // Scroll suave para âncoras internas
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Modal para imagens (se existir)
  document.querySelectorAll('.responsive-img').forEach(img => {
    img.addEventListener('click', function () {
      const modal = document.getElementById('modal');
      if (modal) {
        modal.querySelector('img').src = this.src;
        modal.classList.add('active');
        setTimeout(() => {
          modal.querySelector('.modal-close').focus();
        }, 100);
      }
    });
    
    // Teclado: Enter ou Espaço abre modal
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });

  // Fechar modal
  const modal = document.getElementById('modal');
  if (modal) {
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.classList.remove('active');
    });
    // Fecha modal com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') modal.classList.remove('active');
    });
    // Fecha modal ao clicar fora da imagem
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  // Fecha menu hambúrguer ao navegar por teclado (se existir)
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('nav');
  if (hamburger && nav) {
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('focus', () => {
        nav.classList.remove('active');
        hamburger.classList.remove('active');
      });
    });
  }

  // Improve external link handling
  document.querySelectorAll('a[href^="http"]').forEach(link => {
    if (!link.hasAttribute('target')) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // Add loading state for PDF downloads
  document.querySelectorAll('a[download]').forEach(link => {
    link.addEventListener('click', function() {
      const original = this.innerHTML;
      this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Baixando...';
      this.style.pointerEvents = 'none';
      
      setTimeout(() => {
        this.innerHTML = original;
        this.style.pointerEvents = 'auto';
      }, 3000);
    });
  });

  // Improve keyboard navigation
  document.querySelectorAll('.tip-item').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // Add print functionality
  if (window.matchMedia && window.matchMedia('print').matches) {
    document.body.classList.add('print-mode');
  }

  // Enhanced Bottom Navigation Functionality
  const bottomNav = document.querySelector('.bottom-nav');
  const navLinks = bottomNav ? bottomNav.querySelectorAll('a') : [];
  
  // Define infographic pages order for navigation
  const infographicPages = [
    'senhas.html',
    'golpes.html', 
    'privacidade.html',
    'fakenews.html',
    'navegacao.html',
    'furto-celular.html'
  ];
  
  // Update active state based on current page and scroll position
  function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      
      // Check if link matches current page
      if (href && (
        (currentPage === 'index.html' && href === 'index.html') ||
        (currentPage.includes('senhas') && (href === 'senhas.html' || href === '#conteudo')) ||
        (currentPage.includes('golpes') && (href === 'golpes.html' || href === '#conteudo')) ||
        (currentPage.includes('privacidade') && (href === 'privacidade.html' || href === '#conteudo')) ||
        (currentPage.includes('navegacao') && (href === 'navegacao.html' || href === '#conteudo')) ||
        (currentPage.includes('fakenews') && (href === 'fakenews.html' || href === '#conteudo')) ||
        (currentPage.includes('furto-celular') && (href === 'furto-celular.html' || href === '#conteudo'))
      )) {
        link.classList.add('active');
      }
      
      // For index page sections (anchor links)
      if (currentPage === 'index.html' && href.startsWith('#')) {
        const section = document.querySelector(href);
        if (section && isElementInViewport(section)) {
          // Remove active from page links first
          navLinks.forEach(l => {
            if (!l.getAttribute('href').startsWith('#')) {
              l.classList.remove('active');
            }
          });
          link.classList.add('active');
        }
      }
    });
  }

  // Get next/previous infographic page
  function getNextPage(currentPage) {
    const currentIndex = infographicPages.indexOf(currentPage);
    if (currentIndex === -1) return infographicPages[0];
    return infographicPages[(currentIndex + 1) % infographicPages.length];
  }
  
  function getPreviousPage(currentPage) {
    const currentIndex = infographicPages.indexOf(currentPage);
    if (currentIndex === -1) return infographicPages[infographicPages.length - 1];
    return infographicPages[currentIndex === 0 ? infographicPages.length - 1 : currentIndex - 1];
  }

  // Check if element is in viewport
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top <= windowHeight * 0.3 && rect.bottom >= windowHeight * 0.3;
  }

  // Enhanced smooth scrolling for navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Handle anchor links with smooth scrolling
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          
          // Add visual feedback
          this.style.transform = 'scale(0.95)';
          setTimeout(() => {
            this.style.transform = '';
          }, 150);
          
          // Smooth scroll to target
          target.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update active state after scroll
          setTimeout(() => {
            updateActiveNavLink();
          }, 500);
        }
      }
      
      // Handle page navigation with loading feedback
      if (href && !href.startsWith('#') && href !== window.location.pathname.split('/').pop()) {
        // Add loading state
        const icon = this.querySelector('i');
        const originalIcon = icon ? icon.className : '';
        if (icon) {
          icon.className = 'fa-solid fa-spinner fa-spin';
        }
        
        // Reset after short delay (browser will navigate)
        setTimeout(() => {
          if (icon) icon.className = originalIcon;
        }, 200);
      }
    });

    // Keyboard navigation support
    link.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
      
      // Arrow key navigation
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const currentIndex = Array.from(navLinks).indexOf(this);
        let nextIndex;
        
        if (e.key === 'ArrowLeft') {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : navLinks.length - 1;
        } else {
          nextIndex = currentIndex < navLinks.length - 1 ? currentIndex + 1 : 0;
        }
        
        navLinks[nextIndex].focus();
      }
    });

    // Touch feedback for mobile
    link.addEventListener('touchstart', function() {
      this.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
    });

    link.addEventListener('touchend', function() {
      setTimeout(() => {
        this.style.backgroundColor = '';
      }, 150);
    });
  });

  // Update active state on page load and scroll
  updateActiveNavLink();
  
  // Throttled scroll listener for better performance
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(updateActiveNavLink, 100);
  });

  // Update active state when page visibility changes
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      updateActiveNavLink();
    }
  });

  // Add swipe gesture support for mobile navigation
  if (bottomNav && 'ontouchstart' in window) {
    let startX = 0;
    let startY = 0;

    bottomNav.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    bottomNav.addEventListener('touchmove', function(e) {
      if (!startX || !startY) return;
      
      const diffX = startX - e.touches[0].clientX;
      const diffY = startY - e.touches[0].clientY;
      
      // Only handle horizontal swipes
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        const activeLink = bottomNav.querySelector('.active');
        if (activeLink) {
          const currentIndex = Array.from(navLinks).indexOf(activeLink);
          let nextIndex;
          
          if (diffX > 0) { // Swipe left - next item
            nextIndex = currentIndex < navLinks.length - 1 ? currentIndex + 1 : 0;
          } else { // Swipe right - previous item
            nextIndex = currentIndex > 0 ? currentIndex - 1 : navLinks.length - 1;
          }
          
          navLinks[nextIndex].click();
        }
        
        startX = 0;
        startY = 0;
      }
    });
  }

  // Add haptic feedback for supported devices
  function addHapticFeedback(element) {
    if ('vibrate' in navigator) {
      element.addEventListener('click', function() {
        navigator.vibrate(50);
      });
    }
  }

  navLinks.forEach(addHapticFeedback);

  // Hide/show bottom nav on scroll (mobile optimization)
  let lastScrollY = window.scrollY;
  let isNavVisible = true;

  function handleNavVisibility() {
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;
    const scrollThreshold = 100;

    if (window.innerWidth <= 768) { // Only on mobile
      if (scrollingDown && currentScrollY > scrollThreshold && isNavVisible) {
        // Hide nav
        bottomNav.style.transform = 'translateY(100%)';
        isNavVisible = false;
      } else if (!scrollingDown && !isNavVisible) {
        // Show nav
        bottomNav.style.transform = 'translateY(0)';
        isNavVisible = true;
      }
    } else {
      // Always show on desktop
      bottomNav.style.transform = 'translateY(0)';
      isNavVisible = true;
    }

    lastScrollY = currentScrollY;
  }

  // Throttled scroll listener for nav visibility
  let navScrollTimeout;
  window.addEventListener('scroll', function() {
    if (navScrollTimeout) {
      clearTimeout(navScrollTimeout);
    }
    navScrollTimeout = setTimeout(handleNavVisibility, 10);
  });
});
