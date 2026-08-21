// Financial Advisory Modules: SIP / Mutual Funds & Foreign Exchange (Forex)

import { store } from '../state.js';

export function renderFinanceModule(subType = 'sip') {
  const db = store.get();
  if (subType === 'forex') return renderForexModule(db);
  return renderSIPModule(db);
}

// 1. SIP & Mutual Funds View
function renderSIPModule(db) {
  const mfs = db.mutualFunds;
  const totalInvested = mfs.reduce((acc, curr) => acc + curr.investedValue, 0);
  const totalCurrent = mfs.reduce((acc, curr) => acc + curr.currentValue, 0);
  const overallReturns = (((totalCurrent - totalInvested) / totalInvested) * 100).toFixed(1);

  return `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-extrabold text-white">SIP & Mutual Funds Portfolio</h2>
          <p class="text-xs text-slate-400">Track Folio numbers, monthly SIP auto-debits, current fund valuation & XIRR returns</p>
        </div>
        <button id="btn-open-add-sip-modal" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/20 transition">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span>Add New SIP</span>
        </button>
      </div>

      <!-- Portfolio Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="glass-panel p-5 rounded-2xl border border-slate-800">
          <span class="text-xs font-semibold text-slate-400 uppercase">Total Invested Value</span>
          <h3 class="text-2xl font-extrabold text-white mt-1">₹${(totalInvested / 100000).toFixed(2)} Lakhs</h3>
        </div>
        <div class="glass-panel p-5 rounded-2xl border border-slate-800">
          <span class="text-xs font-semibold text-slate-400 uppercase">Current Portfolio Value</span>
          <h3 class="text-2xl font-extrabold text-emerald-400 mt-1">₹${(totalCurrent / 100000).toFixed(2)} Lakhs</h3>
        </div>
        <div class="glass-panel p-5 rounded-2xl border border-slate-800">
          <span class="text-xs font-semibold text-slate-400 uppercase">Overall Growth Returns</span>
          <h3 class="text-2xl font-extrabold text-amber-400 mt-1">+${overallReturns}% Return</h3>
        </div>
      </div>

      <!-- MF Table -->
      <div class="glass-panel p-6 rounded-2xl border border-slate-800">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th class="py-3 px-4">Fund Name & AMC</th>
                <th class="py-3 px-4">Client</th>
                <th class="py-3 px-4">Folio #</th>
                <th class="py-3 px-4">SIP Amount</th>
                <th class="py-3 px-4">Invested Value</th>
                <th class="py-3 px-4">Current Value</th>
                <th class="py-3 px-4">Returns %</th>
                <th class="py-3 px-4 text-right">Next SIP Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${mfs.map(m => `
                <tr class="hover:bg-slate-800/40 transition">
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-white">${m.fundName}</div>
                    <div class="text-[11px] text-slate-400">${m.amc}</div>
                  </td>
                  <td class="py-3.5 px-4 font-medium text-slate-200">${m.clientName}</td>
                  <td class="py-3.5 px-4 font-mono text-slate-400">${m.folioNumber}</td>
                  <td class="py-3.5 px-4 font-bold text-amber-400">₹${m.sipAmount.toLocaleString('en-IN')}/mo</td>
                  <td class="py-3.5 px-4 font-medium text-slate-300">₹${m.investedValue.toLocaleString('en-IN')}</td>
                  <td class="py-3.5 px-4 font-bold text-emerald-400">₹${m.currentValue.toLocaleString('en-IN')}</td>
                  <td class="py-3.5 px-4 font-bold text-emerald-400">+${m.returnsPercent}%</td>
                  <td class="py-3.5 px-4 text-right font-mono text-sky-400 font-semibold">${m.nextSipDate}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// 2. Foreign Exchange View
function renderForexModule(db) {
  const fxList = db.forexTransactions;

  return `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-extrabold text-white">Foreign Exchange (Forex) Transactions</h2>
          <p class="text-xs text-slate-400">Manage overseas currency conversions, travel dates, passport & Schengen/US Visa records</p>
        </div>
        <button id="btn-open-add-forex-modal" class="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-pink-600/20 transition">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span>New Forex Order</span>
        </button>
      </div>

      <div class="glass-panel p-6 rounded-2xl border border-slate-800">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th class="py-3 px-4">Client</th>
                <th class="py-3 px-4">Currency & Amount</th>
                <th class="py-3 px-4">Exchange Rate</th>
                <th class="py-3 px-4">INR Amount</th>
                <th class="py-3 px-4">Travel Purpose</th>
                <th class="py-3 px-4">Passport & Visa</th>
                <th class="py-3 px-4 text-right">Travel Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${fxList.map(fx => `
                <tr class="hover:bg-slate-800/40 transition">
                  <td class="py-3.5 px-4 font-bold text-white">${fx.clientName}</td>
                  <td class="py-3.5 px-4 font-bold text-pink-400">${fx.currencySymbol} ${fx.amount.toLocaleString('en-US')} ${fx.currency}</td>
                  <td class="py-3.5 px-4 text-slate-300 font-mono">₹${fx.exchangeRate.toFixed(2)}</td>
                  <td class="py-3.5 px-4 font-bold text-emerald-400">₹${fx.inrAmount.toLocaleString('en-IN')}</td>
                  <td class="py-3.5 px-4 text-slate-300">${fx.purpose}</td>
                  <td class="py-3.5 px-4">
                    <div class="text-[11px] font-mono text-slate-300">${fx.passportNumber}</div>
                    <div class="text-[10px] text-emerald-400 font-semibold">${fx.visaStatus}</div>
                  </td>
                  <td class="py-3.5 px-4 text-right font-mono text-sky-400 font-semibold">${fx.travelDate}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
