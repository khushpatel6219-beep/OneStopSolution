// One Stop Solution Login Screen Component

export function renderLoginScreen() {
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in font-sans">
      <div class="w-full max-w-md bg-white/10 dark:bg-[#181E2B]/90 backdrop-blur-xl p-8 rounded-3xl border border-white/20 dark:border-amber-500/30 shadow-2xl space-y-6">
        
        <!-- Logo & Branding -->
        <div class="text-center space-y-2">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 font-black text-2xl">
            O
          </div>
          <h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">One Stop <span class="text-amber-500">SOLUTION</span></h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Business Operating System & CRM Portal</p>
        </div>

        <!-- Login Form -->
        <form id="form-login-auth" class="space-y-4 text-xs">
          <div id="login-error-msg" class="hidden p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-semibold text-center">
            Invalid Username or Password. Please try again.
          </div>

          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-extrabold mb-1.5 uppercase tracking-wider text-[11px]">Username *</label>
            <div class="relative">
              <input type="text" name="username" id="login-username" required placeholder="Enter your username" 
                     class="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none text-sm font-semibold transition" />
            </div>
          </div>

          <div>
            <label class="block text-slate-700 dark:text-slate-300 font-extrabold mb-1.5 uppercase tracking-wider text-[11px]">Password *</label>
            <div class="relative">
              <input type="password" name="password" id="login-password" required placeholder="Enter your password" 
                     class="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none text-sm font-semibold transition" />
            </div>
          </div>

          <button type="submit" class="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 font-black text-sm transition shadow-xl shadow-amber-500/20 uppercase tracking-wider mt-2">
            Sign In to Account
          </button>
        </form>

        <div class="text-center pt-2">
          <p class="text-[11px] text-slate-400">One Stop Solution © 2026 • Authorized Personnel Only</p>
        </div>

      </div>
    </div>
  `;
}
