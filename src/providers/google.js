export async function generateAltText({ apiKey, model, prompt, imageBase64, mimeType }) {
  if (!apiKey) throw new Error("Google API key is not set.");
  const m = model || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: imageBase64 } },
          ],
        },
      ],
      generationConfig: { maxOutputTokens: 600, temperature: 0.2 },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google ${res.status}: ${body.slice(0, 400)}`);
  }
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts
    ?.map((p) => p.text)
    .filter(Boolean)
    .join("")
    .trim();
  if (!text) throw new Error("Google returned no text content.");
  return text;
}
