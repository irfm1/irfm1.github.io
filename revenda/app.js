let catalogData = {
  settings: {},
  categories: []
};

let allProducts = [];      // Flattened list of all visible products
let activeFilter = 'all';  // Current category filter
let searchQuery = '';      // Current search query
let activeProducts = [];   // Products matching current category + search
let activeZoomIndex = -1;  // Index of product currently zoomed in activeProducts

// DOM Elements
const elements = {
  brandTitle: document.getElementById('brand-title'),
  brandSubtitle: document.getElementById('brand-subtitle'),
  searchInput: document.getElementById('search-input'),
  clearSearch: document.getElementById('clear-search'),
  categoryTabs: document.getElementById('category-tabs'),
  productsGrid: document.getElementById('products-grid-production'),
  searchBanner: document.getElementById('search-results-banner'),
  searchQueryText: document.getElementById('search-query-text'),
  searchResultsCount: document.getElementById('search-results-count'),
  emptyState: document.getElementById('empty-state'),
  floatingWhatsapp: document.getElementById('floating-whatsapp-btn'),
  footerText: document.getElementById('footer-text'),
  footerSocials: document.getElementById('footer-socials'),
  
  // Lightbox Elements
  lightbox: document.getElementById('lightbox'),
  lightboxClose: document.getElementById('lightbox-close'),
  lightboxPrev: document.getElementById('lightbox-prev'),
  lightboxNext: document.getElementById('lightbox-next'),
  lightboxImg: document.getElementById('lightbox-img'),
  lightboxCode: document.getElementById('lightbox-code'),
  lightboxName: document.getElementById('lightbox-name'),
  lightboxDesc: document.getElementById('lightbox-desc'),
  lightboxPrice: document.getElementById('lightbox-price'),
  lightboxWhatsapp: document.getElementById('lightbox-whatsapp-btn')
};

// Start
async function init() {
  await loadProductionData();
  setupListeners();
}

// Fetch compiled static database
async function loadProductionData() {
  try {
    const response = await fetch('catalog_data_production.json');
    if (!response.ok) throw new Error('Falha ao ler dados de produção do catálogo.');
    
    catalogData = await response.json();
    
    // Flatten products
    allProducts = [];
    catalogData.categories.forEach(cat => {
      cat.products.forEach(prod => {
        allProducts.push({
          ...prod,
          categoryName: cat.name,
          categoryDisplayName: cat.displayName
        });
      });
    });

    applyCatalogSettings();
    renderCategoryTabs();
    filterAndRenderProducts();
  } catch (error) {
    console.error('Error loading production data:', error);
    elements.brandTitle.textContent = "Erro ao Carregar";
    elements.brandSubtitle.textContent = "Verifique se o catálogo foi compilado corretamente.";
  }
}

// Apply visual styles and details from catalog settings
function applyCatalogSettings() {
  const s = catalogData.settings;
  
  // Titles
  elements.brandTitle.textContent = s.catalogTitle || 'Catálogo Virtual';
  elements.brandSubtitle.textContent = s.catalogSubtitle || 'Coleção Premium';
  document.title = s.catalogTitle || 'Catálogo de Semijoias';

  // Apply custom theme colors if set
  if (s.customColor) {
    document.documentElement.style.setProperty('--accent-gold', s.customColor);
    document.documentElement.style.setProperty('--accent-gold-dark', adjustColorBrightness(s.customColor, -15));
    document.documentElement.style.setProperty('--accent-gold-light', `${s.customColor}14`);
  }

  // Footer & Social Links
  elements.footerText.textContent = s.backCoverText || 'Agradecemos a sua preferência!';
  
  let socialsHtml = '';
  if (s.contactInstagram) {
    const handle = s.contactInstagram.startsWith('@') ? s.contactInstagram : `@${s.contactInstagram}`;
    const cleanHandle = s.contactInstagram.replace('@', '');
    socialsHtml += `
      <a href="https://instagram.com/${cleanHandle}" target="_blank" class="social-link" title="Instagram">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
      </a>
    `;
  }
  
  if (s.contactWebsite) {
    let url = s.contactWebsite;
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = `https://${url}`;
    socialsHtml += `
      <a href="${url}" target="_blank" class="social-link" title="Site">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
      </a>
    `;
  }

  elements.footerSocials.innerHTML = socialsHtml;

  // Floating WhatsApp button configuration
  if (s.contactWhatsApp) {
    const cleanNum = s.contactWhatsApp.replace(/[^\d]/g, '');
    elements.floatingWhatsAppMsg = `Olá! Estou visitando o catálogo virtual e gostaria de tirar algumas dúvidas.`;
    elements.floatingWhatsapp.href = `https://wa.me/${cleanNum}?text=${encodeURIComponent(elements.floatingWhatsAppMsg)}`;
    elements.floatingWhatsapp.style.display = 'flex';
  } else {
    elements.floatingWhatsapp.style.display = 'none';
  }
}

