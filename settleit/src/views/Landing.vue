<script setup>
import { ref } from 'vue';
import { 
  ArrowRight, 
  Menu, 
  X, 
  PieChart, 
  FileText, 
  Globe, 
  Users,
  Code2,
  Github
} from 'lucide-vue-next';

const email = ref('');
const isMenuOpen = ref(false);

const features = [
  {
    title: 'Group Settlement Algorithm',
    desc: 'Optimizes graph connectivity to minimize the total number of transactions required to settle debts.',
    icon: Users,
    visual: 'graph' 
  },
  {
    title: 'Expense Visualization',
    desc: 'Interactive charts rendering spending data by category, user, and time period.',
    icon: PieChart,
    visual: 'chart'
  },
  {
    title: 'Real-time Synchronization',
    desc: 'Instant data updates across clients using WebSocket connections for seamless collaboration.',
    icon: Globe,
    visual: 'map'
  },
  {
    title: 'Transparent Logs',
    desc: 'Immutable record keeping of all transactions and edits for complete group accountability.',
    icon: FileText,
    visual: 'list'
  }
];
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white pb-20">
    
    <nav class="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div class="flex items-center gap-2.5 cursor-pointer">
          <div class="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span class="text-xl font-bold tracking-tight text-slate-900">SettleIt</span>
        </div>

        <div class="hidden md:flex items-center gap-10">
          <a href="#features" class="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Project Overview</a>
          <a href="#tech-stack" class="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Documentation</a>
        </div>

        <div class="hidden md:flex items-center gap-4">
          <a href="#" class="text-slate-600 hover:text-slate-900 transition-colors">
            <Github :size="20" />
          </a>
          <button class="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95">
            Launch App
          </button>
        </div>

        <button @click="isMenuOpen = !isMenuOpen" class="md:hidden text-slate-600">
          <Menu v-if="!isMenuOpen" />
          <X v-else />
        </button>
      </div>
      
      <div v-if="isMenuOpen" class="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-xl">
        <a href="#" class="text-slate-600 font-medium py-2">Project Overview</a>
        <a href="#" class="text-slate-600 font-medium py-2">Documentation</a>
        <hr class="border-slate-100">
        <button class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold">Launch App</button>
      </div>
    </nav>

    <header class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
      <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      <div class="absolute top-20 right-0 -translate-y-12 translate-x-12 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] -z-10"></div>
      <div class="absolute top-40 left-0 -translate-x-20 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px] -z-10"></div>

      <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wide mb-8">
            <Code2 class="w-3 h-3" />
            Built with Vue.js & Tailwind
          </div>
          
          <h1 class="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Smart expense tracking for <br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">roommates & teams.</span>
          </h1>
          
          <p class="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
            An open-source web application designed to simplify shared living costs. Manage dorm expenses, split grocery bills, and visualize spending habits without the spreadsheet headache.
          </p>

          <div class="flex flex-col sm:flex-row gap-4">
            <button class="bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group">
              View Demo
              <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button class="px-8 py-4 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200 flex items-center justify-center gap-2">
              <Github class="w-4 h-4" />
              View Source
            </button>
          </div>
        </div>

        <div class="relative perspective-1000">
          <div class="relative z-10 bg-white rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-2 transform rotate-y-6 rotate-x-6 hover:rotate-0 transition-all duration-700 ease-out">
            <div class="bg-slate-50 border-b border-slate-100 rounded-t-xl p-4 flex items-center justify-between">
              <div class="flex gap-2">
                <div class="w-3 h-3 rounded-full bg-slate-300"></div>
                <div class="w-3 h-3 rounded-full bg-slate-300"></div>
                <div class="w-3 h-3 rounded-full bg-slate-300"></div>
              </div>
              <div class="text-xs font-mono text-slate-400">localhost:3000/dashboard</div>
            </div>
            
            <div class="p-6 grid grid-cols-12 gap-6 bg-white rounded-b-xl min-h-[300px]">
              <div class="col-span-3 space-y-3">
                <div class="h-2 w-1/2 bg-slate-200 rounded mb-6"></div>
                <div class="h-8 w-full bg-indigo-50 text-indigo-600 rounded-lg flex items-center px-3 text-xs font-semibold">Overview</div>
                <div class="h-8 w-full text-slate-400 rounded-lg flex items-center px-3 text-xs">History</div>
                <div class="h-8 w-full text-slate-400 rounded-lg flex items-center px-3 text-xs">Members</div>
              </div>
              
              <div class="col-span-9 space-y-6">
                <div class="flex justify-between items-end">
                  <div>
                    <div class="text-xs text-slate-400 mb-1">Current Balance</div>
                    <div class="text-2xl font-bold text-slate-900">$420.50</div>
                  </div>
                  <div class="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-md">Add Expense</div>
                </div>
                
                <div class="flex items-end gap-2 h-32 pt-6 border-b border-dashed border-slate-100 pb-4">
                  <div class="flex-1 bg-indigo-100 rounded-t-md h-[40%]"></div>
                  <div class="flex-1 bg-indigo-100 rounded-t-md h-[60%]"></div>
                  <div class="flex-1 bg-indigo-100 rounded-t-md h-[30%]"></div>
                  <div class="flex-1 bg-indigo-600 rounded-t-md h-[85%] relative group cursor-pointer">
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Groceries
                    </div>
                  </div>
                  <div class="flex-1 bg-indigo-100 rounded-t-md h-[50%]"></div>
                  <div class="flex-1 bg-indigo-100 rounded-t-md h-[45%]"></div>
                </div>

                <div class="space-y-3">
                  <div class="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <FileText :size="14" />
                      </div>
                      <div class="text-xs">
                        <div class="font-bold text-slate-800">Internet Bill</div>
                        <div class="text-slate-400">Paid by Alex</div>
                      </div>
                    </div>
                    <div class="text-xs font-bold text-slate-900">$45.00</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <section id="features" class="py-24 px-6 border-t border-slate-200">
      <div class="max-w-7xl mx-auto">
        <div class="max-w-3xl mb-16">
          <h2 class="text-indigo-600 font-bold mb-4 uppercase tracking-wider text-sm">System Features</h2>
          <h3 class="text-3xl font-bold text-slate-900 mb-4">Technical implementation details.</h3>
          <p class="text-lg text-slate-500">
            This project focuses on solving the "NP-hard" problem of debt simplification within small sub-groups efficiently.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="(feature, idx) in features" 
            :key="idx"
            class="group bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full"
          >
            <div>
              <div class="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                <component :is="feature.icon" :size="24" />
              </div>
              <h4 class="text-xl font-bold text-slate-900 mb-3">{{ feature.title }}</h4>
              <p class="text-sm text-slate-500 leading-relaxed">{{ feature.desc }}</p>
            </div>

            <div class="mt-8 pt-8 border-t border-slate-50">
              <div v-if="feature.visual === 'graph'" class="flex justify-center gap-1 items-end h-12 opacity-50 group-hover:opacity-100 transition-opacity">
                 <div class="w-2 h-4 bg-indigo-200 rounded-t"></div>
                 <div class="w-2 h-8 bg-indigo-300 rounded-t"></div>
                 <div class="w-2 h-6 bg-indigo-400 rounded-t"></div>
                 <div class="w-2 h-10 bg-indigo-500 rounded-t"></div>
                 <div class="w-2 h-5 bg-indigo-200 rounded-t"></div>
              </div>
              
              <div v-if="feature.visual === 'map'" class="relative h-12 w-full bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                <div class="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-1 opacity-20">
                  <div class="bg-indigo-400 rounded-sm"></div>
                  <div class="bg-indigo-200 rounded-sm col-span-2"></div>
                </div>
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-600 rounded-full shadow-[0_0_0_4px_rgba(79,70,229,0.2)]"></div>
              </div>

               <div v-if="feature.visual === 'list'" class="space-y-2 opacity-60 group-hover:opacity-100 transition-opacity">
                 <div class="h-2 w-full bg-slate-100 rounded"></div>
                 <div class="h-2 w-3/4 bg-slate-100 rounded"></div>
                 <div class="h-2 w-5/6 bg-slate-100 rounded"></div>
              </div>

              <div v-if="feature.visual === 'chart'" class="flex items-center justify-center">
                 <div class="w-10 h-10 rounded-full border-4 border-indigo-100 border-t-indigo-500 rotate-45"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-slate-900 py-24 px-6 text-white overflow-hidden relative rounded-t-[3rem]">
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[128px]"></div>
      
      <div class="max-w-7xl mx-auto relative z-10">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold mb-6">Workflow</h2>
          <p class="text-slate-400 max-w-xl mx-auto">How the application processes user data.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-12 relative">
          <div class="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-indigo-900 via-indigo-500 to-indigo-900 border-t border-dashed border-slate-600 z-0"></div>

          <div class="relative z-10 flex flex-col items-center text-center">
            <div class="w-24 h-24 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-2xl font-bold mb-8 shadow-2xl shadow-black/50">
              1
            </div>
            <h3 class="text-xl font-bold mb-3">Input</h3>
            <p class="text-slate-400 text-sm leading-relaxed">Users add transactions. Data is validated and stored in the NoSQL database.</p>
          </div>

          <div class="relative z-10 flex flex-col items-center text-center">
            <div class="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold mb-8 shadow-2xl shadow-indigo-900/50 ring-4 ring-indigo-900">
              2
            </div>
            <h3 class="text-xl font-bold mb-3">Process</h3>
            <p class="text-slate-400 text-sm leading-relaxed">The simplification algorithm runs to determine the most efficient debt path.</p>
          </div>

          <div class="relative z-10 flex flex-col items-center text-center">
            <div class="w-24 h-24 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-2xl font-bold mb-8 shadow-2xl shadow-black/50">
              3
            </div>
            <h3 class="text-xl font-bold mb-3">Output</h3>
            <p class="text-slate-400 text-sm leading-relaxed">Settlement reports are generated and synced to all connected client dashboards.</p>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.animate-bounce-slow {
  animation: bounce-slow 4s ease-in-out infinite;
}

.perspective-1000 {
  perspective: 1000px;
}
</style>