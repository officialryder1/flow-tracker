<script lang="ts">
  import { fade } from 'svelte/transition';
  import { X, Download, Smartphone, Share2, Plus, Check, Loader2, Zap, WifiOff, Bell, ChevronDown } from '@lucide/svelte';
  

  let { showDelay = 3000, autoClose = true} = $props()
  
  // State
  let deferredPrompt = $state<any>(null);
  let showInstallPrompt = $state(false);
  let isIOS = $state(false);
  let isStandalone = $state(false);
  let isAndroid = $state(false);
  let showInstructions = $state(false);
  let installationStatus = $state<'idle' | 'installing' | 'success' | 'error'>('idle');
  
  // Detect platform
  const detectPlatform = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    isIOS = /iphone|ipad|ipod/.test(userAgent);
    isAndroid = /android/.test(userAgent);
    isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                  (navigator as any).standalone === true;
  };

  // Handle beforeinstallprompt event
  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    deferredPrompt = e;
    
    if (!isStandalone && !isIOS) {
      setTimeout(() => {
        if (shouldShowPrompt()) {
          showInstallPrompt = true;
        }
      }, showDelay);
    }
  };

  // Install PWA
  const installPWA = async () => {
    if (!deferredPrompt) return;
    
    installationStatus = 'installing';
    
    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        installationStatus = 'success';
        console.log('User accepted the install prompt');
        
        if (autoClose) {
          setTimeout(() => {
            showInstallPrompt = false;
          }, 2000);
        }
      } else {
        installationStatus = 'idle';
        console.log('User dismissed the install prompt');
        closePrompt(true);
      }
      
      deferredPrompt = null;
    } catch (error) {
      console.error('Installation failed:', error);
      installationStatus = 'error';
    }
  };

  // Close prompt
  const closePrompt = (dismissForWeek = false) => {
    showInstallPrompt = false;
    if (dismissForWeek) {
      localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    }
  };

  // Check if we should show prompt
  const shouldShowPrompt = () => {
    if (isStandalone) return false;
    
    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
    if (!dismissedTime) return true;
    
    const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
    return daysSinceDismissed > 7;
  };

  // Initialize
  $effect.pre(() => {
    if (typeof window === 'undefined') return;
    
    detectPlatform();
    
    if (!isStandalone && shouldShowPrompt()) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      
      // For iOS/Android without beforeinstallprompt support
      if ((isIOS || isAndroid) && !deferredPrompt) {
        setTimeout(() => {
          if (shouldShowPrompt()) {
            showInstallPrompt = true;
          }
        }, showDelay);
      }
    }

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      isStandalone = true;
      showInstallPrompt = false;
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  });
</script>

{#if showInstallPrompt}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" transition:fade={{ duration: 300 }}>
    <div class="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
      
      {#if installationStatus === 'success'}
        <!-- Success State -->
        <div class="flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div class="relative">
            <div class="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check class="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <div class="absolute -top-1 -right-1">
              <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Check class="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">App Installed!</h3>
            <p class="text-gray-600 dark:text-gray-400">
              The app has been successfully added to your device.
            </p>
          </div>
          <button
            class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            onclick={() => closePrompt()}
          >
            Get Started
          </button>
        </div>
        
      {:else if installationStatus === 'installing'}
        <!-- Installing State -->
        <div class="flex flex-col items-center justify-center p-8 text-center space-y-6">
          <Loader2 class="w-12 h-12 animate-spin text-blue-600" />
          <div class="space-y-2">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Installing...</h3>
            <p class="text-gray-600 dark:text-gray-400">
              Please wait while we install the app on your device.
            </p>
          </div>
        </div>
        
      {:else}
        <!-- Main Install Prompt -->
        <!-- Header -->
        <div class="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Smartphone class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">Install Our App</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  For a better experience on your {isIOS ? 'iPhone/iPad' : isAndroid ? 'Android device' : 'device'}
                </p>
              </div>
            </div>
            <button
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onclick={() => closePrompt(true)}
              aria-label="Close"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <!-- Content -->
        <div class="px-6 py-4">
          <!-- Benefits -->
          <div class="space-y-3 mb-6">
            <div class="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
              <div class="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30">
                <Zap class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p class="font-medium text-sm text-gray-900 dark:text-white">Faster Loading</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">Instant access from your home screen</p>
              </div>
            </div>
            
            <div class="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
              <div class="p-2 rounded-md bg-green-100 dark:bg-green-900/30">
                <WifiOff class="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p class="font-medium text-sm text-gray-900 dark:text-white">Offline Access</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">Use without internet connection</p>
              </div>
            </div>
            
            <div class="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
              <div class="p-2 rounded-md bg-purple-100 dark:bg-purple-900/30">
                <Bell class="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p class="font-medium text-sm text-gray-900 dark:text-white">Push Notifications</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">Stay updated with important alerts</p>
              </div>
            </div>
          </div>

          {#if isIOS && !deferredPrompt}
            <!-- iOS Instructions -->
            <div class="mb-6">
              <button
                class="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onclick={() => showInstructions = !showInstructions}
              >
                <div class="flex items-center gap-2">
                  <Share2 class="w-4 h-4" />
                  <span class="font-medium text-sm">Show iOS Installation Steps</span>
                </div>
                <ChevronDown class={`w-4 h-4 transition-transform ${showInstructions ? 'rotate-180' : ''}`} />
              </button>
              
              {#if showInstructions}
                <div class="mt-4 space-y-4 text-sm pl-1">
                  <div class="flex items-start gap-3">
                    <span class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 text-xs font-medium">
                      1
                    </span>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">Tap Share Button</p>
                      <p class="text-gray-600 dark:text-gray-400">Open Safari menu and tap the <span class="font-medium">Share</span> icon</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start gap-3">
                    <span class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 text-xs font-medium">
                      2
                    </span>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">Add to Home Screen</p>
                      <p class="text-gray-600 dark:text-gray-400">Scroll down and select <span class="font-medium">"Add to Home Screen"</span></p>
                    </div>
                  </div>
                  
                  <div class="flex items-start gap-3">
                    <span class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 text-xs font-medium">
                      3
                    </span>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">Confirm Installation</p>
                      <p class="text-gray-600 dark:text-gray-400">Tap <span class="font-medium">"Add"</span> in the top right corner</p>
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>
        
        <!-- Divider -->
        <div class="border-t border-gray-200 dark:border-gray-800"></div>
        
        <!-- Actions -->
        <div class="px-6 py-4 space-y-3">
          <!-- Install Button -->
          {#if deferredPrompt}
            <button
              class="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onclick={installPWA}
              disabled={installationStatus === 'installing'}
            >
              {#if installationStatus === 'installing'}
                <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                Installing...
              {:else}
                <Download class="mr-2 h-4 w-4" />
                Install Now
              {/if}
            </button>
          {:else if isIOS}
            <button
              class="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              onclick={() => closePrompt(true)}
            >
              <Plus class="mr-2 h-4 w-4" />
              Add to Home Screen
            </button>
          {:else}
            <button
              class="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
              onclick={() => closePrompt(true)}
            >
              <Smartphone class="mr-2 h-4 w-4" />
              Open in Browser
            </button>
          {/if}
          
          <button
            class="w-full py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onclick={() => closePrompt(true)}
            disabled={installationStatus === 'installing'}
          >
            Remind Me Later
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}