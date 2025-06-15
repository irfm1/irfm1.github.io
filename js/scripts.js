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
});
