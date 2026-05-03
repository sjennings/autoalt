export async function generateAltText({ endpoint, model, prompt, imageBase64 }) {
  const base = (endpoint || "http://localhost:11434").replace(/\/+$/, "");
  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model || "gemma4:e2b",
      stream: false,
      messages: [
        {
          role: "user",
          content: prompt,
          images: [imageBase64],
        },
      ],
      options: { temperature: 0.2 },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Ollama ${res.status}: ${body.slice(0, 400)}`);
  }
  const json = await res.json();
  const text = json?.message?.content?.trim();
  if (!text) throw new Error("Ollama returned no content. Is the model installed?");
  return text;
}