// Render horizontal category navigation tabs
function renderCategoryTabs() {
  const tabsHtml = [
    `<button class="nav-tab ${activeFilter === 'all' ? 'active' : ''}" data-category="all">Todos os Produtos</button>`
  ];

  catalogData.categories.forEach(cat => {
    tabsHtml.push(`
      <button class="nav-tab ${activeFilter === cat.name ? 'active' : ''}" data-category="${cat.name}">
        ${cat.displayName || cat.name}
      </button>
    `);
  });

  elements.categoryTabs.innerHTML = tabsHtml.join('');

  // Tab click listeners
  elements.categoryTabs.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      elements.categoryTabs.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.category;
      
      // Auto scroll active tab to center on mobile viewports
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

      filterAndRenderProducts();
    });
  });
}

// WhatsApp link generator helper for products quotes
function getWhatsAppProductUrl(prod) {
  const phone = catalogData.settings.contactWhatsApp;
  if (!phone) return '#';

  const cleanPhone = phone.replace(/[^\d]/g, '');
  let message = `Olá! Gostaria de consultar sobre a peça do catálogo:\n\n`;
  message += `*Peça:* ${prod.name}\n`;
  if (prod.code) message += `*Referência:* ${prod.code}\n`;
  if (prod.price) message += `*Valor:* R$ ${prod.price}\n`;
  message += `\nTenho interesse em verificar a disponibilidade deste produto. Obrigado!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// Filter products based on category tab + search query, and render
function filterAndRenderProducts() {
  const s = catalogData.settings;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Filter products
  activeProducts = allProducts.filter(prod => {
    // 1. Category Filter
    if (activeFilter !== 'all' && prod.categoryName !== activeFilter) {
      return false;
    }
    
    // 2. Search Query Filter
    if (normalizedQuery) {
      const matchName = (prod.name || '').toLowerCase().includes(normalizedQuery);
      const matchCode = (prod.code || '').toLowerCase().includes(normalizedQuery);
      const matchDesc = (prod.description || '').toLowerCase().includes(normalizedQuery);
      const matchCat = (prod.categoryDisplayName || '').toLowerCase().includes(normalizedQuery);
      return matchName || matchCode || matchDesc || matchCat;
    }

    return true;
  });

  // Show/Hide search banner
  if (normalizedQuery) {
    elements.searchBanner.style.display = 'flex';
    elements.searchQueryText.textContent = searchQuery;
    elements.searchResultsCount.textContent = `${activeProducts.length} ${activeProducts.length === 1 ? 'item' : 'itens'}`;
  } else {
    elements.searchBanner.style.display = 'none';
  }

  // Handle empty state
  if (activeProducts.length === 0) {
    elements.productsGrid.style.display = 'none';
    elements.emptyState.style.display = 'block';
    return;
  }

  elements.productsGrid.style.display = 'grid';
  elements.emptyState.style.display = 'none';

  // Render product grid
  elements.productsGrid.innerHTML = activeProducts.map((prod, index) => {
    const showPrice = s.showPrices && prod.price;
    const showCode = s.showCodes && prod.code;
    const waUrl = getWhatsAppProductUrl(prod);
    const hasWhatsApp = !!s.contactWhatsApp;
    
    return `
      <div class="product-card" data-index="${index}">
        <div class="product-img-wrapper">
          <img class="product-card-img" src="${prod.relPath}" alt="${prod.name}" loading="lazy">
        </div>
        <div class="product-details">
          ${showCode ? `<span class="product-code">${prod.code}</span>` : ''}
          <h3 class="product-title">${prod.name}</h3>
          <p class="product-desc" title="${prod.description || ''}">${prod.description || ''}</p>
          <div class="product-bottom-row">
            <span class="product-price">${showPrice ? `R$ ${prod.price}` : ''}</span>
            ${hasWhatsApp ? `
            <a href="${waUrl}" target="_blank" class="btn-whatsapp-icon" title="Solicitar pelo WhatsApp">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </a>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Setup click listeners for zooming
  elements.productsGrid.querySelectorAll('.product-card').forEach(card => {
    const index = parseInt(card.dataset.index);
    // Click on image opens lightbox
    card.querySelector('.product-img-wrapper').addEventListener('click', () => {
      openZoom(index);
    });
  });
}

// Lightbox zoom functions
function openZoom(index) {
  if (index < 0 || index >= activeProducts.length) return;
  activeZoomIndex = index;
  
  const prod = activeProducts[activeZoomIndex];
  const s = catalogData.settings;

  // Set values
  elements.lightboxImg.src = prod.relPath;
  elements.lightboxName.textContent = prod.name;
  elements.lightboxDesc.textContent = prod.description || '';
  
  if (s.showCodes && prod.code) {
    elements.lightboxCode.textContent = prod.code;
    elements.lightboxCode.style.display = 'block';
  } else {
    elements.lightboxCode.style.display = 'none';
  }

  if (s.showPrices && prod.price) {
    elements.lightboxPrice.textContent = `R$ ${prod.price}`;
    elements.lightboxPrice.style.display = 'block';
  } else {
    elements.lightboxPrice.style.display = 'none';
  }

  // Setup WhatsApp Quote link
  if (s.contactWhatsApp) {
    elements.lightboxWhatsapp.href = getWhatsAppProductUrl(prod);
    elements.lightboxWhatsapp.style.display = 'flex';
  } else {
    elements.lightboxWhatsapp.style.display = 'none';
  }

  // Show lightbox
  elements.lightbox.classList.add('active');
  document.body.style.overflow = 'hidden'; // Lock background scrolling
}

function closeZoom() {
  elements.lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function navigateZoom(direction) {
  let nextIndex = activeZoomIndex + direction;
  if (nextIndex < 0) nextIndex = activeProducts.length - 1;
  if (nextIndex >= activeProducts.length) nextIndex = 0;
  
  openZoom(nextIndex);
}

// Setup events
function setupListeners() {
  // Search inputs
  elements.searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    elements.clearSearch.style.display = searchQuery ? 'block' : 'none';
    filterAndRenderProducts();
  });

  elements.clearSearch.addEventListener('click', () => {
    elements.searchInput.value = '';
    searchQuery = '';
    elements.clearSearch.style.display = 'none';
    filterAndRenderProducts();
    elements.searchInput.focus();
  });

  // Lightbox control buttons
  elements.lightboxClose.addEventListener('click', closeZoom);
  elements.lightboxPrev.addEventListener('click', () => navigateZoom(-1));
  elements.lightboxNext.addEventListener('click', () => navigateZoom(1));

  // Close lightbox clicking on overlay backdrop
  elements.lightbox.addEventListener('click', (e) => {
    if (e.target === elements.lightbox) {
      closeZoom();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!elements.lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape' || e.key === 'Esc') {
      closeZoom();
    } else if (e.key === 'ArrowLeft') {
      navigateZoom(-1);
    } else if (e.key === 'ArrowRight') {
      navigateZoom(1);
    }
  });
}

// Helper to lighten/darken hex colors
function adjustColorBrightness(hex, percent) {
  let R = parseInt(hex.substring(1, 3), 16);
  let G = parseInt(hex.substring(3, 5), 16);
  let B = parseInt(hex.substring(5, 7), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  R = (R > 0) ? R : 0;
  G = (G > 0) ? G : 0;
  B = (B > 0) ? B : 0;

  const rHex = String(R.toString(16)).padStart(2, '0');
  const gHex = String(G.toString(16)).padStart(2, '0');
  const bHex = String(B.toString(16)).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

// Bootstrap
window.addEventListener('DOMContentLoaded', init);
