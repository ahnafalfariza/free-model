import type { ModelEntry, ModelSource } from "./model-types";
import { SOURCE_META } from "./model-types";
import { STATIC_MODELS } from "./static-models";

// Map data.json provider name → our ModelSource
const PROVIDER_NAME_MAP: Record<string, ModelSource> = {
  "Groq": "groq",
  "Google Gemini": "google",
  "Cerebras": "cerebras",
  "NVIDIA NIM": "nvidia",
  "GitHub Models": "github",
  "Mistral AI": "mistral",
  "Cohere": "cohere",
  "Cloudflare Workers AI": "cloudflare",
  "Hugging Face": "huggingface",
  "OVHcloud AI Endpoints": "ovhcloud",
  "SiliconFlow": "siliconflow",
  "LLM7.io": "llm7",
  "Kilo Code": "kilo",
  "Ollama Cloud": "ollama",
  "Z AI (Zhipu AI)": "zai",
  "ModelScope": "modelscope",
};

// Providers to skip (OpenRouter handled separately; others are trial-only)
const SKIP_PROVIDERS = new Set([
  "OpenRouter", "AI21 Labs", "DeepSeek", "xAI",
  "Alibaba Cloud Model Studio", "Aion Labs", "Nebius", "Nscale",
]);

// Providers that don't require a key at all
const NO_KEY_PROVIDERS = new Set<ModelSource>(["ovhcloud", "llm7"]);

function parseContextLength(s: string): number {
  if (!s || s === "—" || s === "-") return 0;
  // e.g. "8K on free" → take first number+unit
  const m = s.match(/([\d.]+)\s*([KMG]?)/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const unit = m[2].toUpperCase();
  if (unit === "G") return Math.round(n * 1e9);
  if (unit === "M") return Math.round(n * 1e6);
  if (unit === "K") return Math.round(n * 1000);
  return Math.round(n);
}

function parseModality(s: string): string {
  const l = (s ?? "").toLowerCase();
  if (l.includes("video")) return "Multimodal (Vision + Video)";
  if (l.includes("audio") && l.includes("text") && (l.includes("image") || l.includes("vision"))) return "Multimodal (Vision)";
  if (l.includes("audio") && !l.includes("image") && !l.includes("vision")) return "Multimodal (Audio)";
  if (l.includes("image") || l.includes("vision")) return "Multimodal (Vision)";
  return "Text";
}

interface MnfstModel {
  id: string;
  name: string;
  context: string;
  maxOutput: string;
  modality: string;
  rateLimit: string;
}

interface MnfstProvider {
  name: string;
  category: string;
  url: string;
  baseUrl?: string;
  description?: string;
  footnoteRef?: string | null;
  models: MnfstModel[];
}

interface MnfstData {
  lastUpdated: string;
  providers: MnfstProvider[];
}

export async function fetchDynamicProviders(): Promise<ModelEntry[]> {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/mnfst/awesome-free-llm-apis/main/data.json",
      { next: { revalidate: 3600 }, headers: { "User-Agent": "free-model/1.0" } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data: MnfstData = await res.json();
    const all: ModelEntry[] = [];

    for (const provider of data.providers) {
      if (SKIP_PROVIDERS.has(provider.name)) continue;

      const source = PROVIDER_NAME_MAP[provider.name];
      if (!source) continue;

      const meta = SOURCE_META[source];
      const requiresKey = !NO_KEY_PROVIDERS.has(source);

      for (const m of provider.models ?? []) {
        const name = m.name || m.id;
        if (!name) continue;

        all.push({
          id: `${source}/${m.id || name.toLowerCase().replace(/\s+/g, "-")}`,
          name,
          description: provider.description ?? "",
          contextLength: parseContextLength(m.context),
          modality: parseModality(m.modality),
          provider: source,
          providerDisplay: meta.label,
          providerUrl: meta.providerUrl,
          modelUrl: provider.url,
          source,
          requiresKey,
          signupUrl: meta.signupUrl,
          rateLimits: m.rateLimit || undefined,
          createdAt: 0,
        });
      }
    }

    return all;
  } catch (err) {
    console.error("[fetchDynamicProviders] data.json fetch failed, falling back to static:", err);
    return STATIC_MODELS;
  }
}
