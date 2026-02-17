<script lang="ts">
	import './layout.css';
	import { Toaster } from 'svelte-sonner';
	import { ModeWatcher } from "mode-watcher";
	import { onMount } from 'svelte';
	import { dev, browser} from '$app/environment';
	import { Zap } from "@lucide/svelte";
	import { page } from '$app/stores';
	
	import PWAInstallPrompt from '$lib/components/PWAInstallPrompt.svelte';

	
	let { children } = $props();
	let mounted = $state(true)

	onMount(() => {
		mounted = true
		detectServiceWorkerUpdate();
	})

	let updateAvailable = $state(false);
  	let registration: ServiceWorkerRegistration | null = null;

	async function detectServiceWorkerUpdate() {
		if (!browser || !('serviceWorker' in navigator)) return;

		registration = await navigator.serviceWorker.ready;

		registration.addEventListener('updatefound', () => {
			const newWorker = registration.installing;
			newWorker?.addEventListener('statechange', () => {
				if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
					// Instead of confirm(), we just set our state to true
					updateAvailable = true;
				}
			});
    	});
	}


	function applyUpdate() {
		registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
		window.location.reload();
	}
</script>

<svelte:head>
	<title>Flow - Financial Intelligence</title>
	<meta name="description" content="Track your spending, understand your habits, and achieve your financial goals with Flow. Simple, beautiful, and intelligent expense tracking." />
	<meta name="keywords" content="finance tracker, expense manager, expense tracker, budget app, money management, personal finance, spending tracker, naira, dollar" />
	<meta name="author" content="RyderTech" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="language" content="English" />
	<meta name="revisit-after" content="7 days" />
	<meta name="robots" content="index, follow" />

	 <!-- Canonical URL -->
  	<link rel="canonical" href={$page.url.href} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:title" content="Flow - Financial Intelligence" />
	<meta property="og:description" content="Track your spending, understand your habits, and achieve your financial goals with Flow. Simple, beautiful, and intelligent expense tracking." />
	<meta property="og:image" content="/logo.png" />
	<meta property="og:site_name" content="Flow" />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={$page.url.href} />
	<meta property="twitter:title" content="Flow - Financial Intelligence" />
	<meta property="twitter:description" content="Track your spending, understand your habits, and achieve your financial goals with Flow. Simple, beautiful, and intelligent expense tracking." />
	<meta property="twitter:image" content="/logo.png" />
	<meta property="twitter:site" content="@official_ryder0" />
	<meta property="twitter:creator" content="@official_ryder0" />

	<!-- Structured Data / JSON-LD -->
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Flow",
      "url": "https://flow-spense.pages.dev",
      "description": description,
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "screenshot": image,
      "featureList": "Expense tracking, Category management, Multi-currency support, Analytics dashboard, PWA support",
      "softwareVersion": "1.0.0",
      "creator": {
        "@type": "Organization",
        "name": "Flow",
        "url": "https://flow-spense.pages.dev", "logo": "https://flow-spense.pages.dev/logo.png"
      }
    }, null, 2)}
  </script>

	
</svelte:head>


<ModeWatcher />
{#if mounted}
	<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
		{#if updateAvailable}
			<div class="fixed bottom-6 right-6 z-[100] max-w-sm bg-gray-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-4">
				<div class="flex items-start space-x-4">
				<div class="bg-[var(--primary)] p-2 rounded-lg">
					<Zap class="w-5 h-5" />
				</div>
				<div class="flex-1">
					<h3 class="font-bold">Update Available</h3>
					<p class="text-sm text-gray-400">A new version of RyderTech is ready.</p>
					<div class="mt-3 flex space-x-3">
					<button 
						onclick={applyUpdate}
						class="bg-white text-black px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
					>
						Update Now
					</button>
					<button 
						onclick={() => updateAvailable = false}
						class="text-gray-400 px-2 py-1.5 text-sm hover:text-white transition-colors"
					>
						Later
					</button>
					</div>
				</div>
				</div>
			</div>
		{/if}
		<div class="absolute top-4 right-4 flex items-center gap-3">
			
		</div>
		<PWAInstallPrompt showDelay={3000} autoClose={true} />
		{@render children()}
	</div>
{/if}
<Toaster richColors position="top-right" />
