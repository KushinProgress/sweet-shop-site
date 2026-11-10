/**
 * Badnaam Lassi & Sweets House - Pilibhit, Uttar Pradesh
 * Interactive JavaScript for Header Dropdowns, Cart, Audio Ambience & Modals
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- 1. Sticky Header & Scroll Spy ---
  const header = document.getElementById('mainHeader');
  const navLinks = document.querySelectorAll('.nav-link-ref');
  const sections = document.querySelectorAll('section[id]');
  const backToTopBtn = document.getElementById('backToTopBtn');

  const handleScroll = () => {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    if (scrollY > 400) {
      backToTopBtn?.classList.add('visible');
    } else {
      backToTopBtn?.classList.remove('visible');
    }

    // Scroll Spy for nav links
    let currentId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
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

  // --- 3. Explore Dropdown Toggle for Mobile / Touch ---
  const navItemDropdown = document.querySelector('.nav-item-dropdown');
  const exploreTrigger = document.getElementById('exploreTrigger');

  exploreTrigger?.addEventListener('click', (e) => {
    if (window.innerWidth <= 1080) {
      e.preventDefault();
      navItemDropdown?.classList.toggle('open');
    }
  });

  document.addEventListener('click', (e) => {
    if (navItemDropdown && !navItemDropdown.contains(e.target)) {
      navItemDropdown.classList.remove('open');
    }
  });

  // --- 4. Scroll Reveal Animations (IntersectionObserver) ---
  const revealElements = document.querySelectorAll('.fade-in-up');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('in-view'));
  }

  // --- 5. Menu Filtering & Live Search ---
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

  // --- 6. Interactive WhatsApp Quick Order Basket / Cart ---
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

  const SHOP_PHONE = '919412078654';
  let cart = [];

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

    cartBadges.forEach(badge => {
      badge.textContent = totalItems;
      badge.style.display = totalItems > 0 ? 'flex' : 'none';
      badge.style.transform = 'scale(1.3)';
      setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
    });

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

  updateCartUI();

  // --- 7. Video Story Modal ---
  const videoPlayTrigger = document.getElementById('videoPlayTrigger');
  const storyVideoModal = document.getElementById('storyVideoModal');
  const storyVideoClose = document.getElementById('storyVideoClose');

  const openStoryModal = () => {
    storyVideoModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeStoryModal = () => {
    storyVideoModal?.classList.remove('active');
    document.body.style.overflow = '';
  };

  videoPlayTrigger?.addEventListener('click', openStoryModal);
  storyVideoClose?.addEventListener('click', closeStoryModal);
  storyVideoModal?.addEventListener('click', (e) => {
    if (e.target === storyVideoModal) closeStoryModal();
  });

  // --- 8. Ambient Sound Synthesis (Indian Sitar / Tanpura Chime) ---
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  let audioCtx = null;
  let isSoundPlaying = false;
  let ambientOscillator = null;

  const playIndianAmbientChord = () => {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (isSoundPlaying) {
        if (audioCtx.state === 'running') {
          audioCtx.suspend();
        }
        isSoundPlaying = false;
        soundToggleBtn?.classList.remove('playing');
        if (soundToggleBtn) soundToggleBtn.innerHTML = `
          <svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
        `;
        return;
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Play soft harmonized Indian Tanpura chord (Sa - Pa: D3, A3, D4)
      const freqs = [146.83, 220.00, 293.66];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = idx === 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.04 / (idx + 1), audioCtx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();

        // fade out gently after 8 seconds
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 8);
        setTimeout(() => { osc.stop(); }, 8500);
      });

      isSoundPlaying = true;
      soundToggleBtn?.classList.add('playing');
      if (soundToggleBtn) soundToggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
      `;

      setTimeout(() => {
        isSoundPlaying = false;
        soundToggleBtn?.classList.remove('playing');
        if (soundToggleBtn) soundToggleBtn.innerHTML = `
          <svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
        `;
      }, 8500);

    } catch (e) {
      console.warn('Audio synthesis not supported or blocked by browser', e);
    }
  };

  soundToggleBtn?.addEventListener('click', playIndianAmbientChord);

  // --- 9. Catering / Bulk Order Form ---
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

    if (formSuccess) {
      formSuccess.style.display = 'flex';
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

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

  // Keyboard navigation for Drawers and Modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeStoryModal();
      closeOrderDrawer();
      closeMobileMenu();
    }
  });
});
