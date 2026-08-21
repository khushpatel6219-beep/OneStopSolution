// Interactive Schedule & Renewal Calendar Component (Full Scheduling Tool)

import { store, formatDateDMY } from '../state.js';

export function renderCalendar() {
  const db = store.get();
  const events = db.calendarEvents || [];

  // Dynamic live date calculation
  const liveNow = new Date();
  const liveDay = liveNow.getDate(); // 28th July today
  const liveMonthName = liveNow.toLocaleString('en-US', { month: 'long' });
  const liveYear = liveNow.getFullYear();

  return `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-extrabold text-white flex items-center gap-2">
            <i data-lucide="calendar" class="w-5 h-5 text-amber-400"></i>
            Interactive Schedule & Renewal Calendar
          </h2>
          <p class="text-xs text-slate-400">Windows/System Calendar: Auto-updates day by day • Client onboardings, meetings & policy renewals</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-extrabold text-xs">
            📅 ${liveMonthName} ${liveYear} (Today: ${liveDay}th ${liveMonthName})
          </span>
          <button id="btn-open-add-event-modal" class="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition">
            <i data-lucide="plus" class="w-4 h-4"></i> Schedule Event
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Monthly Grid (8 Cols) -->
        <div class="lg:col-span-8 zoho-card p-6 rounded-xl space-y-4">
          <div class="grid grid-cols-7 gap-2 text-center text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 border-b border-[#1E293B] pb-3">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div class="grid grid-cols-7 gap-2">
            ${Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `2026-07-${dayNum < 10 ? '0' + dayNum : dayNum}`;
              const dayEvents = events.filter(e => e.date === dateStr);
              const isToday = dayNum === liveDay;

              return `
                <div data-calendar-day="${dateStr}" class="min-h-[86px] p-2 rounded-lg border transition cursor-pointer hover:border-amber-400/50 ${
                  isToday 
                    ? 'bg-rose-500/20 border-rose-500 text-white font-bold shadow-lg shadow-rose-500/10 ring-2 ring-rose-500/50' 
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-300'
                }">
                  <div class="flex items-center justify-between text-xs mb-1">
                    <span class="${isToday ? 'px-1.5 py-0.5 rounded-full bg-rose-500 text-slate-950 font-extrabold text-[10px]' : 'font-bold'}">${dayNum}${isToday ? ' TODAY' : ''}</span>
                    ${dayEvents.length > 0 ? `<span class="text-[9px] font-bold text-amber-400 font-mono">${dayEvents.length}</span>` : ''}
                  </div>
                  <div class="space-y-1">
                    ${dayEvents.map(e => `
                      <div data-edit-event="${e.id}" class="px-1.5 py-0.5 rounded text-[9px] font-bold truncate bg-${e.color || 'rose'}-500/20 text-${e.color || 'rose'}-400 border border-${e.color || 'rose'}-500/30 hover:opacity-80">
                        ${e.title}
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Right Agenda List & Event Manager (4 Cols) -->
        <div class="lg:col-span-4 zoho-card p-6 rounded-xl space-y-4">
          <div class="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 class="font-extrabold text-white text-base">Scheduled Agenda</h3>
            <span class="text-xs text-emerald-400 font-bold">${events.length} Events</span>
          </div>

          <div class="space-y-3 max-h-[540px] overflow-y-auto custom-scrollbar">
            ${events.map(ev => `
              <div class="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E293B] space-y-1.5 relative group hover:border-amber-500/30 transition">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">${ev.type || 'Event'}</span>
                  <div class="flex items-center gap-1">
                    <span class="text-[10px] font-mono text-slate-400 mr-1">${formatDateDMY(ev.date)} • ${ev.time}</span>
                    <button data-edit-event="${ev.id}" class="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white" title="Edit Event">
                      <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                    </button>
                    <button data-delete-event="${ev.id}" class="p-1 rounded hover:bg-rose-900/40 text-slate-400 hover:text-rose-400" title="Delete Event">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </div>
                <h4 class="font-bold text-white text-xs mt-1">${ev.title}</h4>
                <p class="text-[11px] text-slate-400">Client: <strong class="text-slate-200">${ev.client}</strong></p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

