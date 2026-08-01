import {
  describePwaConnection,
  shouldAutoWarmOfflineCache,
  type NetworkInformationLike,
} from "./pwaPolicy";

type InstallChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

type BeforeInstallPromptEvent = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<InstallChoice>;
};

type PwaMessage = {
  type?: string;
  version?: string;
  completed?: number;
  failed?: number;
  total?: number;
  runtimeCached?: number;
  runtimeTotal?: number;
};

const isProduction = Boolean((import.meta as ImportMeta & {
  env?: { PROD?: boolean };
}).env?.PROD);
const pwaSearchParams = new URLSearchParams(window.location.search);
const isQaMode = pwaSearchParams.get("qa") === "1";
const pwaQaEnabled = !isQaMode || pwaSearchParams.get("pwa") === "1";

const installButton = document.querySelector<HTMLButtonElement>("#pwa-install-button");
const cacheButton = document.querySelector<HTMLButtonElement>("#pwa-cache-button");
const cacheStatus = document.querySelector<HTMLOutputElement>("#pwa-cache-status");
const connectionStatus = document.querySelector<HTMLElement>("#pwa-connection-status");
const networkBadge = document.querySelector<HTMLOutputElement>("#network-status");
const updatePanel = document.querySelector<HTMLElement>("#pwa-update-panel");
const updateButton = document.querySelector<HTMLButtonElement>("#pwa-update-button");
const updateDismissButton = document.querySelector<HTMLButtonElement>("#pwa-update-dismiss-button");
const screenReaderStatus = document.querySelector<HTMLOutputElement>("#screen-reader-status");

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
let registration: ServiceWorkerRegistration | null = null;
let acceptingUpdate = false;
let warmRequested = false;
let offlineReady = false;
let activeVersion = "";

function announce(message: string): void {
  if (screenReaderStatus) screenReaderStatus.textContent = message;
}

function setCacheStatus(message: string, tone: "ready" | "working" | "warning" = "working"): void {
  if (!cacheStatus) return;
  cacheStatus.textContent = message;
  cacheStatus.dataset.tone = tone;
}

function renderConnection(): void {
  const state = describePwaConnection(navigator.onLine);
  if (connectionStatus) {
    connectionStatus.textContent = state.label;
    connectionStatus.dataset.tone = state.tone;
  }
  if (networkBadge) {
    networkBadge.hidden = navigator.onLine;
    networkBadge.textContent = navigator.onLine ? "" : "Offline mode";
  }

  if (!navigator.onLine) {
    announce("You are offline. Local play and local saves remain available.");
  } else if (registration && !offlineReady) {
    setCacheStatus("Online · offline copy can keep preparing", "working");
  }
}

function showUpdatePrompt(): void {
  if (!updatePanel) return;
  updatePanel.hidden = false;
  announce("A new version of Khadija's World is ready.");
}

function hideUpdatePrompt(): void {
  if (updatePanel) updatePanel.hidden = true;
}

function postToWorker(message: Record<string, unknown>): boolean {
  const worker = registration?.active ?? navigator.serviceWorker.controller;
  if (!worker) return false;
  worker.postMessage(message);
  return true;
}

function requestOfflineWarmup(): void {
  if (!navigator.onLine) {
    setCacheStatus("Connect to the internet once to download the offline world.", "warning");
    return;
  }
  if (offlineReady || warmRequested) return;
  warmRequested = true;
  offlineReady = false;
  if (cacheButton) cacheButton.disabled = true;
  setCacheStatus("Preparing the full neighborhood for offline play…", "working");

  if (!postToWorker({ type: "PWA_WARM_OFFLINE_CACHE" })) {
    warmRequested = false;
    if (cacheButton) cacheButton.disabled = false;
    setCacheStatus("Offline download is not ready yet. Try again in a moment.", "warning");
  }
}

function handleWorkerMessage(event: MessageEvent<PwaMessage>): void {
  const message = event.data;
  if (!message || typeof message !== "object") return;

  if (message.version) activeVersion = message.version;

  if (message.type === "PWA_CACHE_PROGRESS") {
    const completed = Math.max(0, message.completed ?? 0);
    const total = Math.max(completed, message.total ?? 0);
    const failed = Math.max(0, message.failed ?? 0);
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    setCacheStatus(
      failed > 0
        ? `Offline copy ${percent}% · ${failed} item${failed === 1 ? "" : "s"} will retry when visited`
        : `Offline copy ${percent}%`,
      failed > 0 ? "warning" : "working",
    );
    return;
  }

  if (message.type === "PWA_CACHE_READY") {
    warmRequested = false;
    offlineReady = true;
    if (cacheButton) {
      cacheButton.disabled = false;
      cacheButton.textContent = "Offline copy ready";
    }
    setCacheStatus("Ready for offline play", "ready");
    announce("Khadija's World is ready for offline play.");
    return;
  }

  if (message.type === "PWA_CACHE_PARTIAL") {
    warmRequested = false;
    offlineReady = false;
    if (cacheButton) cacheButton.disabled = false;
    const failed = Math.max(1, message.failed ?? 1);
    setCacheStatus(
      `Most of the world is offline-ready. ${failed} item${failed === 1 ? "" : "s"} will retry later.`,
      "warning",
    );
    return;
  }

  if (message.type === "PWA_STATUS") {
    if (cacheButton) cacheButton.disabled = false;
    const cached = Math.max(0, message.runtimeCached ?? 0);
    const total = Math.max(cached, message.runtimeTotal ?? 0);
    if (total > 0 && cached >= total) {
      offlineReady = true;
      if (cacheButton) cacheButton.textContent = "Offline copy ready";
      setCacheStatus("Ready for offline play", "ready");
    }
    return;
  }

  if (message.type === "PWA_ACTIVE") {
    if (cacheButton) cacheButton.disabled = false;
    postToWorker({ type: "PWA_GET_STATUS" });
  }
}

