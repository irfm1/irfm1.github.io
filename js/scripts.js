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

  // Modal para infográficos
  document.querySelectorAll('.responsive-img[data-modal]').forEach(img => {
    // Clique do mouse
    img.addEventListener('click', function () {
      const modal = document.getElementById('modal');
      const modalImg = modal.querySelector('img');
      modalImg.src = this.src;
      modalImg.alt = this.alt;
      modal.classList.add('active');
      // Foca botão fechar para acessibilidade
      setTimeout(() => {
        modal.querySelector('.modal-close').focus();
      }, 100);
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

  // Fecha menu hambúrguer ao navegar por teclado (Tab em link)
  if (hamburger && nav) {
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('focus', () => {
        nav.classList.remove('active');
        hamburger.classList.remove('active');
      });
    });
  }
});
