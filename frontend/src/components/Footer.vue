<template>
  <footer class="bg-slate-950 text-white border-t border-slate-900">
    <div class="max-w-7xl mx-auto px-6 py-20">
      
      <!-- Top Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">
        
        <!-- Brand Identity -->
        <div class="space-y-6">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <ZapIcon class="w-6 h-6 text-white fill-white" />
            </div>
            <span class="text-2xl font-black tracking-tighter">TrackTimi<span class="text-primary-500">.</span></span>
          </div>
          <p class="text-slate-400 text-sm leading-relaxed font-medium">
            The next-generation workforce intelligence platform. Secure GPS verification, multi-tenant architecture, and real-time attendance analytics for modern organizations.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center hover:bg-primary-600 transition-all text-slate-400 hover:text-white">
              <TwitterIcon class="w-4 h-4" />
            </a>
            <a href="#" class="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center hover:bg-primary-600 transition-all text-slate-400 hover:text-white">
              <LinkedinIcon class="w-4 h-4" />
            </a>
            <a href="#" class="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center hover:bg-primary-600 transition-all text-slate-400 hover:text-white">
              <GithubIcon class="w-4 h-4" />
            </a>
          </div>
        </div>

        <!-- Product -->
        <div>
          <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 mb-8">Platform</h4>
          <ul class="space-y-4 text-sm font-bold text-slate-400">
            <li><router-link to="/" class="hover:text-white transition-colors">Overview</router-link></li>
            <li><a href="#geofence" class="hover:text-white transition-colors">Geofencing</a></li>
            <li><a href="#features" class="hover:text-white transition-colors">Security Core</a></li>
            <li><a href="#pricing" class="hover:text-white transition-colors">Pricing Plans</a></li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 mb-8">Resources</h4>
          <ul class="space-y-4 text-sm font-bold text-slate-400">
            <li><a href="#" class="hover:text-white transition-colors">Documentation</a></li>
            <li><a href="#" class="hover:text-white transition-colors">API Reference</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Help Center</a></li>
            <li><router-link to="/login" class="hover:text-white transition-colors">Support Portal</router-link></li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 mb-8">Global HQ</h4>
          <div class="space-y-6 text-sm font-bold text-slate-400">
            <div class="flex items-start space-x-3">
              <MailIcon class="w-5 h-5 text-primary-500 shrink-0" />
              <a href="mailto:hello@tracktimi.com" class="hover:text-white transition-colors">hello@tracktimi.com</a>
            </div>
            <div class="flex items-start space-x-3">
              <MapPinIcon class="w-5 h-5 text-primary-500 shrink-0" />
              <span>Monrovia, <br />Montserrado County, Liberia</span>
            </div>
            <div class="pt-4">
              <div class="inline-flex items-center space-x-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span class="text-[10px] text-green-500 uppercase tracking-widest">System Status: Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="text-[11px] font-black text-slate-500 uppercase tracking-widest">
          © 2026 TrackTimi Systems. Inspired by 
          <span class="text-orange-500 hover:text-orange-400 cursor-pointer">THE ORANGE DIGITAL CENTER(ODC)</span>
        </div>
        
        <div class="flex space-x-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">
          <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" class="hover:text-white transition-colors">Cookie Policy</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { 
  ZapIcon, MailIcon, MapPinIcon, 
  TwitterIcon, LinkedinIcon, GithubIcon 
} from 'lucide-vue-next'
</script>

<style scoped>
/* Optional: Subtle fade-in for the developer credit */
span.text-primary-500 {
  transition: color 0.3s ease;
}
</style>