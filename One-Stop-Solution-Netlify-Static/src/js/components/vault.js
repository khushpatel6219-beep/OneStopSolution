// Document Vault Component

import { store } from '../state.js';

let activeCategory = 'All Documents';

export function renderDocumentVault() {
  const db = store.get();
  const allDocs = db.documents || [];

  const categories = ["All Documents", "Identification", "Motor Insurance", "Vehicle RC", "Medical Reports", "Financial Proof"];

  const docs = activeCategory === 'All Documents' 
    ? allDocs 
    : allDocs.filter(d => (d.fileCategory || '').toLowerCase() === activeCategory.toLowerCase() || (d.documentType || '').toLowerCase() === activeCategory.toLowerCase());

  return `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">Document Vault & Compliance Files</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Secure repository for client PAN, Aadhaar, Passports, RC Books, Policy PDFs & Medical Reports</p>
        </div>
        <button id="btn-open-upload-modal" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition">
          <i data-lucide="upload-cloud" class="w-4 h-4"></i>
          <span>Upload Document</span>
        </button>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex flex-wrap gap-2">
        ${categories.map(cat => `
          <button data-vault-cat="${cat}" class="doc-cat-btn px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            activeCategory === cat 
              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/50 shadow-sm' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }">
            ${cat}
          </button>
        `).join('')}
      </div>

      <!-- Document Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${docs.length > 0 ? docs.map(doc => `
          <div class="zoho-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-amber-500/50 transition">
            <div>
              <div class="flex items-start justify-between">
                <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                  <i data-lucide="${(doc.documentType || '').includes('Passport') || (doc.documentType || '').includes('PAN') ? 'id-card' : (doc.documentType || '').includes('RC') ? 'car' : 'file-text'}" class="w-5 h-5"></i>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">${doc.status || 'Verified'}</span>
              </div>
              <h4 class="font-bold text-slate-900 dark:text-white text-sm mt-3 truncate">${doc.fileName}</h4>
              <p class="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5">${doc.clientName}</p>
              <div class="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Category: ${doc.fileCategory || doc.documentType}</span>
                <span>${doc.fileSize || '1.2 MB'}</span>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span class="text-[10px] text-slate-400">Uploaded: ${doc.uploadDate}</span>
              <div class="flex items-center gap-2">
                <button data-preview-url="${doc.fileUrl}" data-preview-title="${doc.fileName}" class="btn-preview-doc px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 text-slate-700 dark:text-slate-300 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1">
                  <i data-lucide="eye" class="w-3.5 h-3.5"></i> Preview
                </button>
                <a href="${doc.fileUrl}" download="${doc.fileName}" class="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition" title="Download">
                  <i data-lucide="download" class="w-3.5 h-3.5"></i>
                </a>
              </div>
            </div>
          </div>
        `).join('') : `
          <div class="col-span-full text-center py-12 space-y-3 zoho-card p-6 rounded-2xl">
            <i data-lucide="folder-open" class="w-12 h-12 text-slate-400 mx-auto"></i>
            <p class="text-sm font-semibold text-slate-400">No documents found in "${activeCategory}"</p>
            <p class="text-xs text-slate-500">Click "Upload Document" above to store PAN, Aadhaar, Passports, RC Books or policy PDFs.</p>
          </div>
        `}
      </div>
    </div>
  `;
}

export function attachVaultListeners(appInstance) {
  const btnUpload = document.getElementById('btn-open-upload-modal');
  if (btnUpload) {
    btnUpload.onclick = () => {
      appInstance.openUploadVaultDocumentModal();
    };
  }

  document.querySelectorAll('[data-vault-cat]').forEach(btn => {
    btn.onclick = () => {
      activeCategory = btn.getAttribute('data-vault-cat');
      appInstance.render();
    };
  });

  document.querySelectorAll('.btn-preview-doc').forEach(btn => {
    btn.onclick = () => {
      const url = btn.getAttribute('data-preview-url');
      const title = btn.getAttribute('data-preview-title');
      appInstance.openPreviewImageModal(title, url);
    };
  });
}

