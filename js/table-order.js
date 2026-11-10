/**
 * Badnaam Lassi & Sweets House - Dine-In Table QR Ordering & Live Kitchen Preparation Tracker
 */

(function() {
  'use strict';

  // --- State ---
  let activeTable = '4'; // Default fallback
  let cart = []; // Array of { id, name, price, qty, prepTime }
  let currentPayMethod = 'UPI';
  let countdownInterval = null;
  let remainingSeconds = 0;
  let totalDurationSeconds = 0;
  let confirmedOrderData = null;

  // --- DOM Elements ---
  const tableBadge = document.getElementById('tableBadge');
  const activeTableText = document.getElementById('activeTableText');
  const switchTableBtn = document.getElementById('switchTableBtn');
  const tableSelectCard = document.getElementById('tableSelectCard');
  const tableChipsGrid = document.getElementById('tableChipsGrid');
  const confirmTableSelectBtn = document.getElementById('confirmTableSelectBtn');
  const tableMenuSection = document.getElementById('tableMenuSection');
  const currentTableTitle = document.getElementById('currentTableTitle');

  const tableBottomBar = document.getElementById('tableBottomBar');
  const barItemCount = document.getElementById('barItemCount');
  const barTotalPrice = document.getElementById('barTotalPrice');
  const openCheckoutModalBtn = document.getElementById('openCheckoutModalBtn');

  const checkoutBackdrop = document.getElementById('checkoutBackdrop');
  const checkoutSheet = document.getElementById('checkoutSheet');
  const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
  const modalTableNumber = document.getElementById('modalTableNumber');
  const checkoutBillItems = document.getElementById('checkoutBillItems');
  const billSubtotal = document.getElementById('billSubtotal');
  const billGst = document.getElementById('billGst');
  const billGrandTotal = document.getElementById('billGrandTotal');
  const payBtnAmount = document.getElementById('payBtnAmount');
  const dynamicUpiQr = document.getElementById('dynamicUpiQr');
  const upiIntentLink = document.getElementById('upiIntentLink');
  const confirmOrderAndPayBtn = document.getElementById('confirmOrderAndPayBtn');

  const kitchenTrackerView = document.getElementById('kitchenTrackerView');
  const confirmedOrderId = document.getElementById('confirmedOrderId');
  const confirmedTableLabel = document.getElementById('confirmedTableLabel');
  const confirmedPayMethod = document.getElementById('confirmedPayMethod');
  const prepTimerDisplay = document.getElementById('prepTimerDisplay');
  const prepStatusMessage = document.getElementById('prepStatusMessage');
  const prepProgressFill = document.getElementById('prepProgressFill');
  const trackerTotalAmount = document.getElementById('trackerTotalAmount');
  const trackerItemsList = document.getElementById('trackerItemsList');
  const sendKitchenSlipWhatsAppBtn = document.getElementById('sendKitchenSlipWhatsAppBtn');
  const callWaiterBtn = document.getElementById('callWaiterBtn');
  const orderMoreItemsBtn = document.getElementById('orderMoreItemsBtn');
  const waiterAlertNote = document.getElementById('waiterAlertNote');

  // QR Stand Modal Elements
  const openQrStandBtn = document.getElementById('openQrStandBtn');
  const qrStandBackdrop = document.getElementById('qrStandBackdrop');
  const qrStandSheet = document.getElementById('qrStandSheet');
  const closeQrStandBtn = document.getElementById('closeQrStandBtn');
  const standTableSelect = document.getElementById('standTableSelect');
  const standDisplayNum = document.getElementById('standDisplayNum');
  const standQrImg = document.getElementById('standQrImg');

  // --- 1. Initialize Table from URL or Storage ---
  function initTable() {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');

    if (tableParam && /^[0-9A-Za-z]+$/.test(tableParam)) {
      activeTable = tableParam;
      localStorage.setItem('badnaam_active_table', activeTable);
      setTableUI(activeTable);
      tableSelectCard.style.display = 'none';
      tableMenuSection.style.display = 'block';
    } else {
      const saved = localStorage.getItem('badnaam_active_table');
      if (saved) {
        activeTable = saved;
        setTableUI(activeTable);
        tableSelectCard.style.display = 'none';
        tableMenuSection.style.display = 'block';
      } else {
        // Show table picker
        tableSelectCard.style.display = 'block';
        tableMenuSection.style.display = 'none';
      }
    }
    renderTableChips();
    updateQrStandPreview(activeTable);
  }

  function setTableUI(num) {
    const formatted = `Table #${String(num).padStart(2, '0')}`;
    activeTableText.textContent = formatted;
    currentTableTitle.textContent = formatted;
    modalTableNumber.textContent = `${formatted} (Dine-In)`;
    document.getElementById('alertTableNum').textContent = num;
  }

  function renderTableChips() {
    tableChipsGrid.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `table-chip-btn ${String(i) === String(activeTable) ? 'active' : ''}`;
      btn.textContent = `T-${i}`;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.table-chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTable = String(i);
      });
      tableChipsGrid.appendChild(btn);
    }
  }

  switchTableBtn?.addEventListener('click', () => {
    tableSelectCard.style.display = 'block';
    tableMenuSection.style.display = 'none';
    kitchenTrackerView.style.display = 'none';
    renderTableChips();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  confirmTableSelectBtn?.addEventListener('click', () => {
    localStorage.setItem('badnaam_active_table', activeTable);
    setTableUI(activeTable);
    tableSelectCard.style.display = 'none';
    tableMenuSection.style.display = 'block';
    updateQrStandPreview(activeTable);
  });

  // --- 2. Menu Category Filters ---
  const catTabs = document.querySelectorAll('.table-cat-tab');
  const menuCards = document.querySelectorAll('.table-item-card');

  catTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      catTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.getAttribute('data-cat');

      menuCards.forEach(card => {
        if (cat === 'all' || card.getAttribute('data-cat') === cat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- 3. Menu Quantity Selectors (+ / −) ---
  document.querySelectorAll('.table-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price') || '0');
      const prepTime = parseInt(btn.getAttribute('data-preptime') || '5', 10);

      const item = cart.find(i => i.id === id);
      if (item) {
        item.qty++;
      } else {
        cart.push({ id, name, price, qty: 1, prepTime });
      }
      updateCartUI();
    });
  });

  document.querySelectorAll('.table-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = cart.find(i => i.id === id);
      if (item) {
        item.qty--;
        if (item.qty <= 0) {
          cart = cart.filter(i => i.id !== id);
        }
        updateCartUI();
      }
    });
  });

  function updateCartUI() {
    // Update count labels on menu cards
    document.querySelectorAll('.table-qty-count').forEach(span => {
      span.textContent = '0';
    });

    let totalCount = 0;
    let subtotal = 0;

    cart.forEach(item => {
      const span = document.getElementById(`qty-${item.id}`);
      if (span) span.textContent = item.qty;
      totalCount += item.qty;
      subtotal += item.price * item.qty;
    });

    // Update bottom bar
    if (totalCount > 0) {
      tableBottomBar.classList.add('visible');
      barItemCount.textContent = `${totalCount} Item${totalCount > 1 ? 's' : ''} • Table #${String(activeTable).padStart(2, '0')}`;
      barTotalPrice.textContent = `₹${subtotal}`;
    } else {
      tableBottomBar.classList.remove('visible');
    }
  }

  // --- 4. Checkout Modal & Bill Calculation ---
  openCheckoutModalBtn?.addEventListener('click', () => {
    if (cart.length === 0) return;

    let subtotal = 0;
    checkoutBillItems.innerHTML = cart.map(item => {
      const itemTotal = item.price * item.qty;
      subtotal += itemTotal;
      return `
        <div class="bill-row" style="align-items: center;">
          <div>
            <strong style="color: var(--color-maroon-900);">${item.name}</strong>
            <div style="font-size: 0.775rem; color: var(--text-secondary);">₹${item.price} × ${item.qty}</div>
          </div>
          <span style="font-weight: 700; color: var(--color-maroon-800);">₹${itemTotal}</span>
        </div>
      `;
    }).join('');

    const gst = Math.round(subtotal * 0.05); // 5% GST
    const grandTotal = subtotal + gst;

    billSubtotal.textContent = `₹${subtotal}`;
    billGst.textContent = `₹${gst}`;
    billGrandTotal.textContent = `₹${grandTotal}`;
    payBtnAmount.textContent = `₹${grandTotal}`;

    // Generate Dynamic UPI QR & Intent Link
    updateUpiPayment(grandTotal);

    checkoutBackdrop.classList.add('active');
    checkoutSheet.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  const closeCheckout = () => {
    checkoutBackdrop.classList.remove('active');
    checkoutSheet.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeCheckoutBtn?.addEventListener('click', closeCheckout);
  checkoutBackdrop?.addEventListener('click', closeCheckout);

  window.selectPayMethod = function(method) {
    currentPayMethod = method;
    const upiBtn = document.getElementById('payMethodUpiBtn');
    const cashBtn = document.getElementById('payMethodCashBtn');
    const upiSec = document.getElementById('upiQrSection');
    const cashSec = document.getElementById('cashNoteSection');

    if (method === 'UPI') {
      upiBtn?.classList.add('active');
      cashBtn?.classList.remove('active');
      if (upiSec) upiSec.style.display = 'block';
      if (cashSec) cashSec.style.display = 'none';
      confirmOrderAndPayBtn.innerHTML = `Confirm UPI Payment (${payBtnAmount.textContent}) &rarr;`;
    } else {
      cashBtn?.classList.add('active');
      upiBtn?.classList.remove('active');
      if (upiSec) upiSec.style.display = 'none';
      if (cashSec) cashSec.style.display = 'block';
      confirmOrderAndPayBtn.innerHTML = `Confirm Order &amp; Pay to Waiter (${payBtnAmount.textContent}) &rarr;`;
    }
  };

  function updateUpiPayment(total) {
    const upiString = `upi://pay?pa=badnaamlassi@upi&pn=Badnaam%20Lassi&am=${total}&cu=INR&tn=Table%20${activeTable}%20Order`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}&margin=8`;
    
    if (dynamicUpiQr) dynamicUpiQr.src = qrUrl;
    if (upiIntentLink) upiIntentLink.href = upiString;
  }

  // --- 5. Order Confirmation & Live Kitchen Preparation Tracker ---
  confirmOrderAndPayBtn?.addEventListener('click', () => {
    if (cart.length === 0) return;

    // Calculate dynamic preparation time
    // Base 4 mins + max item prepTime
    const maxItemTime = Math.max(...cart.map(i => i.prepTime || 4));
    const totalMinutes = Math.min(25, Math.max(5, maxItemTime + 2)); // e.g. 8 to 15 mins
    totalDurationSeconds = totalMinutes * 60;
    remainingSeconds = totalDurationSeconds;

    const orderId = `#BL-${Math.floor(1000 + Math.random() * 9000)}`;
    const guestPhone = document.getElementById('guestContact')?.value.trim() || '';

    let subtotal = 0;
    cart.forEach(i => subtotal += (i.price * i.qty));
    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + gst;

    confirmedOrderData = {
      orderId,
      table: activeTable,
      items: [...cart],
      total,
      payMethod: currentPayMethod,
      phone: guestPhone,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    closeCheckout();
    tableBottomBar.classList.remove('visible');
    tableMenuSection.style.display = 'none';
    tableSelectCard.style.display = 'none';
    kitchenTrackerView.style.display = 'block';

    // Populate Tracker UI
    confirmedOrderId.textContent = orderId;
    confirmedTableLabel.textContent = `Table #${String(activeTable).padStart(2, '0')}`;
    confirmedPayMethod.textContent = currentPayMethod === 'UPI' ? '✓ Paid via UPI' : 'Pay Cash to Table Attendant';
    trackerTotalAmount.textContent = `₹${total}`;

    trackerItemsList.innerHTML = confirmedOrderData.items.map(item => `
      <div style="display:flex; justify-content:space-between; padding: 0.25rem 0;">
        <span>${item.qty} × ${item.name}</span>
        <span style="font-weight:700;">₹${item.price * item.qty}</span>
      </div>
    `).join('');

    // Start Live Preparation Countdown
    startKitchenCountdown();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  function startKitchenCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);

    updateCountdownDisplay();

    countdownInterval = setInterval(() => {
      remainingSeconds--;
      if (remainingSeconds <= 0) {
        remainingSeconds = 0;
        clearInterval(countdownInterval);
        onPreparationComplete();
      }
      updateCountdownDisplay();
    }, 1000);
  }

  function updateCountdownDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    prepTimerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Progress percentage
    const elapsed = totalDurationSeconds - remainingSeconds;
    const pct = Math.min(100, Math.max(5, (elapsed / totalDurationSeconds) * 100));
    prepProgressFill.style.width = `${pct}%`;

    // Dynamic Step & Message
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const step4 = document.getElementById('step4');

    if (pct < 20) {
      prepStatusMessage.textContent = '📋 Order received! Head Halwai has entered KOT into the kitchen counter.';
      step1.className = 'step-node completed';
      step2.className = 'step-node active';
      step3.className = 'step-node';
      step4.className = 'step-node';
    } else if (pct < 70) {
      prepStatusMessage.textContent = '🍳 Fresh preparation in kadhai & live churning of thick Rabdi Lassi underway...';
      step1.className = 'step-node completed';
      step2.className = 'step-node active';
      step3.className = 'step-node';
      step4.className = 'step-node';
    } else if (pct < 98) {
      prepStatusMessage.textContent = '🏺 Plating in authentic baked earthen kulhads & garnishing with saffron pistachios...';
      step1.className = 'step-node completed';
      step2.className = 'step-node completed';
      step3.className = 'step-node active';
      step4.className = 'step-node';
    } else {
      prepStatusMessage.textContent = `🎉 Order is ready! Table attendant is serving hot delicacies to Table #${activeTable}.`;
      step1.className = 'step-node completed';
      step2.className = 'step-node completed';
      step3.className = 'step-node completed';
      step4.className = 'step-node completed';
    }
  }

  function onPreparationComplete() {
    prepTimerDisplay.textContent = '00:00';
    prepStatusMessage.innerHTML = `<span style="color: #10B981; font-weight: 800;">✓ Served hot & fresh to Table #${activeTable}! Bon Appétit!</span>`;
    playSuccessChime();
  }

  function playSuccessChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.log('Audio chime not permitted by browser autoplay policy.');
    }
  }

  // Call Table Waiter Action
  callWaiterBtn?.addEventListener('click', () => {
    waiterAlertNote.style.display = 'block';
    callWaiterBtn.textContent = '✓ Attendant Summoned';
    callWaiterBtn.style.background = '#047857';
    callWaiterBtn.style.color = '#FFFFFF';
    callWaiterBtn.style.borderColor = '#047857';
    setTimeout(() => {
      waiterAlertNote.style.display = 'none';
      callWaiterBtn.textContent = '🔔 Call Table Attendant';
      callWaiterBtn.style.background = '';
      callWaiterBtn.style.color = '';
      callWaiterBtn.style.borderColor = '';
    }, 5000);
  });

  // Send Slip to Kitchen WhatsApp
  sendKitchenSlipWhatsAppBtn?.addEventListener('click', () => {
    if (!confirmedOrderData) return;

    let text = `*Namaste Badnaam Lassi Kitchen Desk!* 🔔%0A`;
    text += `*New Dine-In Order:* ${confirmedOrderData.orderId}%0A`;
    text += `*Table:* Table %23${confirmedOrderData.table} (Station Road Flagship)%0A`;
    text += `*Payment:* ${encodeURIComponent(confirmedOrderData.payMethod)}%0A`;
    text += `*Time:* ${encodeURIComponent(confirmedOrderData.timestamp)}%0A%0A`;
    text += `*Items Ordered:*%0A`;
    confirmedOrderData.items.forEach(i => {
      text += `• ${i.qty} × ${encodeURIComponent(i.name)} (₹${i.price * i.qty})%0A`;
    });
    text += `%0A*Total Amount:* ₹${confirmedOrderData.total}%0A`;
    if (confirmedOrderData.phone) {
      text += `*Customer Mobile:* ${encodeURIComponent(confirmedOrderData.phone)}%0A`;
    }
    text += `%0APlease verify KOT and prepare fresh!`;

    window.open(`https://wa.me/919412078654?text=${text}`, '_blank');
  });

  // Order More Items
  orderMoreItemsBtn?.addEventListener('click', () => {
    cart = [];
    updateCartUI();
    kitchenTrackerView.style.display = 'none';
    tableMenuSection.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- 6. Acrylic Table QR Stand Generator & Previewer ---
  openQrStandBtn?.addEventListener('click', () => {
    updateQrStandPreview(activeTable);
    qrStandBackdrop.classList.add('active');
    qrStandSheet.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  const closeQrStand = () => {
    qrStandBackdrop.classList.remove('active');
    qrStandSheet.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeQrStandBtn?.addEventListener('click', closeQrStand);
  qrStandBackdrop?.addEventListener('click', closeQrStand);

  standTableSelect?.addEventListener('change', (e) => {
    updateQrStandPreview(e.target.value);
  });

  function updateQrStandPreview(tableNum) {
    const formatted = `Table #${String(tableNum).padStart(2, '0')}`;
    if (standDisplayNum) standDisplayNum.textContent = formatted;
    if (standTableSelect) standTableSelect.value = tableNum;

    // Build the URL that customer phone will open when scanning the table QR code
    // Uses the current site host (whether localhost or GitHub Pages)
    const baseUrl = window.location.origin + window.location.pathname.replace(/[^\/]+$/, '') + 'table-order.html';
    const targetUrl = `${baseUrl}?table=${tableNum}`;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(targetUrl)}&margin=10`;
    if (standQrImg) standQrImg.src = qrUrl;
  }

  window.simulateScanSelectedTable = function() {
    const selected = standTableSelect.value || activeTable;
    closeQrStand();
    window.location.href = `table-order.html?table=${selected}`;
  };

  // --- Run on Load ---
  document.addEventListener('DOMContentLoaded', initTable);
  initTable();

})();
