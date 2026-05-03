const DEFAULT_PROMPT =
  "You are generating alt text for an image posted on social media. " +
  "Priority: if the image contains visible text (memes, screenshots, signs, captions), " +
  "transcribe ALL of that text verbatim. If there is no text, write a concise, " +
  "vivid description of the image suitable for a screen reader. " +
  "Output only the alt text itself — no preamble, no quotes, no markdown. " +
  "Keep it under 1000 characters.";

const els = {
  provider: document.getElementById("provider"),
  panes: document.querySelectorAll(".provider-pane"),
  openaiKey: document.getElementById("openai-key"),
  openaiModel: document.getElementById("openai-model"),
  anthropicKey: document.getElementById("anthropic-key"),
  anthropicModel: document.getElementById("anthropic-model"),
  googleKey: document.getElementById("google-key"),
  googleModel: document.getElementById("google-model"),
  ollamaEndpoint: document.getElementById("ollama-endpoint"),
  ollamaModel: document.getElementById("ollama-model"),
  prompt: document.getElementById("prompt"),
  resetPrompt: document.getElementById("reset-prompt"),
  attribution: document.getElementById("attribution"),
  save: document.getElementById("save"),
  status: document.getElementById("status"),
};

function showPane(provider) {
  els.panes.forEach((p) => {
    p.classList.toggle("active", p.dataset.provider === provider);
  });
}

function setStatus(text, kind = "") {
  els.status.textContent = text;
  if (kind) els.status.setAttribute("data-kind", kind);
  else els.status.removeAttribute("data-kind");
  if (text) {
    setTimeout(() => {
      if (els.status.textContent === text) {
        els.status.textContent = "";
        els.status.removeAttribute("data-kind");
      }
    }, 2500);
  }
}

async function load() {
  const resp = await chrome.runtime.sendMessage({ type: "AUTOALT_GET_CONFIG" });
  if (!resp?.ok) {
    setStatus("Failed to load config.", "error");
    return;
  }
  const cfg = resp.config;
  els.provider.value = cfg.provider;
  showPane(cfg.provider);
  els.openaiKey.value = cfg.openai?.apiKey || "";
  els.openaiModel.value = cfg.openai?.model || "";
  els.anthropicKey.value = cfg.anthropic?.apiKey || "";
  els.anthropicModel.value = cfg.anthropic?.model || "";
  els.googleKey.value = cfg.google?.apiKey || "";
  els.googleModel.value = cfg.google?.model || "";
  els.ollamaEndpoint.value = cfg.ollama?.endpoint || "";
  els.ollamaModel.value = cfg.ollama?.model || "";
  els.prompt.value = cfg.prompt || DEFAULT_PROMPT;
  els.attribution.checked = Boolean(cfg.attribution);
}

async function save() {
  const patch = {
    provider: els.provider.value,
    prompt: els.prompt.value.trim() || DEFAULT_PROMPT,
    attribution: els.attribution.checked,
    openai: {
      apiKey: els.openaiKey.value.trim(),
      model: els.openaiModel.value.trim() || "gpt-5.4-nano",
    },
    anthropic: {
      apiKey: els.anthropicKey.value.trim(),
      model: els.anthropicModel.value.trim() || "claude-haiku-4-5",
    },
    google: {
      apiKey: els.googleKey.value.trim(),
      model: els.googleModel.value.trim() || "gemini-3.1-flash-lite-preview",
    },
    ollama: {
      endpoint: els.ollamaEndpoint.value.trim() || "http://localhost:11434",
      model: els.ollamaModel.value.trim() || "gemma4:e2b",
    },
  };
  const resp = await chrome.runtime.sendMessage({
    type: "AUTOALT_SET_CONFIG",
    patch,
  });
  if (resp?.ok) setStatus("Saved.", "ok");
  else setStatus(resp?.error || "Save failed.", "error");
}

els.provider.addEventListener("change", () => showPane(els.provider.value));
els.save.addEventListener("click", save);
els.resetPrompt.addEventListener("click", () => {
  els.prompt.value = DEFAULT_PROMPT;
});

load();
