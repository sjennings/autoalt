# AutoAlt — Privacy Policy

**Effective date:** 2026-05-03
**Maintainer:** Scott Jennings (sjennings@brokentoys.org)
**Source code:** https://github.com/sjennings/autoalt

This document describes exactly what data AutoAlt handles, where it goes, and why. The extension is open source — every claim below can be verified by reading the code.

## TL;DR

- AutoAlt does not collect, store, or transmit any data to its developer.
- The only data AutoAlt sends anywhere is the image you click ✨ Auto on, plus your prompt, plus your API key — sent directly to the AI provider **you** chose and configured. There is no middleman.
- API keys are stored on your device only, in Chrome's `chrome.storage.local`. They never leave your browser except in the authorization header on requests to your chosen provider.
- No analytics. No telemetry. No tracking. No advertising. No third parties besides the AI provider you yourself selected.

## What data AutoAlt handles

### Stored on your device only

Saved in `chrome.storage.local` (a Chrome-managed local key/value store scoped to this extension):

- The AI provider you selected (OpenAI, Anthropic, Google, or Ollama)
- The API key (or, for Ollama, the local endpoint URL) you entered
- The model name you selected (or left blank to use the default)
- The prompt text you customized (or left as the default)
- Your "I choose violence." attribution preference (default: off)

These values never leave your device except as components of API requests to the provider you yourself configured.

### Sent off-device only when you click ✨ Auto

When — and only when — you click the ✨ Auto button on an image preview in the Bluesky composer, AutoAlt sends the following directly to the AI provider you selected in Settings:

- The image's bytes (base64-encoded)
- Your configured prompt text
- Your API key (in the authorization header), or no key for local Ollama
- Standard HTTP request metadata your browser would attach to any web request

This data goes to one of:

- `api.openai.com` (if you chose OpenAI)
- `api.anthropic.com` (if you chose Anthropic)
- `generativelanguage.googleapis.com` (if you chose Google Gemini)
- `http://localhost:11434` or your custom Ollama endpoint (if you chose Ollama)

It does not go anywhere else. AutoAlt makes no other network requests of any kind.

### Sent to AutoAlt's developer

**Nothing.** AutoAlt has no backend, no analytics service, no error reporting service, no crash reporting service, no update server (Chrome handles updates through the Chrome Web Store independently of the extension's code). The extension's developer cannot see how you use the extension, what images you process, what prompts you write, or whether you have it installed.

## What the AI providers do with your data

When AutoAlt sends an image to OpenAI, Anthropic, Google, or your local Ollama instance, your relationship at that point is between you and that provider, governed by their terms of service and privacy policy, not by AutoAlt. You should review the privacy policy of whichever provider you choose:

- OpenAI: https://openai.com/policies/privacy-policy/
- Anthropic: https://www.anthropic.com/legal/privacy
- Google AI: https://policies.google.com/privacy
- Ollama (local): runs on your own machine, no third party

Most cloud AI providers store API request data for some period for abuse detection; some allow you to opt out of training data inclusion in your account settings. AutoAlt does not control or receive notice of these provider-side practices.

## Permissions AutoAlt requests, and why

| Permission | Why |
|---|---|
| `storage` | To save your API key, model, prompt, and provider selection on your device. |
| Host permission for `https://api.openai.com/*` | To send images to OpenAI when you've selected OpenAI. |
| Host permission for `https://api.anthropic.com/*` | To send images to Anthropic when you've selected Anthropic. |
| Host permission for `https://generativelanguage.googleapis.com/*` | To send images to Google when you've selected Google. |
| Host permission for `http://localhost/*` and `http://127.0.0.1/*` | To send images to a local Ollama server, only when you've selected Ollama. No traffic leaves your machine in this case. |
| Content script on `https://bsky.app/*` | To inject the ✨ Auto button into the Bluesky composer and write the generated text into the alt-text field. |

AutoAlt does not request, and the code does not use, the `tabs`, `cookies`, `webRequest`, `history`, `downloads`, or any other data-access permissions.

## Data sale, ads, and unrelated uses

- AutoAlt does not sell or transfer user data to any third party.
- AutoAlt does not use or transfer user data for advertising.
- AutoAlt does not use or transfer user data to determine creditworthiness or for lending purposes.
- AutoAlt does not use or transfer user data for any purpose unrelated to its single purpose: generating alt text for images posted on bsky.app.

## Children

AutoAlt is not directed at children. It does not knowingly collect data from anyone (children or otherwise — see above).

## Changes to this policy

If the data-handling behavior of AutoAlt changes, this policy will be updated, the effective date at the top will change, and the change will be reflected in the source repository's commit history. Material changes will be noted in the extension's release notes on the Chrome Web Store listing.

## Contact

Privacy questions, concerns, or corrections: **sjennings@brokentoys.org**.

You can also open an issue at https://github.com/sjennings/autoalt/issues for anything you'd be comfortable discussing publicly.
