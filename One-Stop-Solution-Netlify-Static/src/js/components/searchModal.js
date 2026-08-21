// Global Command Palette & Search Modal (Ctrl + K)

import { store } from '../state.js';

export function renderSearchModal() {
  return `
    <div id="search-modal" class="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md hidden animate-fade-in">
      <div class="w-full max-w-2xl zoho-card rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <!-- Search Input Bar -->
        <div class="p-4 border-b border-slate-700 flex items-center gap-3">
          <i data-lucide="search" class="w-5 h-5 text-amber-500"></i>
          <input type="text" id="cmd-search-input" placeholder="Search by Client Name, Phone, PAN, Policy #, Vehicle #..." 
                 class="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium" autofocus />
          <button id="btn-close-search-modal" class="px-2 py-1 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700 hover:text-white">ESC</button>
        </div>

        <!-- Search Results List -->
        <div id="cmd-search-results" class="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-2 text-xs">
          <div class="text-center text-slate-500 py-8">
            Type client name, phone number, PAN, vehicle registration or policy number to search...
          </div>
        </div>
      </div>
    </div>
  `;
}

export function performGlobalSearch(query) {
  const q = query.toLowerCase().trim();
  const resultsContainer = document.getElementById('cmd-search-results');
  if (!resultsContainer) return;

  if (!q) {
    resultsContainer.innerHTML = `
      <div class="text-center text-slate-500 py-8">
        Type client name, phone number, PAN, vehicle registration or policy number to search...
      </div>
    `;
    return;
  }

  const db = store.get();
  let matches = [];

  // Search Clients
  (db.clients || []).forEach(c => {
    const nameMatch = (c.name || '').toLowerCase().includes(q);
    const phoneMatch = (c.phone || '').includes(q);
    const panMatch = (c.pan || '').toLowerCase().includes(q);
    const emailMatch = (c.email || '').toLowerCase().includes(q);

    if (nameMatch || phoneMatch || panMatch || emailMatch) {
      matches.push({
        type: 'Client Profile',
        title: c.name,
        subtitle: `Phone: ${c.phone || 'N/A'} • PAN: ${c.pan || 'N/A'}`,
        link: `#clients`,
        clientId: c.id,
        icon: 'user'
      });
    }
  });

  // Search Motor Policies
  (db.motorPolicies || []).forEach(m => {
    const vehMatch = (m.vehicleNumber || '').toLowerCase().includes(q) || (m.vehicleModel || '').toLowerCase().includes(q);
    const polMatch = (m.policyNumber || '').toLowerCase().includes(q);
    const clientMatch = (m.clientName || '').toLowerCase().includes(q);

    if (vehMatch || polMatch || clientMatch) {
      matches.push({
        type: 'Motor Policy',
        title: `${m.vehicleModel} (${m.vehicleNumber})`,
        subtitle: `Client: ${m.clientName} • Policy #: ${m.policyNumber}`,
        link: `#motor`,
        clientId: m.clientId,
        icon: 'car'
      });
    }
  });

  // Search Health Policies
  (db.healthPolicies || []).forEach(h => {
    const polMatch = (h.policyNumber || '').toLowerCase().includes(q);
    const companyMatch = (h.company || '').toLowerCase().includes(q);
    const clientMatch = (h.clientName || '').toLowerCase().includes(q);

    if (polMatch || companyMatch || clientMatch) {
      matches.push({
        type: 'Health Policy',
        title: `${h.company} (${h.membersCovered || 'Cover'})`,
        subtitle: `Client: ${h.clientName} • Premium: ₹${(h.premium || 0).toLocaleString('en-IN')}`,
        link: `#health`,
        clientId: h.clientId,
        icon: 'heart-pulse'
      });
    }
  });

  // Search Life Policies
  (db.lifePolicies || []).forEach(l => {
    const polMatch = (l.policyNumber || '').toLowerCase().includes(q);
    const companyMatch = (l.company || '').toLowerCase().includes(q);
    const clientMatch = (l.clientName || '').toLowerCase().includes(q);

    if (polMatch || companyMatch || clientMatch) {
      matches.push({
        type: 'Life Policy',
        title: `Life Cover (${l.company || 'Life Insurer'})`,
        subtitle: `Client: ${l.clientName} • Sum Assured: ₹${(l.sumAssured || 0).toLocaleString('en-IN')}`,
        link: `#life`,
        clientId: l.clientId,
        icon: 'shield'
      });
    }
  });

  if (matches.length === 0) {
    resultsContainer.innerHTML = `<div class="text-center text-slate-500 py-6">No matching records found for "${query}"</div>`;
    return;
  }

  resultsContainer.innerHTML = matches.map(m => `
    <div data-search-item="true" data-link="${m.link}" data-client-id="${m.clientId || ''}" class="cmd-result-item block p-3 rounded-xl bg-slate-900/80 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/50 transition cursor-pointer">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <i data-lucide="${m.icon}" class="w-4 h-4"></i>
          </div>
          <div>
            <h5 class="font-bold text-white text-xs">${m.title}</h5>
            <p class="text-[11px] text-slate-400 mt-0.5">${m.subtitle}</p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">${m.type}</span>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}