function watchRegistration(nextRegistration: ServiceWorkerRegistration): void {
  registration = nextRegistration;
  if (cacheButton) cacheButton.disabled = false;

  if (nextRegistration.waiting && navigator.serviceWorker.controller) {
    showUpdatePrompt();
  }

  nextRegistration.addEventListener("updatefound", () => {
    const installing = nextRegistration.installing;
    if (!installing) return;
    installing.addEventListener("statechange", () => {
      if (installing.state === "installed" && navigator.serviceWorker.controller) {
        showUpdatePrompt();
      }
    });
  });

  postToWorker({ type: "PWA_GET_STATUS" });

  const connection = (navigator as Navigator & {
    connection?: NetworkInformationLike;
  }).connection;
  if (!isQaMode && navigator.onLine && shouldAutoWarmOfflineCache(connection)) {
    window.setTimeout(requestOfflineWarmup, 2_500);
  } else {
    setCacheStatus("The game shell is saved. Choose download for the full offline world.", "ready");
  }
}

async function registerServiceWorker(): Promise<void> {
  if (!isProduction || !pwaQaEnabled || !("serviceWorker" in navigator)) {
    if (cacheButton) cacheButton.hidden = true;
    setCacheStatus("Offline installation is available from the published game.", "warning");
    return;
  }

  try {
    const nextRegistration = await navigator.serviceWorker.register("./sw.js", {
      scope: "./",
      updateViaCache: "none",
    });
    watchRegistration(nextRegistration);
    await navigator.serviceWorker.ready;
    postToWorker({ type: "PWA_GET_STATUS" });
  } catch {
    if (cacheButton) cacheButton.disabled = true;
    setCacheStatus("Offline setup could not start. The online game still works.", "warning");
  }
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event as BeforeInstallPromptEvent;
  if (installButton) installButton.hidden = false;
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  if (installButton) installButton.hidden = true;
  setCacheStatus("Installed · preparing offline play", "working");
  requestOfflineWarmup();
});

window.addEventListener("online", () => {
  renderConnection();
  if (!isQaMode && registration && !offlineReady) requestOfflineWarmup();
});
window.addEventListener("offline", renderConnection);

navigator.serviceWorker?.addEventListener("message", handleWorkerMessage);
navigator.serviceWorker?.addEventListener("controllerchange", () => {
  if (!acceptingUpdate) return;
  window.location.reload();
});

installButton?.addEventListener("click", async () => {
  const prompt = deferredInstallPrompt;
  if (!prompt) {
    setCacheStatus("Use your browser's Install app option to add Khadija's World.", "warning");
    return;
  }

  await prompt.prompt();
  const choice = await prompt.userChoice;
  deferredInstallPrompt = null;
  installButton.hidden = true;
  setCacheStatus(
    choice.outcome === "accepted"
      ? "Installing Khadija's World…"
      : "Installation was cancelled. You can try again later.",
    choice.outcome === "accepted" ? "working" : "warning",
  );
});

cacheButton?.addEventListener("click", requestOfflineWarmup);

updateButton?.addEventListener("click", () => {
  const waiting = registration?.waiting;
  if (!waiting) {
    hideUpdatePrompt();
    return;
  }
  acceptingUpdate = true;
  updateButton.disabled = true;
  waiting.postMessage({ type: "PWA_SKIP_WAITING" });
});

updateDismissButton?.addEventListener("click", hideUpdatePrompt);

renderConnection();
setCacheStatus("Preparing offline support…", "working");
void registerServiceWorker();

if (isProduction) {
  window.setInterval(() => {
    void registration?.update();
  }, 60 * 60 * 1_000);
}

if (isQaMode) {
  (window as Window & {
    __KHADIJAS_WORLD_PWA__?: {
      getState(): {
        activeVersion: string;
        offlineReady: boolean;
        online: boolean;
        registrationReady: boolean;
      };
      warmOfflineCache(): void;
    };
  }).__KHADIJAS_WORLD_PWA__ = {
    getState: () => ({
      activeVersion,
      offlineReady,
      online: navigator.onLine,
      registrationReady: Boolean(registration?.active ?? navigator.serviceWorker.controller),
    }),
    warmOfflineCache: requestOfflineWarmup,
  };
}
