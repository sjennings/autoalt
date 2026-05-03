// AutoAlt — Bluesky content script
// Watches the composer for image uploads and injects a "✨ Auto" button
// that generates alt text via the configured BYOK provider.

(() => {
  const BTN_CLASS = "autoalt-btn";
  const BTN_PROCESSED_ATTR = "data-autoalt-processed";
  const STATUS_CLASS = "autoalt-status";

  const log = (...a) => console.debug("[AutoAlt]", ...a);

  // --- React-controlled input value setter ---
  function setReactValue(el, value) {
    const proto =
      el.tagName === "TEXTAREA"
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (setter) setter.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // --- DOM helpers ---
  function findComposer() {
    return (
      document.querySelector('[data-testid="composePostView"]') ||
      document.querySelector('div[role="dialog"]') ||
      document.body
    );
  }

  // Find image preview <img> elements inside the composer.
  function findImagePreviews(root) {
    const imgs = Array.from(root.querySelectorAll("img"));
    return imgs.filter((img) => {
      const src = img.src || "";
      if (!src.startsWith("blob:") && !src.startsWith("data:")) return false;
      // Skip avatars / link cards / tiny images.
      const r = img.getBoundingClientRect();
      if (r.width < 60 || r.height < 60) return false;
      return true;
    });
  }

  // For an image preview, find the closest container that also holds the
  // +ALT button (or inline alt textarea, in newer Bluesky builds).
  function findImageContainer(img) {
    let node = img;
    for (let i = 0; i < 8 && node; i++) {
      node = node.parentElement;
      if (!node) break;
      // Has +ALT button or inline alt textarea
      if (
        findAltButton(node) ||
        node.querySelector('textarea[placeholder*="alt" i]')
      ) {
        return node;
      }
    }
    return img.parentElement;
  }

  function findAltButton(container) {
    if (!container) return null;
    const buttons = container.querySelectorAll('button, [role="button"]');
    for (const b of buttons) {
      const txt = (b.innerText || b.textContent || "").trim().toUpperCase();
      const aria = (b.getAttribute("aria-label") || "").toUpperCase();
      if (
        txt === "ALT" ||
        txt === "+ALT" ||
        txt === "+ ALT" ||
        aria.includes("ALT TEXT") ||
        aria.includes("ADD ALT")
      ) {
        return b;
      }
    }
    return null;
  }

  function findAltTextarea(container) {
    if (!container) return null;
    return (
      container.querySelector('textarea[placeholder*="alt" i]') ||
      container.querySelector("textarea[aria-label*='alt' i]") ||
      null
    );
  }

  // After clicking +ALT, an open dialog appears. Find its textarea.
  function findOpenDialogTextarea() {
    const dialogs = document.querySelectorAll('[role="dialog"]');
    for (const d of dialogs) {
      const t = d.querySelector("textarea");
      if (t) return { dialog: d, textarea: t };
    }
    return null;
  }

  function findDialogConfirmButton(dialog) {
    const buttons = dialog.querySelectorAll('button, [role="button"]');
    for (const b of buttons) {
      const t = (b.innerText || b.textContent || "").trim().toUpperCase();
      if (t === "DONE" || t === "SAVE" || t === "OK" || t === "CONFIRM") return b;
    }
    return null;
  }

  // --- Image fetching ---
  async function imageToBase64(img) {
    const src = img.src;
    const resp = await fetch(src);
    const blob = await resp.blob();
    const mimeType = blob.type || "image/jpeg";
    const buf = await blob.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(
        null,
        bytes.subarray(i, i + chunk),
      );
    }
    const base64 = btoa(binary);
    return { base64, mimeType };
  }

  // --- Status toast ---
  function showStatus(button, text, kind = "info") {
    let s = button.querySelector(`.${STATUS_CLASS}`);
    if (!s) {
      s = document.createElement("span");
      s.className = STATUS_CLASS;
      button.appendChild(s);
    }
    s.dataset.kind = kind;
    s.textContent = text;
  }

  function clearStatus(button) {
    const s = button.querySelector(`.${STATUS_CLASS}`);
    if (s) s.remove();
  }

  // --- Wait helper ---
  function waitFor(predicate, { timeout = 5000, interval = 100 } = {}) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        let result;
        try {
          result = predicate();
        } catch (e) {
          // ignore
        }
        if (result) return resolve(result);
        if (Date.now() - start > timeout) {
          return reject(new Error("Timed out waiting for element."));
        }
        setTimeout(tick, interval);
      };
      tick();
    });
  }

  // --- Core action ---
  async function fillAltText(container, text) {
    // Case 1: an inline alt textarea is already visible.
    const inline = findAltTextarea(container);
    if (inline) {
      setReactValue(inline, text);
      inline.focus();
      return;
    }
    // Case 2: open the +ALT modal, wait for textarea, fill, save.
    const altButton = findAltButton(container);
    if (!altButton) {
      throw new Error(
        "Couldn't find the +ALT button. Bluesky may have changed its UI.",
      );
    }
    altButton.click();
    const { dialog, textarea } = await waitFor(
      () => findOpenDialogTextarea(),
      { timeout: 4000 },
    );
    setReactValue(textarea, text);
    textarea.focus();
    // Give React a tick to register the change before clicking Done.
    await new Promise((r) => setTimeout(r, 80));
    const done = findDialogConfirmButton(dialog);
    if (done) done.click();
  }

  function isExtensionContextLive() {
    try {
      return Boolean(chrome?.runtime?.id);
    } catch {
      return false;
    }
  }

  async function handleClick(button, img, container) {
    if (button.disabled) return;
    button.disabled = true;
    clearStatus(button);
    showStatus(button, "…");
    try {
      if (!isExtensionContextLive()) {
        throw new Error(
          "AutoAlt was reloaded — refresh this Bluesky tab to continue.",
        );
      }
      const { base64, mimeType } = await imageToBase64(img);
      const resp = await chrome.runtime.sendMessage({
        type: "AUTOALT_GENERATE",
        payload: { imageBase64: base64, mimeType },
      });
      if (!resp?.ok) throw new Error(resp?.error || "Unknown error");
      await fillAltText(container, resp.text);
      showStatus(button, "✓");
      setTimeout(() => clearStatus(button), 1500);
    } catch (err) {
      console.error("[AutoAlt]", err);
      showStatus(button, "!", "error");
      button.title = `AutoAlt error: ${err.message || err}`;
      setTimeout(() => clearStatus(button), 4000);
    } finally {
      button.disabled = false;
    }
  }

  // --- Button injection ---
  // Anchor strategy: place our button as a sibling of Bluesky's +ALT button.
  // That parent is already a positioning context, so we don't have to mutate
  // any styles (which previously broke image rendering on some Bluesky builds).
  function injectButton(img) {
    if (img.getAttribute(BTN_PROCESSED_ATTR)) return;
    const container = findImageContainer(img);
    if (!container) return;
    if (container.querySelector(`.${BTN_CLASS}`)) {
      img.setAttribute(BTN_PROCESSED_ATTR, "1");
      return;
    }

    const altButton = findAltButton(container);
    // Anchor to the +ALT button's parent if we have it; otherwise fall back
    // to the container. Either way, do NOT mutate parent styles.
    const anchor = altButton?.parentElement || container;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = BTN_CLASS;
    btn.title = "AutoAlt — generate alt text";
    btn.innerHTML = '<span class="autoalt-glyph">✨</span><span class="autoalt-label">Auto</span>';
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleClick(btn, img, container);
    });

    // If anchored next to +ALT, place inline beside it (top-left cluster,
    // away from Bluesky's edit/X buttons in the top-right).
    if (altButton && anchor === altButton.parentElement) {
      btn.classList.add("autoalt-btn--inline");
      altButton.insertAdjacentElement("afterend", btn);
    } else {
      anchor.appendChild(btn);
    }

    img.setAttribute(BTN_PROCESSED_ATTR, "1");
    log("Injected button for image", img.src.slice(0, 40));
  }

  function scan() {
    const composer = findComposer();
    const imgs = findImagePreviews(composer);
    for (const img of imgs) injectButton(img);
  }

  const observer = new MutationObserver(() => {
    // Debounce via rAF — DOM mutations during typing fire constantly.
    if (observer._raf) return;
    observer._raf = requestAnimationFrame(() => {
      observer._raf = null;
      scan();
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
  scan();
  log("AutoAlt content script ready.");
})();
