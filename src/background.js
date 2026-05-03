import { generateAltText as openaiGen } from "./providers/openai.js";
import { generateAltText as anthropicGen } from "./providers/anthropic.js";
import { generateAltText as googleGen } from "./providers/google.js";
import { generateAltText as ollamaGen } from "./providers/ollama.js";

const DEFAULT_PROMPT =
  "You are generating alt text for an image posted on social media. " +
  "Priority: if the image contains visible text (memes, screenshots, signs, captions), " +
  "transcribe ALL of that text verbatim. If there is no text, write a concise, " +
  "vivid description of the image suitable for a screen reader. " +
  "Output only the alt text itself — no preamble, no quotes, no markdown. " +
  "Keep it under 1000 characters.";

const DEFAULTS = {
  provider: "openai",
  prompt: DEFAULT_PROMPT,
  attribution: false,
  openai: { apiKey: "", model: "gpt-5.4-nano" },
  anthropic: { apiKey: "", model: "claude-haiku-4-5" },
  google: { apiKey: "", model: "gemini-3.1-flash-lite-preview" },
  ollama: { endpoint: "http://localhost:11434", model: "gemma4:e2b" },
};

function activeModel(cfg) {
  switch (cfg.provider) {
    case "openai": return cfg.openai?.model || DEFAULTS.openai.model;
    case "anthropic": return cfg.anthropic?.model || DEFAULTS.anthropic.model;
    case "google": return cfg.google?.model || DEFAULTS.google.model;
    case "ollama": return cfg.ollama?.model || DEFAULTS.ollama.model;
    default: return cfg.provider;
  }
}

async function getConfig() {
  const stored = await chrome.storage.local.get("autoalt_config");
  return { ...DEFAULTS, ...(stored.autoalt_config || {}) };
}

async function setConfig(patch) {
  const current = await getConfig();
  const merged = { ...current, ...patch };
  await chrome.storage.local.set({ autoalt_config: merged });
  return merged;
}

async function generate({ imageBase64, mimeType }) {
  const cfg = await getConfig();
  const prompt = cfg.prompt || DEFAULT_PROMPT;
  let text;
  switch (cfg.provider) {
    case "openai":
      text = await openaiGen({
        apiKey: cfg.openai.apiKey,
        model: cfg.openai.model,
        prompt,
        imageBase64,
        mimeType,
      });
      break;
    case "anthropic":
      text = await anthropicGen({
        apiKey: cfg.anthropic.apiKey,
        model: cfg.anthropic.model,
        prompt,
        imageBase64,
        mimeType,
      });
      break;
    case "google":
      text = await googleGen({
        apiKey: cfg.google.apiKey,
        model: cfg.google.model,
        prompt,
        imageBase64,
        mimeType,
      });
      break;
    case "ollama":
      text = await ollamaGen({
        endpoint: cfg.ollama.endpoint,
        model: cfg.ollama.model,
        prompt,
        imageBase64,
      });
      break;
    default:
      throw new Error(`Unknown provider: ${cfg.provider}`);
  }
  if (cfg.attribution) {
    text = `${text}\n\n[This alt text added by ${activeModel(cfg)} AI]`;
  }
  return text;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "AUTOALT_GENERATE") {
    generate(msg.payload)
      .then((text) => sendResponse({ ok: true, text }))
      .catch((err) => sendResponse({ ok: false, error: String(err?.message || err) }));
    return true;
  }
  if (msg?.type === "AUTOALT_GET_CONFIG") {
    getConfig()
      .then((cfg) => sendResponse({ ok: true, config: cfg }))
      .catch((err) => sendResponse({ ok: false, error: String(err?.message || err) }));
    return true;
  }
  if (msg?.type === "AUTOALT_SET_CONFIG") {
    setConfig(msg.patch)
      .then((cfg) => sendResponse({ ok: true, config: cfg }))
      .catch((err) => sendResponse({ ok: false, error: String(err?.message || err) }));
    return true;
  }
  return false;
});

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === "install") {
    await setConfig({});
    chrome.runtime.openOptionsPage?.();
  }
});
