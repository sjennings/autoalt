# Chrome Web Store listing copy

This file contains the text to paste into the Chrome Web Store Developer Dashboard when creating the AutoAlt listing. It's reference material — not part of the extension package.

---

## Item name (max 75 chars)

```
AutoAlt - Alt Text for bsky.app
```

## Summary / short description (132 chars max)

```
Generate alt text for bsky.app images using your own AI key (OpenAI, Anthropic, Google, or local Ollama). Free with Gemini.
```

## Detailed description

```
AutoAlt makes it one-click easy to write good alt text for the images you post on bsky.app — using AI vision models you bring your own key for.

When you attach an image to a Bluesky post, a small ✨ Auto button appears next to Bluesky's own +ALT chip. Click it. A second or two later, the alt-text field is filled. The default prompt prioritizes transcribing any text visible in the image (memes, screenshots, signs, diagrams) and falls back to a short description if there's no text. You can edit the alt text afterward, and you can fully customize the prompt in Settings.

✦ FOUR PROVIDERS, BRING YOUR OWN KEY ✦

• Google Gemini (gemini-3.1-flash-lite-preview by default) — recommended for most users; the free tier easily covers normal social-media posting volume
• OpenAI (gpt-5.4-nano by default)
• Anthropic Claude (claude-haiku-4-5 by default) — typically the strongest at OCR on dense or hard-to-read images
• Ollama (gemma4:e2b by default) — fully local, runs on your own machine, no API key needed; slower and lower quality than the cloud options, but private and free

You can change the model name for any provider in Settings.

✦ COSTS A FRACTION OF A CENT ✦

Generating alt text for one image costs roughly $0.0002–$0.003 on cloud providers — fractions of a cent. For most people, Google Gemini's free tier means it's effectively free.

✦ PRIVACY POSTURE ✦

• Your API keys are stored only on your device, in Chrome's local storage. They never reach the extension's developer — we have no backend.
• Images are sent ONLY to the AI provider you chose, directly from your browser. No middleman, no analytics, no telemetry, no tracking, no ads.
• Open source. Every claim above can be verified by reading the code: https://github.com/sjennings/autoalt

✦ HOW TO SET UP ✦

1. Click the AutoAlt toolbar icon → Settings
2. Pick your provider (Google's free tier is the easiest start)
3. Paste your API key
4. Click Save
5. Open bsky.app, attach an image to a post, click the ✨ Auto button

For Ollama users, see the project README for the few extra steps needed to allow Chrome extensions to talk to your local Ollama server.

✦ ACCESSIBILITY ✦

Alt text isn't decoration — it's how blind and low-vision Bluesky users actually read images. Posting images without alt text excludes those users entirely. AutoAlt exists to lower the friction so there's no excuse to skip it. Generated alt text is a starting point you can edit, not a substitute for thinking about your audience.

✦ OPEN SOURCE ✦

MIT licensed. Source, issue tracker, and full privacy policy at https://github.com/sjennings/autoalt
```

## Category

```
Productivity
```

(Accessibility would also be defensible — pick whichever you prefer.)

## Language

```
English
```

---

## Privacy tab — single purpose statement

```
Generates alt text descriptions for images posted to bsky.app, using a user-supplied AI provider API key.
```

## Privacy tab — permission justifications (paste one per permission)

**`storage`**
```
Stores user-provided AI provider API key, model preferences, and prompt customization in chrome.storage.local. No data leaves the user's machine through this permission.
```

**Host permission `https://api.openai.com/*`**
```
Sends the user's image and configured prompt to OpenAI's API to generate alt text, only when the user has selected OpenAI as their provider and entered an OpenAI API key. The user's API key is sent in the authorization header.
```

**Host permission `https://api.anthropic.com/*`**
```
Sends the user's image and configured prompt to Anthropic's API to generate alt text, only when the user has selected Anthropic as their provider and entered an Anthropic API key. The user's API key is sent in the authorization header.
```

**Host permission `https://generativelanguage.googleapis.com/*`**
```
Sends the user's image and configured prompt to Google's Gemini API to generate alt text, only when the user has selected Google as their provider and entered a Google API key.
```

**Host permission `http://localhost/*` and `http://127.0.0.1/*`**
```
Sends the user's image and configured prompt to a locally-running Ollama server (a free open-source AI runner — https://ollama.com), only when the user has explicitly selected Ollama as their provider in Settings. No data leaves the user's machine in this configuration. This permission is required because Chrome extensions cannot reach localhost without explicit declaration.
```

**Content script on `https://bsky.app/*`**
```
Injects the ✨ Auto button into the Bluesky post composer next to the existing +ALT chip, and writes the generated alt text into Bluesky's alt-text field after the user clicks the button.
```

## Privacy tab — data usage disclosures

Check honestly:
- Personally identifiable info: **No**
- Health info: **No**
- Financial / payment info: **No**
- Authentication info: **Yes** — disclose: "User provides their own AI provider API key, stored locally on their device, transmitted only to the provider they configured."
- Personal communications: **No**
- Location: **No**
- Web history: **No**
- User activity: **No**
- Website content: **No** (we do not extract page content; we only inject UI and read the image the user themselves uploaded)

Certifications (must check all three):
- ✅ I do not sell or transfer user data to third parties, outside of the approved use cases
- ✅ I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- ✅ I do not use or transfer user data to determine creditworthiness or for lending purposes

## Privacy policy URL

After enabling GitHub Pages on the repo (Settings → Pages → Deploy from branch → main → / (root)), the URL will be:

```
https://sjennings.github.io/autoalt/PRIVACY
```

If you don't want to use Pages, the GitHub-rendered Markdown URL also works:

```
https://github.com/sjennings/autoalt/blob/main/PRIVACY.md
```

(GitHub Pages is preferred — it's a "real" hosted page rather than a code-hosting view, which Google reviewers tend to like better.)
