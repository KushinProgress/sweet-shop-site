/**
 * Badnaam Lassi & Sweets House - Pilibhit, Uttar Pradesh
 * High-performance vanilla JavaScript for interactions, cart & animations
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- 1. Sticky Header & Scroll Spy ---
  const header = document.querySelector('.main-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const backToTopBtn = document.getElementById('backToTopBtn');

  const handleScroll = () => {
    const scrollY = window.scrollY;

    // Header styling on scroll
    if (scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Back to top button visibility
    if (scrollY > 400) {
      backToTopBtn?.classList.add('visible');
    } else {
      backToTopBtn?.classList.remove('visible');
    }

    // Active Section Scroll Spy
    let currentId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- 2. Mobile Navigation Drawer ---
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileNavClose = document.getElementById('mobileNavClose');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  const openMobileMenu = () => {
    mobileNavDrawer?.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    mobileNavDrawer?.classList.remove('active');
    document.body.style.overflow = '';
  };

  mobileMenuBtn?.addEventListener('click', openMobileMenu);
  mobileNavClose?.addEventListener('click', closeMobileMenu);
  mobileNavDrawer?.addEventListener('click', (e) => {
    if (e.target === mobileNavDrawer) closeMobileMenu();
  });
  mobileNavLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

  // --- 3. Scroll Reveal Animations (IntersectionObserver) ---
  const revealElements = document.querySelectorAll('.fade-in-up');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('in-view'));
  }

  // --- 4. Menu Filtering & Live Search ---
  const menuTabs = document.querySelectorAll('.menu-tab-btn');
  const menuCards = document.querySelectorAll('.menu-card');
  const searchInput = document.getElementById('menuSearchInput');
  const menuEmptyState = document.getElementById('menuEmptyState');

  let activeCategory = 'all';
  let searchQuery = '';

  const filterMenu = () => {
    let visibleCount = 0;

    menuCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category') || '';
      const cardTitle = (card.querySelector('.menu-card-title')?.textContent || '').toLowerCase();
      const cardHindi = (card.querySelector('.menu-card-hindi')?.textContent || '').toLowerCase();
      const cardDesc = (card.querySelector('.menu-card-desc')?.textContent || '').toLowerCase();
      const cardTags = (card.querySelector('.menu-card-tag')?.textContent || '').toLowerCase();

      const matchesCategory = activeCategory === 'all' || cardCategory.includes(activeCategory);
      const matchesSearch = !searchQuery || 
        cardTitle.includes(searchQuery) || 
        cardHindi.includes(searchQuery) || 
        cardDesc.includes(searchQuery) || 
        cardTags.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (menuEmptyState) {
      menuEmptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  };

  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      menuTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-category');
      filterMenu();
    });
  });

  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    filterMenu();
  });

  // --- 5. Interactive WhatsApp Quick Order Basket / Cart ---
  const cartToggleBtns = document.querySelectorAll('.cart-toggle-trigger');
  const orderDrawerBackdrop = document.getElementById('orderDrawerBackdrop');
  const orderDrawer = document.getElementById('orderDrawer');
  const orderDrawerClose = document.getElementById('orderDrawerClose');
  const orderDrawerItems = document.getElementById('orderDrawerItems');
  const orderDrawerEmpty = document.getElementById('orderDrawerEmpty');
  const orderDrawerFooter = document.getElementById('orderDrawerFooter');
  const orderSubtotalAmount = document.getElementById('orderSubtotalAmount');
  const cartBadges = document.querySelectorAll('.cart-badge');
  const sendWhatsAppOrderBtn = document.getElementById('sendWhatsAppOrderBtn');

  // Shop WhatsApp Number (Pilibhit)
  const SHOP_PHONE = '919412078654';

  let cart = [];

  // Try loading cart from localStorage
  try {
    const saved = localStorage.getItem('badnaam_cart');
    if (saved) cart = JSON.parse(saved);
  } catch (err) {
    console.warn('Could not read cart from localStorage', err);
  }

  const saveCart = () => {
    try {
      localStorage.setItem('badnaam_cart', JSON.stringify(cart));
    } catch (e) {
      // ignore
    }
  };

  const updateCartUI = () => {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Update badges
    cartBadges.forEach(badge => {
      badge.textContent = totalItems;
      badge.style.display = totalItems > 0 ? 'flex' : 'none';
      // subtle bounce animation
      badge.style.transform = 'scale(1.3)';
      setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
    });

    // Update Drawer Contents
    if (orderDrawerItems) {
      if (cart.length === 0) {
        if (orderDrawerEmpty) orderDrawerEmpty.style.display = 'block';
        if (orderDrawerFooter) orderDrawerFooter.style.display = 'none';
        orderDrawerItems.innerHTML = '';
      } else {
        if (orderDrawerEmpty) orderDrawerEmpty.style.display = 'none';
        if (orderDrawerFooter) orderDrawerFooter.style.display = 'block';

        orderDrawerItems.innerHTML = cart.map(item => `
          <div class="order-item-row" data-id="${item.id}">
            <div class="order-item-info">
              <div class="order-item-name">${item.name}</div>
              <div class="order-item-price">₹${item.price} ${item.unit ? `(${item.unit})` : ''}</div>
            </div>
            <div class="order-item-controls">
              <button type="button" class="order-qty-btn btn-qty-minus" data-id="${item.id}" aria-label="Decrease quantity">−</button>
              <span class="order-qty-num">${item.qty}</span>
              <button type="button" class="order-qty-btn btn-qty-plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
        `).join('');

        // Attach listeners for +/-
        orderDrawerItems.querySelectorAll('.btn-qty-minus').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const found = cart.find(i => i.id === id);
            if (found) {
              found.qty--;
              if (found.qty <= 0) {
                cart = cart.filter(i => i.id !== id);
              }
              saveCart();
              updateCartUI();
            }
          });
        });

        orderDrawerItems.querySelectorAll('.btn-qty-plus').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const found = cart.find(i => i.id === id);
            if (found) {
              found.qty++;
              saveCart();
              updateCartUI();
            }
          });
        });
      }
    }

    if (orderSubtotalAmount) {
      orderSubtotalAmount.textContent = `₹${subtotal}`;
    }
  };

  const openOrderDrawer = () => {
    orderDrawerBackdrop?.classList.add('active');
    orderDrawer?.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeOrderDrawer = () => {
    orderDrawerBackdrop?.classList.remove('active');
    orderDrawer?.classList.remove('active');
    document.body.style.overflow = '';
  };

  cartToggleBtns.forEach(btn => btn.addEventListener('click', openOrderDrawer));
  orderDrawerClose?.addEventListener('click', closeOrderDrawer);
  orderDrawerBackdrop?.addEventListener('click', closeOrderDrawer);

  // Add To Order Buttons in Menu Cards
  document.querySelectorAll('.btn-add-order').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price') || '0');
      const unit = btn.getAttribute('data-unit') || '';

      const existing = cart.find(i => i.id === id);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({ id, name, price, unit, qty: 1 });
      }

      saveCart();
      updateCartUI();

      // Button feedback
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span>✓ Added</span>`;
      btn.style.background = 'var(--color-veg)';
      btn.style.color = '#FFFFFF';
      btn.style.borderColor = 'var(--color-veg)';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.style.borderColor = '';
      }, 1200);
    });
  });

  // Send Order via WhatsApp
  sendWhatsAppOrderBtn?.addEventListener('click', () => {
    if (cart.length === 0) return;

    let message = `*Namaste Badnaam Lassi & Sweets House, Pilibhit!* 🙏\n`;
    message += `I would like to place an order from your website:\n\n`;

    let total = 0;
    cart.forEach((item, index) => {
      const itemSubtotal = item.price * item.qty;
      total += itemSubtotal;
      message += `${index + 1}. *${item.name}* x ${item.qty} = ₹${itemSubtotal}\n`;
    });

    message += `\n*Total Estimated Amount:* ₹${total}\n`;
    message += `\n📍 Please confirm order availability and pickup/home delivery time. Thank you!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${SHOP_PHONE}?text=${encoded}`, '_blank');
  });

  // Initial cart UI render
  updateCartUI();

  // --- 6. Gallery Filtering & Fullscreen Lightbox Modal ---
  const galleryTabs = document.querySelectorAll('.gallery-tab-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxSub = document.getElementById('lightboxSub');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentGalleryIndex = 0;
  let activeGalleryItems = Array.from(galleryItems);

  // Filter gallery
  galleryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      galleryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.getAttribute('data-gallery-category');

      activeGalleryItems = [];
      galleryItems.forEach(item => {
        const itemCat = item.getAttribute('data-category') || '';
        if (cat === 'all' || itemCat.includes(cat)) {
          item.style.display = 'block';
          activeGalleryItems.push(item);
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Open Lightbox
  const showLightboxImage = (index) => {
    if (activeGalleryItems.length === 0) return;
    if (index < 0) index = activeGalleryItems.length - 1;
    if (index >= activeGalleryItems.length) index = 0;
    currentGalleryIndex = index;

    const item = activeGalleryItems[currentGalleryIndex];
    const imgUrl = item.getAttribute('data-full') || item.querySelector('img')?.src;
    const title = item.getAttribute('data-title') || item.querySelector('.gallery-item-title')?.textContent;
    const desc = item.getAttribute('data-desc') || item.querySelector('.gallery-item-sub')?.textContent;

    if (lightboxImg) lightboxImg.src = imgUrl;
    if (lightboxCaption) lightboxCaption.textContent = title || '';
    if (lightboxSub) lightboxSub.textContent = desc || '';

    lightboxModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const idx = activeGalleryItems.indexOf(item);
      showLightboxImage(idx >= 0 ? idx : 0);
    });
  });

  const closeLightbox = () => {
    lightboxModal?.classList.remove('active');
    document.body.style.overflow = '';
  };

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', (e) => {
    e.stopPropagation();
    showLightboxImage(currentGalleryIndex - 1);
  });
  lightboxNext?.addEventListener('click', (e) => {
    e.stopPropagation();
    showLightboxImage(currentGalleryIndex + 1);
  });

  lightboxModal?.addEventListener('click', (e) => {
    if (e.target === lightboxModal) closeLightbox();
  });

  // Keyboard navigation for Lightbox & Drawers
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeOrderDrawer();
      closeMobileMenu();
    }
    if (lightboxModal?.classList.contains('active')) {
      if (e.key === 'ArrowLeft') showLightboxImage(currentGalleryIndex - 1);
      if (e.key === 'ArrowRight') showLightboxImage(currentGalleryIndex + 1);
    }
  });

  // --- 7. Catering / Bulk Order Contact Form ---
  const cateringForm = document.getElementById('cateringInquiryForm');
  const formSuccess = document.getElementById('formSuccessMessage');

  cateringForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('formName')?.value.trim();
    const phone = document.getElementById('formPhone')?.value.trim();
    const eventDate = document.getElementById('formDate')?.value;
    const occasion = document.getElementById('formOccasion')?.value;
    const items = document.getElementById('formItems')?.value.trim();
    const message = document.getElementById('formMessage')?.value.trim();

    if (!name || !phone) {
      alert('Please provide your name and phone number so we can assist you!');
      return;
    }

    // Show friendly success confirmation
    if (formSuccess) {
      formSuccess.style.display = 'flex';
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Prefill WhatsApp link for one-tap submission
    let waText = `*New Catering / Bulk Mithai Inquiry - Badnaam Lassi Pilibhit*\n`;
    waText += `👤 *Name:* ${name}\n`;
    waText += `📞 *Phone:* ${phone}\n`;
    if (occasion) waText += `🎉 *Occasion:* ${occasion}\n`;
    if (eventDate) waText += `📅 *Date of Event:* ${eventDate}\n`;
    if (items) waText += `🍬 *Sweets / Lassi Required:* ${items}\n`;
    if (message) waText += `📝 *Notes:* ${message}\n`;

    const sendViaWaBtn = document.getElementById('sendInquiryViaWABtn');
    if (sendViaWaBtn) {
      sendViaWaBtn.onclick = () => {
        window.open(`https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(waText)}`, '_blank');
      };
    }

    cateringForm.reset();
  });
});
