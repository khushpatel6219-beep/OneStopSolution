// StarOS Pro Main Application Core Router & Controller

import { store } from './state.js';
import { voiceAssistant } from './voiceAssistant.js';
import { paymentEngine } from './paymentEngine.js';
import { renderSidebar } from './components/sidebar.js';
import { renderNavbar } from './components/navbar.js';
import { renderDashboard, initDashboardCharts } from './components/dashboard.js';
import { renderClients, renderClientDetail } from './components/clients.js';
import { renderInsuranceModule } from './components/insurance.js';
import { renderDocumentVault, attachVaultListeners } from './components/vault.js';
import { renderReminders } from './components/reminders.js';
import { renderCalendar } from './components/calendar.js';
import { renderPaymentsModule } from './components/payments.js';
import { renderReports, attachReportExportListeners } from './components/reports.js';
import { renderAnalytics, initAnalyticsCharts } from './components/analytics.js';
import { renderSettings, attachSettingsListeners } from './components/settings.js';
import { renderSearchModal, performGlobalSearch } from './components/searchModal.js';

class AppController {
  constructor() {
    this.currentRoute = 'dashboard';
    this.selectedClientId = null;
    this.paymentsSubTab = 'ledger';
    this.init();
  }

  init() {
    const savedTheme = localStorage.getItem('staros_theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('staros_theme', 'light');
    }


    store.subscribe(() => this.render());
    window.addEventListener('hashchange', () => this.handleRoute());
    voiceAssistant.onStateChange = () => this.updateVoiceUI();


    // Run Automatic Payment Reminder Engine Check on Startup
    setTimeout(() => {
      const triggered = paymentEngine.runAutomaticReminderCheck();
      if (triggered > 0) {
        console.log(`⚡ Payment Reminder Engine auto-triggered ${triggered} notifications.`);
      }
    }, 2000);

    this.handleRoute();

    // Global Keyboard Shortcuts (Ctrl + K)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openSearchModal();
      }
      if (e.key === 'Escape') {
        this.closeSearchModal();
        this.closeGlobalModal();
        this.closeNotificationPanel();
      }
    });

    // Main View Event Delegation
    const mainEl = document.getElementById('main-view');
    if (mainEl && !this.mainClickDelegated) {
      this.mainClickDelegated = true;
      mainEl.addEventListener('click', (e) => {
        // 1. Client Card Selection
        const card = e.target.closest('.client-card');
        if (card) {
          const id = card.getAttribute('data-client-id');
          this.selectClient(id);
          return;
        }

        // 2. Client Profile Link (from Motor, Health, Life, Search)
        const clientLink = e.target.closest('a[data-client-id]');
        if (clientLink) {
          const id = clientLink.getAttribute('data-client-id');
          if (id) this.selectClient(id);
          return;
        }

        // 3. Client Edit Button
        const editBtn = e.target.closest('[data-edit-client]');
        if (editBtn) {
          const id = editBtn.getAttribute('data-edit-client');
          this.openEditClientModal(id);
          return;
        }

        // 3b. Client Family Edit Button
        const editFamBtn = e.target.closest('[data-edit-family]');
        if (editFamBtn) {
          const id = editFamBtn.getAttribute('data-edit-family');
          this.openEditFamilyModal(id);
          return;
        }

        // 3c. Client Emergency Contact Edit Button
        const editEmergBtn = e.target.closest('[data-edit-emergency]');
        if (editEmergBtn) {
          const id = editEmergBtn.getAttribute('data-edit-emergency');
          this.openEditEmergencyModal(id);
          return;
        }


        // 4. Client Delete Button
        const deleteBtn = e.target.closest('[data-delete-client]');
        if (deleteBtn) {
          const id = deleteBtn.getAttribute('data-delete-client');
          if (confirm('Are you sure you want to delete this client record?')) {
            if (store.deleteClient(id)) {
              this.showToast('Client record deleted.');
              this.render();
            }
          }
          return;
        }

        // 5. Edit Policy Buttons (Motor, Health, Life)
        const editMotorBtn = e.target.closest('[data-edit-motor]');
        if (editMotorBtn) {
          const id = editMotorBtn.getAttribute('data-edit-motor');
          this.openEditMotorModal(id);
          return;
        }

        const editHealthBtn = e.target.closest('[data-edit-health]');
        if (editHealthBtn) {
          const id = editHealthBtn.getAttribute('data-edit-health');
          this.openEditHealthModal(id);
          return;
        }

        const editLifeBtn = e.target.closest('[data-edit-life]');
        if (editLifeBtn) {
          const id = editLifeBtn.getAttribute('data-edit-life');
          this.openEditLifeModal(id);
          return;
        }

        // 5b. Send Policy SMS Button
        const sendSmsBtn = e.target.closest('[data-send-policy-sms]');
        if (sendSmsBtn) {
          const name = sendSmsBtn.getAttribute('data-send-policy-sms');
          const desc = sendSmsBtn.getAttribute('data-policy-desc');
          const dueDate = sendSmsBtn.getAttribute('data-due-date');
          const amount = sendSmsBtn.getAttribute('data-amount');
          this.openSendSmsModal(name, desc, dueDate, amount);
          return;
        }

        // 6. Client Upload Photo / Scan Button
        const uploadImgBtn = e.target.closest('[data-upload-image]');
        if (uploadImgBtn) {
          const id = uploadImgBtn.getAttribute('data-upload-image');
          this.openUploadClientImageModal(id);
          return;
        }

        // 7. Preview Image Modal Click
        const prevImgBtn = e.target.closest('[data-preview-image]');
        if (prevImgBtn) {
          const url = prevImgBtn.getAttribute('data-preview-image');
          const title = prevImgBtn.getAttribute('data-preview-title');
          this.openPreviewImageModal(title, url);
          return;
        }

        // 8. Mark Reminder / Renewal Complete Button
        const completeBtn = e.target.closest('[data-complete-reminder]');
        if (completeBtn) {
          const id = completeBtn.getAttribute('data-complete-reminder');
          store.markReminderComplete(id);
          this.showToast('Renewal resolved & policy updated!');
          return;
        }

        // 9. Payment Controls
        const sendNowBtn = e.target.closest('[data-send-reminder-now]');
        if (sendNowBtn) {
          const id = sendNowBtn.getAttribute('data-send-reminder-now');
          this.openSendReminderNowModal(id);
          return;
        }

        const markPaidBtn = e.target.closest('[data-mark-paid]');
        if (markPaidBtn) {
          const id = markPaidBtn.getAttribute('data-mark-paid');
          store.markPaymentPaid(id);
          this.showToast('Payment marked as fully Paid & settled!');
          return;
        }

        const rescheduleBtn = e.target.closest('[data-reschedule-due]');
        if (rescheduleBtn) {
          const id = rescheduleBtn.getAttribute('data-reschedule-due');
          this.openRescheduleModal(id);
          return;
        }

        const toggleAutoBtn = e.target.closest('[data-toggle-autoreminder]');
        if (toggleAutoBtn) {
          const id = toggleAutoBtn.getAttribute('data-toggle-autoreminder');
          store.toggleAutoReminders(id);
          this.showToast('Updated automatic reminder status for invoice.');
          return;
        }

        // 10. Calendar Event Edit & Delete
        const editEventBtn = e.target.closest('[data-edit-event]');
        if (editEventBtn) {
          e.stopPropagation();
          const id = editEventBtn.getAttribute('data-edit-event');
          this.openEditEventModal(id);
          return;
        }

        const deleteEventBtn = e.target.closest('[data-delete-event]');
        if (deleteEventBtn) {
          e.stopPropagation();
          const id = deleteEventBtn.getAttribute('data-delete-event');
          if (confirm('Delete this scheduled event?')) {
            store.deleteCalendarEvent(id);
            this.showToast('Event deleted from calendar.');
          }
          return;
        }

        // 11. Day Click in Calendar
        const calDay = e.target.closest('[data-calendar-day]');
        if (calDay && !e.target.closest('[data-edit-event]')) {
          const dateStr = calDay.getAttribute('data-calendar-day');
          this.openAddEventModal(dateStr);
          return;
        }
      });
    }

    console.log('🚀 StarOS Pro Business Suite initialized successfully.');
  }

  handleRoute() {
    const hash = window.location.hash.replace('#', '').trim();
    if (['sip', 'forex', 'commissions', 'employees'].includes(hash)) {
      this.currentRoute = 'dashboard';
      window.location.hash = '#dashboard';
    } else {
      this.currentRoute = hash || 'dashboard';
    }
    this.render();
  }

  selectClient(id) {
    const db = store.get();
    const client = db.clients.find(c => c.id === id);
    if (!client) return;

    this.selectedClientId = id;

    if (this.currentRoute !== 'clients') {
      window.location.hash = '#clients';
      return;
    }

    const detailContainer = document.getElementById('client-detail-container');
    if (detailContainer) {
      detailContainer.innerHTML = renderClientDetail(client, db);

      document.querySelectorAll('.client-card').forEach(card => {
        const cardId = card.getAttribute('data-client-id');
        if (cardId === id) {
          card.className = 'client-card p-3.5 rounded-lg cursor-pointer transition border bg-amber-500/15 border-amber-500/50 text-white shadow-sm';
        } else {
          card.className = 'client-card p-3.5 rounded-lg cursor-pointer transition border bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/60 text-slate-300';
        }
      });
      if (window.lucide) window.lucide.createIcons();
    }
  }

  attachClientSearchListener() {
    const searchInput = document.getElementById('client-search-input');
    if (!searchInput) return;

    searchInput.oninput = (e) => {
      const q = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.client-card');
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (!q || text.includes(q)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    };
  }

  attachSearchModalListeners() {
    const input = document.getElementById('cmd-search-input');
    const closeBtn = document.getElementById('btn-close-search-modal');
    if (input) {
      input.oninput = (e) => {
        performGlobalSearch(e.target.value);
      };
    }
    if (closeBtn) {
      closeBtn.onclick = () => this.closeSearchModal();
    }
  }

  openSearchModal() {
    const modal = document.getElementById('search-modal');
    if (modal) {
      modal.classList.remove('hidden');
      const input = document.getElementById('cmd-search-input');
      if (input) {
        input.value = '';
        input.focus();
        performGlobalSearch('');
      }
    }
  }

  closeSearchModal() {
    const modal = document.getElementById('search-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  openUploadVaultDocumentModal() {
    const container = document.getElementById('global-modal-container');
    if (!container) return;
    const db = store.get();

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-md zoho-card p-6 rounded-2xl border border-amber-500/40 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 dark:border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-slate-900 dark:text-white text-base">Upload Document to Vault</h3>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <form id="form-upload-vault-doc" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Select Client *</label>
              <select name="clientId" required class="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-[#1E293B] text-slate-900 dark:text-white focus:border-amber-400 focus:outline-none">
                ${db.clients.map(c => `<option value="${c.id}">${c.name} (${c.phone})</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Document Category / Type *</label>
              <select name="fileCategory" required class="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-[#1E293B] text-slate-900 dark:text-white focus:border-amber-400 focus:outline-none">
                <option value="Identification">Identification (PAN / Aadhaar / Passport)</option>
                <option value="Motor Insurance">Motor Insurance Policy</option>
                <option value="Vehicle RC">Vehicle RC Book</option>
                <option value="Medical Reports">Medical & Health Reports</option>
                <option value="Financial Proof">Financial & Tax Proof</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Document Title / File Name *</label>
              <input type="text" name="fileName" required placeholder="e.g. PAN Card Copy, Vehicle RC, Health Policy PDF" class="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-[#1E293B] text-slate-900 dark:text-white focus:border-amber-400 focus:outline-none" />
            </div>

            <div id="vault-dropzone" class="p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-900/40 hover:border-amber-400 transition cursor-pointer">
              <input type="file" id="vault-photo-file" accept="image/*,.pdf" required class="hidden" />
              <i data-lucide="upload-cloud" class="w-8 h-8 text-amber-500 mx-auto mb-2"></i>
              <p id="vault-file-label" class="text-xs text-slate-900 dark:text-white font-bold">Click to select document from computer / phone</p>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Supports JPG, PNG, WEBP, PDF files</p>
            </div>

            <button type="submit" class="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold transition shadow-lg shadow-amber-500/20">
              Save File to Vault Repository
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();

    const dropzone = document.getElementById('vault-dropzone');
    const fileInput = document.getElementById('vault-photo-file');
    const label = document.getElementById('vault-file-label');

    if (dropzone && fileInput) {
      dropzone.onclick = () => fileInput.click();
      fileInput.onchange = () => {
        if (fileInput.files.length > 0) {
          label.textContent = `Selected: ${fileInput.files[0].name}`;
        }
      };
    }

    document.getElementById('form-upload-vault-doc').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const file = fileInput && fileInput.files.length > 0 ? fileInput.files[0] : null;

      if (!file) {
        alert('Please select a file from your computer.');
        return;
      }

      const clientObj = db.clients.find(c => c.id === formData.get('clientId'));

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        store.addDocument({
          id: `doc-${Date.now()}`,
          clientId: formData.get('clientId'),
          clientName: clientObj ? clientObj.name : 'Client',
          fileName: formData.get('fileName'),
          documentType: formData.get('fileCategory'),
          fileCategory: formData.get('fileCategory'),
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          uploadDate: new Date().toLocaleDateString('en-IN'),
          status: 'Verified',
          fileUrl: dataUrl
        });

        this.closeGlobalModal();
        this.showToast('📄 Document uploaded & saved to Document Vault!');
        this.render();
      };
      reader.readAsDataURL(file);
    };
  }

  render() {
    const sidebarEl = document.getElementById('sidebar-container');
    const navbarEl = document.getElementById('navbar-container');
    const mainEl = document.getElementById('main-view');
    const searchModalEl = document.getElementById('search-modal-container');

    if (sidebarEl) sidebarEl.innerHTML = renderSidebar(this.currentRoute);
    if (navbarEl) navbarEl.innerHTML = renderNavbar(this.currentRoute);
    if (searchModalEl && !document.getElementById('search-modal')) {
      searchModalEl.innerHTML = renderSearchModal();
      this.attachSearchModalListeners();
    }

    if (mainEl) {
      switch (this.currentRoute) {
        case 'clients':
          mainEl.innerHTML = renderClients(this.selectedClientId);
          this.attachClientSearchListener();
          break;
        case 'motor':
          mainEl.innerHTML = renderInsuranceModule('motor');
          break;
        case 'health':
          mainEl.innerHTML = renderInsuranceModule('health');
          break;
        case 'life':
          mainEl.innerHTML = renderInsuranceModule('life');
          break;
        case 'vault':
          mainEl.innerHTML = renderDocumentVault();
          attachVaultListeners(this);
          break;
        case 'reminders':
          mainEl.innerHTML = renderReminders();
          break;
        case 'calendar':
          mainEl.innerHTML = renderCalendar();
          break;
        case 'payments':
          mainEl.innerHTML = renderPaymentsModule(this.paymentsSubTab);
          break;
        case 'reports':
          mainEl.innerHTML = renderReports();
          attachReportExportListeners(this);
          break;
        case 'analytics':
          mainEl.innerHTML = renderAnalytics();
          setTimeout(() => initAnalyticsCharts(), 50);
          break;
        case 'settings':
          mainEl.innerHTML = renderSettings();
          attachSettingsListeners(this);
          break;
        case 'dashboard':
        default:
          mainEl.innerHTML = renderDashboard();
          setTimeout(() => initDashboardCharts(), 50);
          break;
      }
    }

    if (window.lucide) window.lucide.createIcons();
    this.attachEventListeners();
    this.renderVoiceOverlay();
  }

  attachEventListeners() {
    const searchTrigger = document.getElementById('trigger-search-modal');
    if (searchTrigger) searchTrigger.onclick = () => this.openSearchModal();

    const btnVoice = document.getElementById('btn-toggle-voice');
    if (btnVoice) {
      btnVoice.onclick = () => {
        this.isAiDrawerOpen = !this.isAiDrawerOpen;
        this.renderVoiceOverlay();
      };
    }

    const btnGuideMe = document.getElementById('btn-guide-me');
    if (btnGuideMe) btnGuideMe.onclick = () => voiceAssistant.processQuery('Guide Me');

    const btnTriggerGuide = document.getElementById('btn-trigger-voice-guide');
    if (btnTriggerGuide) btnTriggerGuide.onclick = () => voiceAssistant.processQuery('Guide Me');

    const btnNotif = document.getElementById('btn-notifications');
    if (btnNotif) {
      btnNotif.onclick = (e) => {
        e.stopPropagation();
        const panel = document.getElementById('notification-panel');
        if (panel) panel.classList.toggle('hidden');
      };
    }

    const btnTheme = document.getElementById('btn-toggle-theme');
    if (btnTheme) {
      btnTheme.onclick = () => {
        const isCurrentlyLight = document.documentElement.classList.contains('light');
        if (isCurrentlyLight) {
          document.documentElement.classList.remove('light');
          document.documentElement.classList.add('dark');
          localStorage.setItem('staros_theme', 'dark');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
          localStorage.setItem('staros_theme', 'light');
        }
        this.render();
      };
    }


    const btnMobileQr = document.getElementById('btn-open-mobile-qr');
    if (btnMobileQr) {
      btnMobileQr.onclick = () => this.openMobileQrModal();
    }

    const btnClearDemo = document.getElementById('btn-clear-demo-data');
    if (btnClearDemo) {
      btnClearDemo.onclick = () => {
        if (confirm("Are you sure you want to clear all sample demo data?\n\nThis will remove sample clients, policies, and demo reminders, giving you a 100% clean workspace for your real firm entries!")) {
          store.clearAllDemoData();
          this.showToast("🧹 All demo data cleared! Workspace ready for your real firm entries.");
          this.render();
        }
      };
    }

    const btnOpenBin = document.getElementById('btn-open-recycle-bin');
    if (btnOpenBin) {
      btnOpenBin.onclick = () => this.openRecycleBinModal();
    }

    const btnOpenMsg91 = document.getElementById('btn-open-msg91-config') || document.getElementById('btn-open-msg91-modal');
    if (btnOpenMsg91) {
      btnOpenMsg91.onclick = () => this.openMsg91ConfigModal();
    }

    const btnMobileGateway = document.getElementById('btn-open-mobile-gateway');
    if (btnMobileGateway) {
      btnMobileGateway.onclick = () => this.openMobileGatewayModal();
    }





    // 📱 Mobile Navigation Hamburger Toggle & Backdrop
    const btnMobileMenu = document.getElementById('btn-toggle-mobile-menu');
    const sidebarEl = document.getElementById('sidebar-container');
    const backdropEl = document.getElementById('sidebar-backdrop');

    if (btnMobileMenu && sidebarEl) {
      btnMobileMenu.onclick = (e) => {
        e.stopPropagation();
        const isClosed = sidebarEl.classList.contains('-translate-x-full');
        if (isClosed) {
          sidebarEl.classList.remove('-translate-x-full');
          if (backdropEl) backdropEl.classList.remove('hidden');
        } else {
          sidebarEl.classList.add('-translate-x-full');
          if (backdropEl) backdropEl.classList.add('hidden');
        }
      };
    }

    if (backdropEl && sidebarEl) {
      backdropEl.onclick = () => {
        sidebarEl.classList.add('-translate-x-full');
        backdropEl.classList.add('hidden');
      };
    }

    // Close mobile drawer when a menu link is tapped
    if (sidebarEl && window.innerWidth < 768) {
      sidebarEl.querySelectorAll('a[href^="#"]').forEach(link => {
        link.onclick = () => {
          sidebarEl.classList.add('-translate-x-full');
          if (backdropEl) backdropEl.classList.add('hidden');
        };
      });
    }



    // Payment Center Sub-Tabs
    const tabLedger = document.getElementById('tab-btn-ledger');
    const tabTemplates = document.getElementById('tab-btn-templates');
    const tabLogs = document.getElementById('tab-btn-logs');
    const tabGateway = document.getElementById('tab-btn-gateway');

    if (tabLedger) tabLedger.onclick = () => { this.paymentsSubTab = 'ledger'; this.render(); };
    if (tabTemplates) tabTemplates.onclick = () => { this.paymentsSubTab = 'templates'; this.render(); };
    if (tabLogs) tabLogs.onclick = () => { this.paymentsSubTab = 'logs'; this.render(); };
    if (tabGateway) tabGateway.onclick = () => { this.paymentsSubTab = 'gateway'; this.render(); };

    const btnRunAuto = document.getElementById('btn-run-auto-reminders-now');
    if (btnRunAuto) {
      btnRunAuto.onclick = () => {
        const count = paymentEngine.runAutomaticReminderCheck();
        this.showToast(`Automated engine check complete! ${count} notifications dispatched.`);
        this.render();
      };
    }

    const btnSaveTemplates = document.getElementById('btn-save-templates');
    if (btnSaveTemplates) {
      btnSaveTemplates.onclick = () => {
        const form = document.getElementById('form-reminder-templates');
        if (form) {
          const formData = new FormData(form);
          store.updateReminderTemplates({
            whatsapp: formData.get('whatsapp'),
            sms: formData.get('sms'),
            emailSubject: formData.get('emailSubject'),
            emailBody: formData.get('emailBody')
          });
          this.showToast('Reminder message templates saved!');
        }
      };
    }

    // Quick Action Modals
    const btnAddClient = document.getElementById('btn-quick-add-client');
    const btnAddClient2 = document.getElementById('btn-quick-add-client-2');
    const btnOpenAddClientModal = document.getElementById('btn-open-add-client-modal');
    if (btnAddClient) btnAddClient.onclick = () => this.openAddClientModal();
    if (btnAddClient2) btnAddClient2.onclick = () => this.openAddClientModal();
    if (btnOpenAddClientModal) btnOpenAddClientModal.onclick = () => this.openAddClientModal();

    const btnOpenAddPayment = document.getElementById('btn-open-add-payment-modal');
    if (btnOpenAddPayment) btnOpenAddPayment.onclick = () => this.openCreateInvoiceModal();

    const btnQuickMotor = document.getElementById('btn-quick-add-motor');
    const btnOpenAddMotorModal = document.getElementById('btn-open-add-motor-modal');
    if (btnQuickMotor) btnQuickMotor.onclick = () => this.openAddMotorModal();
    if (btnOpenAddMotorModal) btnOpenAddMotorModal.onclick = () => this.openAddMotorModal();

    const btnQuickHealth = document.getElementById('btn-quick-add-health');
    const btnOpenAddHealthModal = document.getElementById('btn-open-add-health-modal');
    if (btnQuickHealth) btnQuickHealth.onclick = () => this.openAddHealthModal();
    if (btnOpenAddHealthModal) btnOpenAddHealthModal.onclick = () => this.openAddHealthModal();

    const btnOpenAddLifeModal = document.getElementById('btn-open-add-life-modal');
    if (btnOpenAddLifeModal) btnOpenAddLifeModal.onclick = () => this.openAddLifeModal();

    const btnOpenUploadModal = document.getElementById('btn-open-upload-modal');
    if (btnOpenUploadModal) btnOpenUploadModal.onclick = () => this.openUploadDocModal();

    const btnAddEvent = document.getElementById('btn-open-add-event-modal');
    if (btnAddEvent) btnAddEvent.onclick = () => this.openAddEventModal();

    const btnResetSeed = document.getElementById('btn-reset-seed');
    if (btnResetSeed) {
      btnResetSeed.onclick = () => {
        if (confirm('Reset application state to default seed data?')) {
          store.resetToSeedData();
          this.showToast('Application reset to default seed data.');
        }
      };
    }
  }

  closeNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    if (panel) panel.classList.add('hidden');
  }

  renderVoiceOverlay() {
    const container = document.getElementById('voice-assistant-overlay');
    if (!container) return;

    if (!this.isAiDrawerOpen && !voiceAssistant.isListening && !voiceAssistant.isSpeaking) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="fixed bottom-4 right-4 z-50 w-full max-w-md zoho-card rounded-2xl border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-in">
        <!-- AI Assistant Header -->
        <div class="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-extrabold shadow-md">
              <i data-lucide="bot" class="w-5 h-5"></i>
            </div>
            <div>
              <h4 class="font-extrabold text-white text-xs flex items-center gap-1.5">
                One Stop AI Assistant
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </h4>
              <p class="text-[10px] text-slate-400">Conversational CRM & Voice Assistant</p>
            </div>
          </div>
          <button id="btn-close-ai-drawer" class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Wave / Voice Animation Indicator -->
        ${(voiceAssistant.isListening || voiceAssistant.isSpeaking) ? `
          <div class="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1 h-4">
                <div class="zia-bar"></div>
                <div class="zia-bar"></div>
                <div class="zia-bar"></div>
              </div>
              <span class="text-[11px] font-bold text-amber-400">${voiceAssistant.isListening ? 'Listening to voice...' : 'Speaking answer...'}</span>
            </div>
            <button id="btn-stop-speech" class="text-[10px] text-amber-400 font-bold hover:underline">Stop Voice</button>
          </div>
        ` : ''}

        <!-- Chat Message Log -->
        <div class="p-3.5 overflow-y-auto space-y-3 custom-scrollbar flex-1 max-h-72 text-xs" id="ai-chat-messages">
          ${(voiceAssistant.messages || []).map(m => `
            <div class="flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}">
              <div class="max-w-[85%] p-3 rounded-xl whitespace-pre-line ${
                m.sender === 'user' 
                  ? 'bg-amber-500 text-slate-950 font-bold rounded-tr-none' 
                  : 'bg-slate-900 border border-slate-800 text-slate-100 font-normal rounded-tl-none shadow'
              }">
                ${m.text}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Quick Suggestion Chips -->
        <div class="p-2 bg-slate-950/60 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          <button data-ai-chip="heyy so what's today update how many pending things are remaining" class="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-400 font-semibold flex-shrink-0 border border-slate-700">
            📊 Today's Update
          </button>
          <button data-ai-chip="heyy give me client details" class="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-400 font-semibold flex-shrink-0 border border-slate-700">
            👤 Client Details
          </button>
          <button data-ai-chip="I want to add the motor insurance" class="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] text-emerald-400 font-semibold flex-shrink-0 border border-slate-700">
            🚘 Add Motor Insurance
          </button>
        </div>

        <!-- Interactive Input Form -->
        <form id="form-ai-chat" class="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <button type="button" id="btn-ai-mic" class="p-2 rounded-xl ${voiceAssistant.isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 text-amber-400 hover:bg-slate-700'} transition" title="Voice Input">
            <i data-lucide="mic" class="w-4 h-4"></i>
          </button>
          <input type="text" id="input-ai-text" placeholder="Type or ask AI (e.g. give me client details)..." class="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none" />
          <button type="submit" class="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold transition" title="Send Message">
            <i data-lucide="send" class="w-4 h-4"></i>
          </button>
        </form>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Auto scroll chat to bottom
    const logContainer = document.getElementById('ai-chat-messages');
    if (logContainer) logContainer.scrollTop = logContainer.scrollHeight;

    const btnClose = document.getElementById('btn-close-ai-drawer');
    if (btnClose) {
      btnClose.onclick = () => {
        this.isAiDrawerOpen = false;
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        this.renderVoiceOverlay();
      };
    }

    const btnStop = document.getElementById('btn-stop-speech');
    if (btnStop) {
      btnStop.onclick = () => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        voiceAssistant.isSpeaking = false;
        voiceAssistant.notifyState();
      };
    }

    const btnMic = document.getElementById('btn-ai-mic');
    if (btnMic) btnMic.onclick = () => voiceAssistant.toggleListening();

    container.querySelectorAll('[data-ai-chip]').forEach(chip => {
      chip.onclick = () => {
        const query = chip.getAttribute('data-ai-chip');
        voiceAssistant.processQuery(query);
      };
    });

    const formChat = document.getElementById('form-ai-chat');
    if (formChat) {
      formChat.onsubmit = (e) => {
        e.preventDefault();
        const input = document.getElementById('input-ai-text');
        if (input && input.value.trim()) {
          const val = input.value.trim();
          input.value = '';
          voiceAssistant.processQuery(val);
        }
      };
    }
  }

  updateVoiceUI() {
    this.renderVoiceOverlay();
  }

  openSearchModal() {
    const modal = document.getElementById('search-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    const input = document.getElementById('cmd-search-input');
    if (input) {
      input.value = '';
      input.focus();
      input.oninput = (e) => performGlobalSearch(e.target.value);
    }
  }

  closeSearchModal() {
    const modal = document.getElementById('search-modal');
    if (modal) modal.classList.add('hidden');
  }

  attachSearchModalListeners() {
    const modal = document.getElementById('search-modal');
    if (!modal) return;

    modal.onclick = (e) => {
      const searchItem = e.target.closest('[data-search-item]');
      if (searchItem) {
        const link = searchItem.getAttribute('data-link');
        const clientId = searchItem.getAttribute('data-client-id');
        this.closeSearchModal();
        if (link) {
          window.location.hash = link;
          if (clientId) {
            setTimeout(() => this.selectClient(clientId), 50);
          }
        }
      }
    };
  }

  // --- Open Interactive SMS & WhatsApp Reminder Dispatcher ---
  openSendSmsModal(clientName, policyDesc, dueDate, amount) {
    const db = store.get();
    const client = db.clients.find(c => c.name.toLowerCase() === clientName.toLowerCase()) || {
      name: clientName,
      phone: '+91 98200 11223',
      email: 'client@staros.com'
    };

    const container = document.getElementById('global-modal-container');
    if (!container) return;

    const formattedAmt = Number(amount || 0).toLocaleString('en-IN');
    const smsMessage = `Dear ${client.name},\n\nThis is a friendly reminder that your policy renewal payment of ₹${formattedAmt} for ${policyDesc} is due on ${dueDate}.\n\nPlease pay on time to keep your coverage active.\n\nThank you,\n${db.settings.companyName || 'One Stop Solution'}`;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
        <div class="w-full max-w-lg zoho-card p-6 rounded-2xl border border-amber-500/40 shadow-2xl space-y-4">
          
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <i data-lucide="message-square" class="w-4 h-4"></i>
              </div>
              <div>
                <h3 class="font-extrabold text-white text-base">Policy Renewal Text & WhatsApp Dispatch</h3>
                <p class="text-[11px] text-slate-400">Send text SMS or WhatsApp reminder directly to mobile phone</p>
              </div>
            </div>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <div id="sms-error-box" class="hidden p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold"></div>

          <form id="form-dispatch-sms-text" class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label class="block text-slate-300 font-bold mb-1">Mobile Phone Number (Recipient) *</label>
                <input type="text" name="phone" id="input-recipient-phone" value="${client.phone}" required placeholder="+91 98000 00000" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-300 font-bold mb-1">Policy Due Date</label>
                <input type="text" value="${dueDate === '2026-07-28' ? 'TODAY (2026-07-28)' : dueDate}" disabled class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-amber-400 font-bold" />
              </div>
            </div>

            <div>
              <label class="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                <span>Message Text Content:</span>
                <span class="text-[10px] text-emerald-400 font-bold">✓ Ready to Send</span>
              </label>
              <textarea name="messageContent" id="input-sms-body" rows="5" required class="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-amber-400 focus:outline-none">${smsMessage}</textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button type="button" id="btn-dispatch-native-mobile-sms" class="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold transition flex items-center justify-center gap-1.5 shadow-lg text-center text-xs">
                <i data-lucide="smartphone" class="w-4 h-4"></i> Send Text SMS
              </button>
              <button type="button" id="btn-dispatch-whatsapp-direct" class="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition flex items-center justify-center gap-1.5 text-center text-xs">
                <i data-lucide="message-square" class="w-4 h-4"></i> Send WhatsApp
              </button>
              <button type="submit" id="btn-dispatch-native-sms" class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-extrabold transition flex items-center justify-center gap-1.5 text-center text-xs">
                <i data-lucide="send" class="w-4 h-4"></i> MSG91 Gateway
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();

    // 1. Windows Phone Link & Mobile Native Text SMS Button
    document.getElementById('btn-dispatch-native-mobile-sms').onclick = async () => {
      const phoneInput = document.getElementById('input-recipient-phone').value;
      const bodyInput = document.getElementById('input-sms-body').value;
      const cleanPhone = phoneInput.replace(/[^0-9+]/g, '');

      store.addReminderLog({
        clientName: client.name,
        invoiceNumber: `POL-${Date.now().toString().slice(-4)}`,
        reminderType: dueDate === '2026-07-28' ? 'Due Today Text SMS' : 'Upcoming Expiry Text SMS',
        channel: 'Text SMS',
        status: 'Delivered',
        message: bodyInput
      });

      // Try native Windows Web Share flyout if available in Edge/Chrome
      if (navigator.share && typeof navigator.share === 'function') {
        try {
          await navigator.share({
            title: 'Policy Reminder - One Stop Solution',
            text: bodyInput
          });
          this.closeGlobalModal();
          this.showToast(`💻 Windows Text Share completed for ${phoneInput}!`);
          return;
        } catch (err) {
          // If user cancels share dialog, fallback to standard SMS protocol
        }
      }

      // Launch native SMS / Windows Phone Link protocol
      window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(bodyInput)}`;
      this.closeGlobalModal();
      this.showToast(`💻 Opening Windows Phone Link / SMS App for ${phoneInput}!`);
    };

    // 2. Direct WhatsApp Button
    document.getElementById('btn-dispatch-whatsapp-direct').onclick = () => {
      const phoneInput = document.getElementById('input-recipient-phone').value;
      const bodyInput = document.getElementById('input-sms-body').value;
      const cleanPhone = phoneInput.replace(/[^0-9]/g, '');

      store.addReminderLog({
        clientName: client.name,
        invoiceNumber: `POL-${Date.now().toString().slice(-4)}`,
        reminderType: dueDate === '2026-07-28' ? 'Due Today WhatsApp Reminder' : 'Upcoming Expiry WhatsApp',
        channel: 'WhatsApp',
        status: 'Delivered',
        message: bodyInput
      });

      window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(bodyInput)}`, '_blank');
      this.closeGlobalModal();
      this.showToast(`💬 Opening WhatsApp to send text to ${phoneInput}!`);
    };

    // 3. MSG91 / SMS Gateway Form Submit
    document.getElementById('form-dispatch-sms-text').onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const phoneInput = formData.get('phone');
      const msg = formData.get('messageContent');

      const result = await paymentEngine.twilioSmsGatewayAdapter(phoneInput, msg);

      if (result.success) {
        store.addReminderLog({
          clientName: client.name,
          invoiceNumber: `POL-${Date.now().toString().slice(-4)}`,
          reminderType: dueDate === '2026-07-28' ? 'Due Today Policy SMS' : 'Upcoming Expiry SMS',
          channel: 'MSG91 / API Gateway',
          status: 'Delivered',
          message: msg
        });

        this.closeGlobalModal();
        this.showToast(`✅ SMS Text Message Dispatched via ${result.provider || 'Gateway'} to ${phoneInput}!`);
      } else {
        store.addReminderLog({
          clientName: client.name,
          invoiceNumber: `POL-${Date.now().toString().slice(-4)}`,
          reminderType: dueDate === '2026-07-28' ? 'Due Today Mobile Text SMS' : 'Upcoming Expiry Mobile SMS',
          channel: 'Text SMS',
          status: 'Delivered',
          message: msg
        });

        window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(msg)}`;
        this.closeGlobalModal();
        this.showToast(`📱 Opening Mobile Text SMS for ${phoneInput}...`);
      }
    };
  }






  // --- New Motor Deal Modal with Date Selection Pickers & Auto Payment Integration ---
  openAddMotorModal() {

    const container = document.getElementById('global-modal-container');
    if (!container) return;
    const db = store.get();

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-xl zoho-card p-6 rounded-xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-white text-base">New Motor Insurance Policy Deal</h3>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <form id="form-add-motor" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Client Name (Select or enter new) *</label>
              <input type="text" name="clientName" id="input-motor-client-name" list="clients-datalist" required placeholder="Type name (e.g. Khush Patel, Vikramaditya...)" 
                     class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              <datalist id="clients-datalist">
                ${db.clients.map(c => `<option value="${c.name}">${c.phone} - ${c.email || c.pan}</option>`).join('')}
              </datalist>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Mobile Number *</label>
                <input type="tel" name="phone" id="input-motor-phone" required placeholder="+91 98765 43210" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Mail ID / Email *</label>
                <input type="email" name="email" id="input-motor-email" required placeholder="client@example.com" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Vehicle Model *</label>
                <input type="text" name="vehicleModel" required placeholder="BMW 3 Series 330i" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Vehicle Registration # *</label>
                <input type="text" name="vehicleNumber" required placeholder="MH 02 EQ 7777" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white font-mono uppercase focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Insurer Company</label>
                <input type="text" name="company" placeholder="HDFC ERGO General Insurance" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Annual Premium (₹) *</label>
                <input type="number" name="premium" step="1000" required placeholder="45000" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <!-- Date Selection Fields -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-900/60 border border-[#1E293B]">
              <div>
                <label class="block text-amber-400 font-semibold mb-1">Policy Start Date *</label>
                <input type="date" name="startDate" value="2026-07-27" onclick="this.showPicker && this.showPicker()" style="color-scheme: dark;" required class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none cursor-pointer" />
              </div>
              <div>
                <label class="block text-amber-400 font-semibold mb-1">Policy Expiry / Due Date *</label>
                <input type="date" name="expiryDate" value="2027-07-26" onclick="this.showPicker && this.showPicker()" style="color-scheme: dark;" required class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none cursor-pointer" />
              </div>
            </div>

            <button type="submit" class="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold transition">
              Save Motor Deal & Link Auto Reminders
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();

    const nameInputEl = document.getElementById('input-motor-client-name');
    const phoneInputEl = document.getElementById('input-motor-phone');
    const emailInputEl = document.getElementById('input-motor-email');
    if (nameInputEl) {
      nameInputEl.oninput = (e) => {
        const found = db.clients.find(c => c.name.toLowerCase() === e.target.value.trim().toLowerCase());
        if (found) {
          if (phoneInputEl) phoneInputEl.value = found.phone || '';
          if (emailInputEl) emailInputEl.value = found.email || '';
        }
      };
    }

    document.getElementById('form-add-motor').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const nameInput = formData.get('clientName').trim();
      const inputPhone = formData.get('phone') || '+91 98000 12345';
      const inputEmail = formData.get('email') || `${nameInput.toLowerCase().replace(/\s+/g, '.')}@example.com`;

      let clientObj = db.clients.find(c => c.name.toLowerCase() === nameInput.toLowerCase());
      if (!clientObj) {
        clientObj = store.addClient({
          name: nameInput,
          phone: inputPhone,
          email: inputEmail,
          pan: `PAN${Math.floor(10000 + Math.random()*90000)}K`,
          services: ['Motor Insurance'],
          city: 'Mumbai',
          state: 'Maharashtra'
        });
      } else {
        store.updateClient(clientObj.id, { phone: inputPhone, email: inputEmail });
        clientObj.phone = inputPhone;
        clientObj.email = inputEmail;
      }

      const expiryDate = formData.get('expiryDate');
      const premium = Number(formData.get('premium'));

      store.addMotorPolicy({
        clientId: clientObj.id,
        clientName: clientObj.name,
        vehicleModel: formData.get('vehicleModel'),
        vehicleNumber: formData.get('vehicleNumber').toUpperCase(),
        company: formData.get('company') || 'HDFC ERGO',
        policyNumber: `MOT-${Math.floor(10000000 + Math.random()*90000000)}`,
        premium: premium,
        idv: 2500000,
        ncb: 25,
        startDate: formData.get('startDate'),
        expiryDate: expiryDate
      });

      // Automatically Link to Payment Reminder Engine
      store.addPayment({
        clientId: clientObj.id,
        clientName: clientObj.name,
        phone: clientObj.phone,
        email: clientObj.email,
        policyType: `Motor: ${formData.get('vehicleModel')}`,
        invoiceNumber: `INV-MOT-${Math.floor(1000 + Math.random()*9000)}`,
        totalAmount: premium,
        paidAmount: 0,
        remainingAmount: premium,
        dueDate: expiryDate,
        status: 'Pending'
      });

      paymentEngine.runAutomaticReminderCheck();
      this.closeGlobalModal();
      this.showToast(`Motor deal created for ${clientObj.name} & Auto Reminders linked!`);
    };
  }

  // Edit Motor Policy Modal
  openEditMotorModal(policyId) {
    const db = store.get();
    const pol = db.motorPolicies.find(p => p.id === policyId);
    if (!pol) return;

    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-xl zoho-card p-6 rounded-xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-white text-base">Edit Motor Insurance Deal - ${pol.vehicleModel}</h3>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <form id="form-edit-motor" class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Vehicle Model</label>
                <input type="text" name="vehicleModel" value="${pol.vehicleModel}" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Registration #</label>
                <input type="text" name="vehicleNumber" value="${pol.vehicleNumber}" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white font-mono uppercase focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Insurance Company</label>
                <input type="text" name="company" value="${pol.company}" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Premium (₹)</label>
                <input type="number" name="premium" value="${pol.premium}" step="1000" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <!-- Date Selection Fields -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-900/60 border border-[#1E293B]">
              <div>
                <label class="block text-amber-400 font-semibold mb-1">Policy Start Date *</label>
                <input type="date" name="startDate" value="${pol.startDate || '2025-07-28'}" onclick="this.showPicker && this.showPicker()" style="color-scheme: dark;" required class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none cursor-pointer" />
              </div>
              <div>
                <label class="block text-amber-400 font-semibold mb-1">Policy Expiry / Renewal Due Date *</label>
                <input type="date" name="expiryDate" value="${pol.expiryDate}" onclick="this.showPicker && this.showPicker()" style="color-scheme: dark;" required class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none cursor-pointer" />
              </div>
            </div>

            <button type="submit" class="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold transition">
              Update Motor Deal & Reschedule Auto Engine
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();
    document.getElementById('form-edit-motor').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const newExpiry = formData.get('expiryDate');

      store.updateMotorPolicy(policyId, {
        vehicleModel: formData.get('vehicleModel'),
        vehicleNumber: formData.get('vehicleNumber').toUpperCase(),
        company: formData.get('company'),
        premium: Number(formData.get('premium')),
        startDate: formData.get('startDate'),
        expiryDate: newExpiry
      });

      paymentEngine.runAutomaticReminderCheck();
      this.closeGlobalModal();
      this.showToast(`Motor policy updated to expire on ${newExpiry}! Auto Engine recalculated.`);
    };
  }


  // --- New Health Deal Modal with Date Selection Pickers ---
  openAddHealthModal() {
    const container = document.getElementById('global-modal-container');
    if (!container) return;
    const db = store.get();

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-xl zoho-card p-6 rounded-xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-white text-base">New Health Insurance Policy Deal</h3>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <form id="form-add-health" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Select Client *</label>
              <select name="clientId" id="input-health-client-select" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none">
                ${db.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Mobile Number *</label>
                <input type="tel" name="phone" id="input-health-phone" value="${db.clients[0]?.phone || ''}" required placeholder="+91 98765 43210" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Mail ID / Email *</label>
                <input type="email" name="email" id="input-health-email" value="${db.clients[0]?.email || ''}" required placeholder="client@example.com" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Health Insurer Company *</label>
                <input type="text" name="company" required placeholder="Star Health / Niva Bupa / Care" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Members Covered</label>
                <input type="text" name="membersCovered" value="Self + Spouse + 2 Kids" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
            </div>


            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Sum Insured Amount (₹) *</label>
                <input type="number" name="sumInsured" value="2500000" step="1000" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Annual Premium (₹) *</label>
                <input type="number" name="premium" value="38000" step="1000" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <!-- Date Selection Fields -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-900/60 border border-[#1E293B]">
              <div>
                <label class="block text-emerald-400 font-semibold mb-1">Policy Start Date *</label>
                <input type="date" name="startDate" value="2026-07-27" required class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-emerald-400 font-semibold mb-1">Renewal Expiry Date *</label>
                <input type="date" name="expiryDate" value="2027-07-26" required class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-400 focus:outline-none" />
              </div>
            </div>

            <button type="submit" class="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold transition">
              Save Health Policy Deal
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();
    document.getElementById('form-add-health').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const clientObj = db.clients.find(c => c.id === formData.get('clientId'));
      const expiryDate = formData.get('expiryDate');
      const premium = Number(formData.get('premium'));

      store.addHealthPolicy({
        clientId: formData.get('clientId'),
        clientName: clientObj ? clientObj.name : 'Client',
        company: formData.get('company'),
        policyNumber: `HEA-${Math.floor(10000000 + Math.random()*90000000)}`,
        membersCovered: formData.get('membersCovered'),
        sumInsured: Number(formData.get('sumInsured')),
        premium: premium,
        startDate: formData.get('startDate'),
        expiryDate: expiryDate
      });

      // Link to Auto Payment Engine
      if (clientObj) {
        store.addPayment({
          clientId: clientObj.id,
          clientName: clientObj.name,
          phone: clientObj.phone,
          email: clientObj.email,
          policyType: `Health: ${formData.get('company')}`,
          invoiceNumber: `INV-HEA-${Math.floor(1000 + Math.random()*9000)}`,
          totalAmount: premium,
          paidAmount: 0,
          remainingAmount: premium,
          dueDate: expiryDate,
          status: 'Pending'
        });
      }

      paymentEngine.runAutomaticReminderCheck();
      this.closeGlobalModal();
      this.showToast('Health policy deal created & Auto Reminders linked!');
    };
  }

  // Edit Health Policy Modal
  openEditHealthModal(policyId) {
    const db = store.get();
    const pol = db.healthPolicies.find(p => p.id === policyId);
    if (!pol) return;

    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-xl zoho-card p-6 rounded-xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-white text-base">Edit Health Insurance Cover - ${pol.company}</h3>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <form id="form-edit-health" class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Company</label>
                <input type="text" name="company" value="${pol.company}" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Members Covered</label>
                <input type="text" name="membersCovered" value="${pol.membersCovered}" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Sum Insured (₹)</label>
                <input type="number" name="sumInsured" value="${pol.sumInsured}" step="1000" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Annual Premium (₹)</label>
                <input type="number" name="premium" value="${pol.premium}" step="1000" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <!-- Date Selection Fields -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-900/60 border border-[#1E293B]">
              <div>
                <label class="block text-emerald-400 font-semibold mb-1">Policy Start Date *</label>
                <input type="date" name="startDate" value="${pol.startDate || '2025-08-15'}" required class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-emerald-400 font-semibold mb-1">Renewal Expiry Date *</label>
                <input type="date" name="expiryDate" value="${pol.expiryDate}" required class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-400 focus:outline-none" />
              </div>
            </div>

            <button type="submit" class="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold transition">
              Update Health Cover Details
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();
    document.getElementById('form-edit-health').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      store.updateHealthPolicy(policyId, {
        company: formData.get('company'),
        membersCovered: formData.get('membersCovered'),
        sumInsured: Number(formData.get('sumInsured')),
        premium: Number(formData.get('premium')),
        startDate: formData.get('startDate'),
        expiryDate: formData.get('expiryDate')
      });

      this.closeGlobalModal();
      this.showToast('Health policy cover updated!');
    };
  }

  // --- New Life Policy Modal ---
  openAddLifeModal() {
    const container = document.getElementById('global-modal-container');
    if (!container) return;
    const db = store.get();

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-xl zoho-card p-6 rounded-xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-white text-base">New Life Insurance & Term Policy</h3>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <form id="form-add-life" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Select Client *</label>
              <select name="clientId" id="input-life-client-select" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none">
                ${db.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Mobile Number *</label>
                <input type="tel" name="phone" id="input-life-phone" value="${db.clients[0]?.phone || ''}" required placeholder="+91 98765 43210" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Mail ID / Email *</label>
                <input type="email" name="email" id="input-life-email" value="${db.clients[0]?.email || ''}" required placeholder="client@example.com" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Insurer Company *</label>
                <input type="text" name="company" required placeholder="HDFC Life / Max Life / Tata AIA" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Sum Assured (₹) *</label>
                <input type="number" name="sumAssured" value="10000000" step="1000" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
            </div>


            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Annual Premium (₹) *</label>
                <input type="number" name="premium" value="45000" step="1000" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Nominee Name *</label>
                <input type="text" name="nominee" required placeholder="Nominee Spouse / Parent" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <!-- Date Selection Fields -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-900/60 border border-[#1E293B]">
              <div>
                <label class="block text-amber-400 font-semibold mb-1">Policy Start Date *</label>
                <input type="date" name="startDate" value="2026-07-27" required class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-amber-400 font-semibold mb-1">Premium Due Date *</label>
                <input type="date" name="dueDate" value="2027-07-26" required class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <button type="submit" class="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold transition">
              Save Life Term Policy
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();
    document.getElementById('form-add-life').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const clientObj = db.clients.find(c => c.id === formData.get('clientId'));

      store.addLifePolicy({
        clientId: formData.get('clientId'),
        clientName: clientObj ? clientObj.name : 'Client',
        company: formData.get('company'),
        policyNumber: `TERM-${Math.floor(1000 + Math.random()*9000)}-99`,
        sumAssured: Number(formData.get('sumAssured')),
        premium: Number(formData.get('premium')),
        nominee: formData.get('nominee'),
        startDate: formData.get('startDate'),
        dueDate: formData.get('dueDate')
      });
      this.closeGlobalModal();
      this.showToast('Life Term Policy created!');
    };
  }

  // Edit Life Policy Modal
  openEditLifeModal(policyId) {
    const db = store.get();
    const pol = db.lifePolicies.find(p => p.id === policyId);
    if (!pol) return;

    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-xl zoho-card p-6 rounded-xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-white text-base">Edit Term Policy - ${pol.company}</h3>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <form id="form-edit-life" class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Company</label>
                <input type="text" name="company" value="${pol.company}" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Nominee</label>
                <input type="text" name="nominee" value="${pol.nominee}" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Sum Assured (₹)</label>
                <input type="number" name="sumAssured" value="${pol.sumAssured}" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Premium (₹)</label>
                <input type="number" name="premium" value="${pol.premium}" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <!-- Date Selection Fields -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-900/60 border border-[#1E293B]">
              <div>
                <label class="block text-amber-400 font-semibold mb-1">Policy Start Date *</label>
                <input type="date" name="startDate" value="${pol.startDate || '2025-08-15'}" required class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-amber-400 font-semibold mb-1">Premium Due Date *</label>
                <input type="date" name="dueDate" value="${pol.dueDate}" required class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <button type="submit" class="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold transition">
              Update Term Policy Details
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();
    document.getElementById('form-edit-life').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      store.updateLifePolicy(policyId, {
        company: formData.get('company'),
        nominee: formData.get('nominee'),
        sumAssured: Number(formData.get('sumAssured')),
        premium: Number(formData.get('premium')),
        startDate: formData.get('startDate'),
        dueDate: formData.get('dueDate')
      });

      this.closeGlobalModal();
      this.showToast('Life insurance policy updated!');
    };
  }

  // Modals: Create Invoice Payment Modal
  openCreateInvoiceModal() {
    const container = document.getElementById('global-modal-container');
    if (!container) return;
    const db = store.get();

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-lg zoho-card p-6 rounded-xl space-y-4">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-white text-base">Create Payment Invoice</h3>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <form id="form-create-invoice" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Select Client *</label>
              <select name="clientId" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none">
                ${db.clients.map(c => `<option value="${c.id}">${c.name} (${c.phone})</option>`).join('')}
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Policy / Service Name *</label>
                <input type="text" name="policyType" required placeholder="Motor / Health Insurance Premium" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Invoice Number</label>
                <input type="text" name="invoiceNumber" value="INV-2026-${Math.floor(1000 + Math.random()*9000)}" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white font-mono focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Total Amount (₹) *</label>
                <input type="number" name="totalAmount" required placeholder="45000" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Due Date *</label>
                <input type="date" name="dueDate" value="2026-08-05" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <button type="submit" class="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold transition">
              Create Invoice & Enable Auto Reminders
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();
    document.getElementById('form-create-invoice').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const clientObj = db.clients.find(c => c.id === formData.get('clientId'));

      store.addPayment({
        clientId: formData.get('clientId'),
        clientName: clientObj ? clientObj.name : 'Client',
        phone: clientObj ? clientObj.phone : '+91 98000 00000',
        email: clientObj ? clientObj.email : 'client@example.com',
        policyType: formData.get('policyType'),
        invoiceNumber: formData.get('invoiceNumber'),
        totalAmount: Number(formData.get('totalAmount')),
        paidAmount: 0,
        remainingAmount: Number(formData.get('totalAmount')),
        dueDate: formData.get('dueDate'),
        status: 'Pending'
      });

      this.closeGlobalModal();
      this.showToast('Payment invoice created & added to Auto Engine!');
    };
  }

  openSendReminderNowModal(paymentId) {
    const db = store.get();
    const pay = db.payments.find(p => p.id === paymentId);
    if (!pay) return;

    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-md zoho-card p-6 rounded-xl space-y-4">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-white text-base">Send Instant Reminder Now</h3>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <div class="text-xs space-y-1 bg-slate-900/60 p-3 rounded-lg border border-[#1E293B]">
            <p><strong class="text-white">Client:</strong> ${pay.clientName}</p>
            <p><strong class="text-white">Invoice:</strong> ${pay.invoiceNumber}</p>
            <p><strong class="text-amber-400">Remaining Amount:</strong> ₹${pay.remainingAmount.toLocaleString('en-IN')}</p>
          </div>

          <form id="form-send-now" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Select Delivery Channel</label>
              <select name="channel" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none">
                <option value="WhatsApp">WhatsApp Business Message</option>
                <option value="SMS">Twilio SMS</option>
                <option value="Email">Email Notification</option>
              </select>
            </div>

            <button type="submit" class="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold transition flex items-center justify-center gap-2">
              <i data-lucide="send" class="w-4 h-4"></i> Dispatch Reminder Instant
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();
    document.getElementById('form-send-now').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const channel = formData.get('channel');
      paymentEngine.dispatchNotification(pay, 'Manual Instant Trigger', db.reminderTemplates, db.settings.companyName, channel);
      this.closeGlobalModal();
      this.showToast(`Instant reminder dispatched via ${channel}!`);
    };
  }

  openRescheduleModal(paymentId) {
    const db = store.get();
    const pay = db.payments.find(p => p.id === paymentId);
    if (!pay) return;

    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-md zoho-card p-6 rounded-xl space-y-4">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-white text-base">Reschedule Invoice Due Date</h3>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <form id="form-reschedule-due" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">New Payment Due Date *</label>
              <input type="date" name="dueDate" value="${pay.dueDate}" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
            </div>

            <button type="submit" class="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold transition">
              Update Due Date & Reset Triggers
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();
    document.getElementById('form-reschedule-due').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const newDue = formData.get('dueDate');
      store.reschedulePaymentDueDate(paymentId, newDue);
      this.closeGlobalModal();
      this.showToast(`Invoice ${pay.invoiceNumber} rescheduled to ${newDue}!`);
    };
  }

  // Add Lead Modal
  openAddClientModal() {
    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-xl zoho-card p-6 rounded-xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-white text-base">Add New CRM Lead / Client</h3>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <form id="form-add-client" class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Full Name *</label>
                <input type="text" name="name" required placeholder="e.g. Khush Patel" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Mobile Number *</label>
                <input type="text" name="phone" required placeholder="+91 98000 00000" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Email Address</label>
                <input type="email" name="email" placeholder="client@example.com" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">PAN Number *</label>
                <input type="text" name="pan" required placeholder="ABCDE1234F" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none font-mono uppercase" />
              </div>
            </div>

            <button type="submit" class="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold transition">
              Save Client Lead
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();
    document.getElementById('form-add-client').onsubmit = (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);

      const newClient = store.addClient({
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email') || 'client@staros.com',
        pan: formData.get('pan').toUpperCase(),
        aadhaar: '5566 7788 9900',
        services: ['Motor Insurance', 'Health Insurance'],
        tags: ['General'],
        occupation: 'Business Owner',
        city: 'Mumbai',
        state: 'Maharashtra',
        dob: '1988-05-15'
      });
      this.closeGlobalModal();
      this.showToast(`Lead ${newClient.name} created!`);
      this.selectClient(newClient.id);
    };
  }

  // Edit Client Profile Modal (Comprehensive: Location, PAN, Aadhaar, DOB, Services, Family, Emergency Contact)
  openEditClientModal(clientId) {
    const db = store.get();
    const client = db.clients.find(c => c.id === clientId);
    if (!client) return;

    const container = document.getElementById('global-modal-container');
    if (!container) return;

    const currentServices = client.services || client.tags || ['Motor Insurance', 'Health Insurance'];
    const hasMotor = currentServices.includes('Motor Insurance');
    const hasHealth = currentServices.includes('Health Insurance');
    const hasLife = currentServices.includes('Life Insurance');

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
        <div class="w-full max-w-2xl zoho-card p-6 rounded-2xl border border-amber-500/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
          
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </div>
              <div>
                <h3 class="font-extrabold text-white text-base">Edit Client Profile & Statutory Details</h3>
                <p class="text-[11px] text-slate-400">Update PAN, Aadhaar, DOB, Location, Services & Contacts for ${client.name}</p>
              </div>
            </div>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <form id="form-edit-client" class="space-y-4 text-xs">
            
            <!-- Section 1: Basic Information -->
            <div class="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E293B] space-y-3">
              <h4 class="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="user" class="w-3.5 h-3.5"></i> Basic Personal Information
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-300 font-bold mb-1">Full Name *</label>
                  <input type="text" name="name" value="${client.name}" required class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-slate-300 font-bold mb-1">Mobile Number *</label>
                  <input type="text" name="phone" value="${client.phone}" required class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold focus:border-amber-400 focus:outline-none" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-300 font-bold mb-1">Email Address</label>
                  <input type="email" name="email" value="${client.email || ''}" class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-slate-300 font-bold mb-1">Occupation / Title</label>
                  <input type="text" name="occupation" value="${client.occupation || 'Business Owner'}" class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none" />
                </div>
              </div>
            </div>

            <!-- Section 2: Location Details -->
            <div class="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E293B] space-y-3">
              <h4 class="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="map-pin" class="w-3.5 h-3.5"></i> Location & Address
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-300 font-bold mb-1">City *</label>
                  <input type="text" name="city" value="${client.city || 'Mumbai'}" required class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-slate-300 font-bold mb-1">State *</label>
                  <input type="text" name="state" value="${client.state || 'Maharashtra'}" required class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none" />
                </div>
              </div>
            </div>

            <!-- Section 3: Statutory Identification Details -->
            <div class="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E293B] space-y-3">
              <h4 class="font-bold text-cyan-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="file-text" class="w-3.5 h-3.5"></i> Statutory Details & DOB
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-300 font-bold mb-1">PAN Card Number *</label>
                  <input type="text" name="pan" value="${client.pan || ''}" required placeholder="HTYT4564J" class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold uppercase focus:border-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-slate-300 font-bold mb-1">Aadhaar Card Number *</label>
                  <input type="text" name="aadhaar" value="${client.aadhaar || ''}" required placeholder="5566 7788 9900" class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold focus:border-amber-400 focus:outline-none" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-300 font-bold mb-1">Passport Number</label>
                  <input type="text" name="passport" value="${client.passport || ''}" placeholder="Z1234567" class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono uppercase focus:border-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-slate-300 font-bold mb-1">Date of Birth (DOB) *</label>
                  <input type="date" name="dob" value="${client.dob || '1988-05-15'}" required onclick="this.showPicker && this.showPicker()" style="color-scheme: dark;" class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold focus:border-amber-400 focus:outline-none" />
                </div>
              </div>
            </div>

            <!-- Section 4: Subscribed Services (Add or Remove Insurance) -->
            <div class="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E293B] space-y-3">
              <h4 class="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Subscribed Services (Add or Remove Insurance)
              </h4>
              <div class="flex flex-wrap gap-4 pt-1">
                <label class="flex items-center gap-2 cursor-pointer text-slate-200 font-bold">
                  <input type="checkbox" name="service_motor" value="Motor Insurance" ${hasMotor ? 'checked' : ''} class="w-4 h-4 rounded accent-amber-500" />
                  <span>🚗 Motor Insurance</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer text-slate-200 font-bold">
                  <input type="checkbox" name="service_health" value="Health Insurance" ${hasHealth ? 'checked' : ''} class="w-4 h-4 rounded accent-emerald-500" />
                  <span>🏥 Health Insurance</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer text-slate-200 font-bold">
                  <input type="checkbox" name="service_life" value="Life Insurance" ${hasLife ? 'checked' : ''} class="w-4 h-4 rounded accent-cyan-500" />
                  <span>🛡️ Life Insurance</span>
                </label>
              </div>
            </div>

            <!-- Section 5: Family Details -->
            <div class="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E293B] space-y-3">
              <h4 class="font-bold text-rose-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="heart" class="w-3.5 h-3.5"></i> Family Details
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-slate-300 font-bold mb-1">Spouse Name</label>
                  <input type="text" name="spouse" value="${client.family?.spouse || ''}" placeholder="Spouse Full Name" class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-slate-300 font-bold mb-1">Children (comma separated)</label>
                  <input type="text" name="children" value="${Array.isArray(client.family?.children) ? client.family.children.join(', ') : (client.family?.children || '')}" placeholder="Child 1, Child 2" class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-slate-300 font-bold mb-1">Nominee Name</label>
                  <input type="text" name="nominee" value="${client.family?.nominee || ''}" placeholder="Nominee Name" class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none" />
                </div>
              </div>
            </div>

            <!-- Section 6: Emergency Contact Details -->
            <div class="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E293B] space-y-3">
              <h4 class="font-bold text-cyan-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="phone-call" class="w-3.5 h-3.5"></i> Emergency Contact Information
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-slate-300 font-bold mb-1">Emergency Contact Name</label>
                  <input type="text" name="emergency_name" value="${client.emergencyContact?.name || ''}" placeholder="Full Name" class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-slate-300 font-bold mb-1">Relation</label>
                  <input type="text" name="emergency_relation" value="${client.emergencyContact?.relation || ''}" placeholder="Brother / Parent / Friend" class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-slate-300 font-bold mb-1">Phone Number</label>
                  <input type="text" name="emergency_phone" value="${client.emergencyContact?.phone || ''}" placeholder="+91 98000 00000" class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 font-mono focus:border-amber-400 focus:outline-none" />
                </div>
              </div>
            </div>

            <button type="submit" class="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold transition text-sm shadow-lg shadow-amber-500/20">
              Save All Client Information & Statutory Records
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();
    document.getElementById('form-edit-client').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      // Build Subscribed Services Array
      const services = [];
      if (formData.get('service_motor')) services.push('Motor Insurance');
      if (formData.get('service_health')) services.push('Health Insurance');
      if (formData.get('service_life')) services.push('Life Insurance');
      if (services.length === 0) services.push('General CRM');

      // Parse Children
      const childrenStr = formData.get('children');
      const childrenArr = childrenStr ? childrenStr.split(',').map(s => s.trim()).filter(Boolean) : [];

      store.updateClient(clientId, {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        occupation: formData.get('occupation'),
        city: formData.get('city'),
        state: formData.get('state'),
        pan: formData.get('pan').toUpperCase(),
        aadhaar: formData.get('aadhaar'),
        passport: (formData.get('passport') || '').toUpperCase(),
        dob: formData.get('dob'),
        services: services,
        tags: services,
        family: {
          spouse: formData.get('spouse') || 'N/A',
          children: childrenArr.length > 0 ? childrenArr : 'None',
          nominee: formData.get('nominee') || 'N/A'
        },
        emergencyContact: {
          name: formData.get('emergency_name') || 'N/A',
          relation: formData.get('emergency_relation') || 'N/A',
          phone: formData.get('emergency_phone') || 'N/A'
        }
      });

      this.closeGlobalModal();
      this.showToast(`Updated record for ${formData.get('name')}!`);
      this.selectClient(clientId);
    };
  }

  // Edit Dedicated Family Details Modal
  openEditFamilyModal(clientId) {
    const db = store.get();
    const client = db.clients.find(c => c.id === clientId);
    if (!client) return;

    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
        <div class="w-full max-w-lg zoho-card p-6 rounded-2xl border border-rose-500/40 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                <i data-lucide="heart" class="w-4 h-4"></i>
              </div>
              <div>
                <h3 class="font-extrabold text-white text-base">Edit Family Details - ${client.name}</h3>
                <p class="text-[11px] text-slate-400">Update Spouse, Children, and Policy Nominee details</p>
              </div>
            </div>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <form id="form-edit-family" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-300 font-bold mb-1">Spouse Name</label>
              <input type="text" name="spouse" value="${client.family?.spouse || ''}" placeholder="Spouse Full Name" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none" />
            </div>

            <div>
              <label class="block text-slate-300 font-bold mb-1">Children (comma separated)</label>
              <input type="text" name="children" value="${Array.isArray(client.family?.children) ? client.family.children.join(', ') : (client.family?.children || '')}" placeholder="Child 1, Child 2" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none" />
            </div>

            <div>
              <label class="block text-slate-300 font-bold mb-1">Policy Nominee Name *</label>
              <input type="text" name="nominee" value="${client.family?.nominee || ''}" required placeholder="Nominee Name" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-bold focus:border-amber-400 focus:outline-none" />
            </div>

            <button type="submit" class="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-slate-950 font-extrabold transition shadow-lg shadow-rose-500/20">
              Save Family Details
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();
    document.getElementById('form-edit-family').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const childrenStr = formData.get('children');
      const childrenArr = childrenStr ? childrenStr.split(',').map(s => s.trim()).filter(Boolean) : [];

      store.updateClient(clientId, {
        family: {
          spouse: formData.get('spouse') || 'N/A',
          children: childrenArr.length > 0 ? childrenArr : 'None',
          nominee: formData.get('nominee') || 'N/A'
        }
      });

      this.closeGlobalModal();
      this.showToast(`Updated Family Details for ${client.name}!`);
      this.selectClient(clientId);
    };
  }

  // Edit Dedicated Emergency Contact Modal
  openEditEmergencyModal(clientId) {
    const db = store.get();
    const client = db.clients.find(c => c.id === clientId);
    if (!client) return;

    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
        <div class="w-full max-w-lg zoho-card p-6 rounded-2xl border border-cyan-500/40 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <i data-lucide="phone-call" class="w-4 h-4"></i>
              </div>
              <div>
                <h3 class="font-extrabold text-white text-base">Edit Emergency Contact - ${client.name}</h3>
                <p class="text-[11px] text-slate-400">Update primary emergency contact information</p>
              </div>
            </div>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <form id="form-edit-emergency" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-300 font-bold mb-1">Emergency Contact Full Name *</label>
              <input type="text" name="name" value="${client.emergencyContact?.name || ''}" required placeholder="Full Name" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none" />
            </div>

            <div>
              <label class="block text-slate-300 font-bold mb-1">Relation *</label>
              <input type="text" name="relation" value="${client.emergencyContact?.relation || ''}" required placeholder="Spouse / Parent / Brother / Friend" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none" />
            </div>

            <div>
              <label class="block text-slate-300 font-bold mb-1">Phone Number *</label>
              <input type="text" name="phone" value="${client.emergencyContact?.phone || ''}" required placeholder="+91 98000 00000" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 font-mono font-bold focus:border-amber-400 focus:outline-none" />
            </div>

            <button type="submit" class="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-extrabold transition shadow-lg shadow-cyan-500/20">
              Save Emergency Contact
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();
    document.getElementById('form-edit-emergency').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      store.updateClient(clientId, {
        emergencyContact: {
          name: formData.get('name'),
          relation: formData.get('relation'),
          phone: formData.get('phone')
        }
      });

      this.closeGlobalModal();
      this.showToast(`Updated Emergency Contact for ${client.name}!`);
      this.selectClient(clientId);
    };
  }


  // Upload Client Image Modal
  openUploadClientImageModal(clientId) {
    const db = store.get();
    const client = db.clients.find(c => c.id === clientId);
    if (!client) return;

    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-md zoho-card p-6 rounded-xl space-y-4">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-white text-base">Upload Photo for ${client.name}</h3>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <form id="form-upload-client-img" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Title / Description *</label>
              <input type="text" name="title" required placeholder="PAN Scan / Aadhaar Card / Vehicle Photo" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
            </div>

            <div id="photo-dropzone" class="p-6 rounded-xl border-2 border-dashed border-slate-700 text-center bg-slate-900/40 hover:border-amber-400 transition cursor-pointer">
              <input type="file" id="client-photo-file" accept="image/*" required class="hidden" />
              <i data-lucide="image" class="w-8 h-8 text-amber-400 mx-auto mb-2"></i>
              <p id="photo-file-label" class="text-xs text-white font-bold">Click to select photo from computer / phone</p>
              <p class="text-[10px] text-slate-400 mt-1">Supports JPG, PNG, WEBP files</p>
            </div>

            <button type="submit" class="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold transition shadow-lg shadow-amber-500/20">
              Save Photo to Client Profile
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();

    const dropzone = document.getElementById('photo-dropzone');
    const fileInput = document.getElementById('client-photo-file');
    const label = document.getElementById('photo-file-label');

    if (dropzone && fileInput) {
      dropzone.onclick = () => fileInput.click();
      fileInput.onchange = () => {
        if (fileInput.files.length > 0) {
          label.textContent = `Selected: ${fileInput.files[0].name}`;
        }
      };
    }

    document.getElementById('form-upload-client-img').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const file = fileInput && fileInput.files.length > 0 ? fileInput.files[0] : null;

      if (!file) {
        alert('Please select an image file from your device.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        store.addClientImage(clientId, {
          id: `img-${Date.now()}`,
          title: formData.get('title'),
          type: 'Client Photo',
          url: dataUrl
        });
        this.closeGlobalModal();
        this.showToast('📸 Photo uploaded and added to client gallery!');
        this.selectClient(clientId);
      };
      reader.readAsDataURL(file);
    };
  }

  openPreviewImageModal(title, url) {
    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
        <div class="w-full max-w-2xl zoho-card p-6 rounded-xl space-y-4 max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-white text-base flex items-center gap-2">
              <i data-lucide="image" class="w-5 h-5 text-amber-400"></i> ${title}
            </h3>
            <div class="flex items-center gap-2">
              <a href="${url}" download="${title.replace(/\s+/g, '_')}.jpg" target="_blank" class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition flex items-center gap-1.5 shadow">
                <i data-lucide="download" class="w-3.5 h-3.5"></i> Download Image
              </a>
              <button id="btn-close-modal" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
          </div>
          <div class="w-full flex-1 rounded-xl overflow-hidden bg-slate-950 border border-[#1E293B] flex items-center justify-center p-2 min-h-[300px]">
            <img src="${url}" alt="${title}" class="max-h-[60vh] max-w-full object-contain rounded-lg shadow-2xl" />
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();
  }

  openUploadDocModal() {
    const container = document.getElementById('global-modal-container');
    if (!container) return;
    const db = store.get();

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-lg zoho-card p-6 rounded-xl space-y-4">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-white text-base">Upload Document</h3>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <form id="form-upload-doc" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Select Client</label>
              <select name="clientId" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none">
                ${db.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>

            <div id="file-dropzone" class="p-6 rounded-xl border-2 border-dashed border-slate-700 text-center bg-slate-900/30 hover:border-amber-400 transition cursor-pointer">
              <input type="file" id="vault-file-picker" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
              <i data-lucide="upload-cloud" class="w-8 h-8 text-amber-400 mx-auto mb-2"></i>
              <p id="file-picker-label" class="text-xs text-white font-bold">Click to select document file</p>
            </div>

            <button type="submit" class="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold transition">
              Upload Document
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    const dropzone = document.getElementById('file-dropzone');
    const picker = document.getElementById('vault-file-picker');
    const label = document.getElementById('file-picker-label');

    if (dropzone && picker) {
      dropzone.onclick = () => picker.click();
      picker.onchange = () => {
        if (picker.files.length > 0) label.textContent = `Selected: ${picker.files[0].name}`;
      };
    }

    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();
    document.getElementById('form-upload-doc').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const clientObj = db.clients.find(c => c.id === formData.get('clientId'));

      store.addDocument({
        clientId: formData.get('clientId'),
        clientName: clientObj ? clientObj.name : 'Client',
        documentType: 'Identification',
        fileName: picker && picker.files.length > 0 ? picker.files[0].name : 'Document.pdf',
        fileCategory: 'Identification',
        fileSize: '1.4 MB',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      });
      this.closeGlobalModal();
      this.showToast('Document uploaded to Vault!');
    };
  }

  openAddEventModal(presetDate = '2026-07-27') {
    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-lg zoho-card p-6 rounded-xl space-y-4">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-white text-base">Schedule Event</h3>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <form id="form-add-event" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Event Title *</label>
              <input type="text" name="title" required placeholder="Portfolio Review" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Date</label>
                <input type="date" name="date" value="${presetDate}" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Time</label>
                <input type="text" name="time" value="11:00 AM" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
              </div>
            </div>

            <button type="submit" class="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold transition">
              Save Event
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();
    document.getElementById('form-add-event').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      store.addCalendarEvent({
        title: formData.get('title'),
        type: 'Meeting',
        client: 'Client Account',
        date: formData.get('date'),
        time: formData.get('time')
      });
      this.closeGlobalModal();
      this.showToast('Event scheduled!');
    };
  }

  openEditEventModal(eventId) {
    const db = store.get();
    const ev = db.calendarEvents.find(e => e.id === eventId);
    if (!ev) return;

    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-lg zoho-card p-6 rounded-xl space-y-4">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-white text-base">Edit Event - ${ev.title}</h3>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <form id="form-edit-event" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Title</label>
              <input type="text" name="title" value="${ev.title}" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-[#1E293B] text-white focus:border-amber-400 focus:outline-none" />
            </div>

            <button type="submit" class="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold transition">
              Update Event
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();
    document.getElementById('form-edit-event').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      store.updateCalendarEvent(eventId, { title: formData.get('title') });
      this.closeGlobalModal();
      this.showToast('Calendar event updated!');
    };
  }

  openRecycleBinModal() {
    const state = store.get();
    const binItems = state.recycleBin || [];
    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
        <div class="w-full max-w-2xl zoho-card p-6 rounded-2xl space-y-5 relative border border-amber-500/30 shadow-2xl max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-2">
              <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                <i data-lucide="archive" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="font-extrabold text-white text-base">Recycle Bin (Trash Vault)</h3>
                <p class="text-xs text-slate-400">Deleted records are stored safely here. Restore anytime or empty permanently.</p>
              </div>
            </div>
            <button id="btn-close-modal" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <!-- Items List -->
          <div class="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            ${binItems.length > 0 ? binItems.map(item => `
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      ${item.itemType}
                    </span>
                    <span class="text-[10px] text-slate-500 font-mono">Deleted: ${item.deletedAt}</span>
                  </div>
                  <h4 class="font-bold text-white text-sm mt-1 truncate">${item.title}</h4>
                  <p class="text-xs text-slate-400 truncate">${item.subtitle}</p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button data-restore-bin="${item.binId}" class="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1">
                    <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Restore
                  </button>
                  <button data-delete-bin="${item.binId}" class="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition" title="Permanently Delete">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            `).join('') : `
              <div class="text-center py-12 space-y-3">
                <i data-lucide="trash" class="w-12 h-12 text-slate-600 mx-auto"></i>
                <p class="text-sm font-semibold text-slate-400">Recycle Bin is Empty</p>
                <p class="text-xs text-slate-500">Deleted client records, policies, and reminders will appear here for safe recovery.</p>
              </div>
            `}
          </div>

          <!-- Bottom Actions -->
          ${binItems.length > 0 ? `
            <div class="border-t border-slate-800 pt-3 flex items-center justify-between">
              <span class="text-xs text-slate-400 font-medium">${binItems.length} item(s) in Recycle Bin</span>
              <button id="btn-empty-bin" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition flex items-center gap-1.5 shadow">
                <i data-lucide="flame" class="w-4 h-4"></i> Empty Recycle Bin Permanently
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();

    container.querySelectorAll('[data-restore-bin]').forEach(btn => {
      btn.onclick = () => {
        const binId = btn.getAttribute('data-restore-bin');
        store.restoreFromRecycleBin(binId);
        this.showToast('↩️ Item restored back to active records!');
        this.openRecycleBinModal();
        this.render();
      };
    });

    container.querySelectorAll('[data-delete-bin]').forEach(btn => {
      btn.onclick = () => {
        const binId = btn.getAttribute('data-delete-bin');
        store.permanentlyDeleteFromRecycleBin(binId);
        this.showToast('❌ Item permanently deleted.');
        this.openRecycleBinModal();
        this.render();
      };
    });

    const btnEmpty = document.getElementById('btn-empty-bin');
    if (btnEmpty) {
      btnEmpty.onclick = () => {
        if (confirm("Are you sure you want to permanently erase all items in the Recycle Bin? This action cannot be undone.")) {
          store.emptyRecycleBin();
          this.showToast('🔥 Recycle Bin emptied permanently.');
          this.openRecycleBinModal();
          this.render();
        }
      };
    }
  }

  openMsg91ConfigModal() {
    const config = store.get().apiGateway || {};
    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
        <div class="w-full max-w-lg zoho-card p-6 rounded-2xl space-y-5 relative border border-emerald-500/30 shadow-2xl">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <i data-lucide="message-square" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="font-extrabold text-white text-base">Connect MSG91 Gateway</h3>
                <p class="text-xs text-slate-400">Configure MSG91 AuthKey for automatic India DLT SMS & WhatsApp alerts</p>
              </div>
            </div>
            <button id="btn-close-modal" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <form id="form-msg91-config" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-300 font-bold mb-1">MSG91 Auth Key *</label>
              <input type="password" name="msg91AuthKey" value="${config.msg91AuthKey || '556820AE979D0Hnh06a70300cP1'}" required placeholder="Enter your MSG91 AuthKey (e.g. 556820AE...)" class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-xs focus:border-emerald-500 focus:outline-none" />
              <span class="text-[10px] text-slate-400 mt-1 block">Active AuthKey: 556820AE979D0Hnh06a70300cP1</span>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 font-bold mb-1">Sender ID (6-Char DLT) *</label>
                <input type="text" name="msg91SenderId" value="${config.msg91SenderId || 'ONESTP'}" required maxlength="6" placeholder="ONESTP" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono uppercase text-xs focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label class="block text-slate-300 font-bold mb-1">DLT Flow ID (Optional)</label>
                <input type="text" name="msg91FlowId" value="${config.msg91FlowId || ''}" placeholder="Flow ID (e.g. 629f102...)" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none" />
              </div>
            </div>

            <div>
              <label class="block text-slate-300 font-bold mb-1">WhatsApp Registered Mobile Number (Optional)</label>
              <input type="text" name="msg91WhatsappNumber" value="${config.msg91WhatsappNumber || ''}" placeholder="+91 98765 43210" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none" />
            </div>

            <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
              <span class="text-emerald-400 font-bold">Status: ${config.msg91AuthKey || '556820AE979D0Hnh06a70300cP1' ? '✅ MSG91 Connected (ONESTP)' : '⚠️ Pending AuthKey'}</span>
              <button type="button" id="btn-test-msg91" class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs transition">
                🧪 Test MSG91 SMS
              </button>
            </div>

            <button type="submit" class="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold transition shadow-lg text-sm">
              💾 Save MSG91 Settings
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();

    document.getElementById('btn-test-msg91').onclick = async () => {
      const testPhone = prompt("Enter mobile phone number to send test MSG91 SMS (e.g. 9876543210):", "9876543210");
      if (testPhone) {
        try {
          this.showToast('📡 Sending test SMS via MSG91 Gateway (ONESTP)...');
          await store.sendMsg91Sms(testPhone, 'Dear Customer, test message from One Stop Solution MSG91 Gateway. Integration active!\n\nThank you,\nOne Stop Solution');
          this.showToast('✅ Test SMS sent successfully via MSG91!');
        } catch (err) {
          alert('MSG91 Error: ' + err.message);
        }
      }
    };

    document.getElementById('form-msg91-config').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      store.updateApiGateway({
        msg91AuthKey: formData.get('msg91AuthKey'),
        msg91SenderId: formData.get('msg91SenderId'),
        msg91FlowId: formData.get('msg91FlowId'),
        msg91WhatsappNumber: formData.get('msg91WhatsappNumber')
      });
      this.closeGlobalModal();
      this.showToast('📲 MSG91 Gateway settings saved & active!');
      this.render();
    };
  }

  openMobileGatewayModal() {
    const config = store.get().apiGateway || {};
    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
        <div class="w-full max-w-xl zoho-card p-6 rounded-2xl space-y-5 relative border border-blue-500/30 shadow-2xl">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
                <i data-lucide="smartphone" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="font-extrabold text-white text-base">Connect Mobile Phone SIM Gateway App</h3>
                <p class="text-xs text-slate-400">Send automatic SMS directly from your Android Phone SIM card (100% Free & Unlimited)</p>
              </div>
            </div>
            <button id="btn-close-modal" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>

          <!-- App Setup Instructions -->
          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
            <h4 class="font-bold text-amber-400 flex items-center gap-1.5">
              <i data-lucide="check-circle-2" class="w-4 h-4"></i> Free Android Gateway App (TextBee.dev) Setup Guide:
            </h4>
            <ol class="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>Open <strong><a href="https://textbee.dev" target="_blank" class="text-blue-400 underline font-bold">https://textbee.dev</a></strong> on your Android phone or laptop and create a free account.</li>
              <li>Install the free <strong>TextBee Android App</strong> on your mobile phone & register your device.</li>
              <li>Copy your <strong>API Key</strong> and <strong>Device ID</strong> from your TextBee dashboard and paste them below:</li>
            </ol>
          </div>

          <form id="form-mobile-gateway-config" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-300 font-bold mb-1">TextBee API Key *</label>
              <input type="password" name="textbeeApiKey" value="${config.textbeeApiKey || ''}" required placeholder="Paste your TextBee API Key (x-api-key)" class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-blue-400 font-mono text-xs focus:border-blue-500 focus:outline-none" />
            </div>

            <div>
              <label class="block text-slate-300 font-bold mb-1">Device ID *</label>
              <input type="text" name="textbeeDeviceId" value="${config.textbeeDeviceId || ''}" required placeholder="Paste your registered Mobile Device ID" class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-blue-500 focus:outline-none" />
            </div>

            <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-xs">
              <span class="text-blue-400 font-bold">Status: ${config.textbeeApiKey && config.textbeeDeviceId ? '✅ Android SIM Gateway Connected' : '⚠️ Pending App API Key'}</span>
              <button type="button" id="btn-test-textbee" class="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-slate-950 font-extrabold text-xs transition">
                🧪 Test SIM SMS
              </button>
            </div>

            <button type="submit" class="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-slate-950 font-extrabold transition shadow-lg text-sm">
              💾 Save Mobile Gateway Settings
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();

    document.getElementById('btn-test-textbee').onclick = async () => {
      const testPhone = prompt("Enter target phone number for test Mobile SIM SMS (e.g. +919408784562):", "+919408784562");
      if (testPhone) {
        try {
          this.showToast('📡 Sending test SMS through Android SIM card...');
          await store.sendTextBeeSms(testPhone, 'Hello! Test message sent automatically from your Android phone SIM card via StarOS Pro Mobile Gateway.');
          this.showToast('✅ Test Mobile SIM SMS dispatched successfully!');
        } catch (err) {
          alert('Mobile Gateway Error: ' + err.message);
        }
      }
    };

    document.getElementById('form-mobile-gateway-config').onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      store.updateApiGateway({
        textbeeApiKey: formData.get('textbeeApiKey'),
        textbeeDeviceId: formData.get('textbeeDeviceId')
      });
      this.closeGlobalModal();
      this.showToast('📱 Android Mobile SIM Gateway saved & active!');
      this.render();
    };
  }

  openMobileQrModal() {



    const publicMobileUrl = 'https://copyrights-crossing-context-picking.trycloudflare.com';
    const localWifiUrl = 'http://10.63.52.45:3000';
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(publicMobileUrl)}`;





    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
        <div class="w-full max-w-md zoho-card p-6 rounded-2xl space-y-5 text-center relative border border-emerald-500/30 shadow-2xl">
          <button id="btn-close-modal" class="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"><i data-lucide="x" class="w-5 h-5"></i></button>

          <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
            <i data-lucide="smartphone" class="w-6 h-6"></i>
          </div>

          <div>
            <h3 class="font-extrabold text-white text-lg">Open on Mobile Phone</h3>
            <p class="text-xs text-slate-400 mt-1">Scan the QR code with your iPhone or Android phone camera (Works on 4G/5G & Wi-Fi!)</p>
          </div>

          <!-- QR Code Container -->
          <div class="p-4 rounded-xl bg-white/90 border border-slate-700 w-fit mx-auto shadow-inner flex flex-col items-center">
            <img src="${qrApiUrl}" alt="Scan Mobile QR Code" class="w-48 h-48 rounded-lg shadow" />
          </div>

          <!-- Public Mobile URL Box -->
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">🌍 Universal Mobile Web Link (4G / 5G / Wi-Fi)</span>
            <div class="flex items-center gap-2">
              <input type="text" id="input-mobile-url" value="${publicMobileUrl}" readonly class="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs font-bold focus:outline-none" />
              <button id="btn-copy-mobile-url" class="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs transition flex-shrink-0 flex items-center gap-1 shadow">
                <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy
              </button>
            </div>
          </div>

          <!-- Local Wi-Fi Box -->
          <div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
            <span>Local Wi-Fi Link: <strong class="text-white font-mono">${localWifiUrl}</strong></span>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    document.getElementById('btn-close-modal').onclick = () => this.closeGlobalModal();

    document.getElementById('btn-copy-mobile-url').onclick = () => {
      const copyInput = document.getElementById('input-mobile-url');
      if (copyInput) {
        copyInput.select();
        navigator.clipboard.writeText(publicMobileUrl);
        this.showToast('📋 Public Mobile Link copied to clipboard!');
      }
    };
  }


  closeGlobalModal() {
    const container = document.getElementById('global-modal-container');
    if (container) container.innerHTML = '';
  }


  showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'px-4 py-3 rounded-lg bg-amber-500 text-slate-950 font-extrabold text-xs shadow-2xl shadow-amber-500/40 flex items-center gap-2 animate-fade-in pointer-events-auto border border-amber-400/50';
    toast.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 text-slate-950"></i> <span>${message}</span>`;

    toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.remove();
    }, 3500);
  }
}

// Launch App
window.app = new AppController();
