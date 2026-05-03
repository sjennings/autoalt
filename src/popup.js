const PROVIDER_LABEL = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  ollama: "Ollama",
};

function isConfigured(cfg) {
  switch (cfg.provider) {
    case "openai":
      return Boolean(cfg.openai?.apiKey);
    case "anthropic":
      return Boolean(cfg.anthropic?.apiKey);
    case "google":
      return Boolean(cfg.google?.apiKey);
    case "ollama":
      return Boolean(cfg.ollama?.endpoint);
    default:
      return false;
  }
}

async function init() {
  const providerPill = document.getElementById("provider-pill");
  const statusPill = document.getElementById("status-pill");

  const resp = await chrome.runtime.sendMessage({ type: "AUTOALT_GET_CONFIG" });
  if (resp?.ok) {
    const cfg = resp.config;
    providerPill.textContent = PROVIDER_LABEL[cfg.provider] || cfg.provider;
    if (isConfigured(cfg)) {
      statusPill.textContent = "Ready";
    } else {
      statusPill.textContent = "Needs key";
      statusPill.classList.add("warn");
    }
  } else {
    providerPill.textContent = "?";
    statusPill.textContent = "Error";
    statusPill.classList.add("warn");
  }

  document.getElementById("open-options").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
  document.getElementById("open-bsky").addEventListener("click", () => {
    chrome.tabs.create({ url: "https://bsky.app/" });
  });
}

init();
