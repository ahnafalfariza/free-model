import { NextResponse } from "next/server";

export const revalidate = 3600; // re-fetch every hour

export interface ModelData {
  id: string;
  name: string;
  description: string;
  contextLength: number;
  modality: string;
  inputModalities: string[];
  provider: string;
  providerDisplay: string;
  providerUrl: string;
  openRouterUrl: string;
  createdAt: number;
}

const PROVIDER_MAP: Record<string, { display: string; url: string }> = {
  google: { display: "Google", url: "https://ai.google.dev" },
  "meta-llama": { display: "Meta", url: "https://llama.meta.com" },
  mistralai: { display: "Mistral AI", url: "https://mistral.ai" },
  qwen: { display: "Qwen / Alibaba", url: "https://qwenlm.github.io" },
  deepseek: { display: "DeepSeek", url: "https://www.deepseek.com" },
  anthropic: { display: "Anthropic", url: "https://anthropic.com" },
  openai: { display: "OpenAI", url: "https://openai.com" },
  cohere: { display: "Cohere", url: "https://cohere.com" },
  nvidia: { display: "NVIDIA", url: "https://developer.nvidia.com/ai" },
  microsoft: { display: "Microsoft", url: "https://azure.microsoft.com/en-us/products/ai-services/" },
  "x-ai": { display: "xAI", url: "https://x.ai" },
  amazon: { display: "Amazon", url: "https://aws.amazon.com/bedrock/" },
  huggingfaceh4: { display: "HuggingFace", url: "https://huggingface.co" },
  nousresearch: { display: "Nous Research", url: "https://nousresearch.com" },
  openchat: { display: "OpenChat", url: "https://openchat.team" },
  openrouter: { display: "OpenRouter", url: "https://openrouter.ai" },
  "01-ai": { display: "01.AI", url: "https://www.01.ai" },
  "perplexity": { display: "Perplexity", url: "https://www.perplexity.ai" },
  moonshotai: { display: "Moonshot AI", url: "https://moonshot.cn" },
  baidu: { display: "Baidu", url: "https://cloud.baidu.com" },
  "z-ai": { display: "Z.AI", url: "https://z.ai" },
  tencent: { display: "Tencent", url: "https://cloud.tencent.com" },
  bytedance: { display: "ByteDance", url: "https://www.volcengine.com" },
  "arcee-ai": { display: "Arcee AI", url: "https://arcee.ai" },
  "liquid": { display: "Liquid AI", url: "https://liquid.ai" },
  "gryphe": { display: "Gryphe", url: "https://openrouter.ai" },
  "pygmalionai": { display: "PygmalionAI", url: "https://pygmalion.chat" },
  "rwkv": { display: "RWKV", url: "https://www.rwkv.com" },
  "snowflake": { display: "Snowflake", url: "https://www.snowflake.com" },
  "sophosympatheia": { display: "Sophosympatheia", url: "https://openrouter.ai" },
  "teknium": { display: "Teknium", url: "https://openrouter.ai" },
  "undi95": { display: "Undi95", url: "https://openrouter.ai" },
  "thedrummer": { display: "TheDrummer", url: "https://openrouter.ai" },
  "sao10k": { display: "Sao10k", url: "https://openrouter.ai" },
};

function getProvider(id: string) {
  const slug = id.split("/")[0];
  const entry = PROVIDER_MAP[slug];
  return {
    provider: slug,
    providerDisplay: entry?.display ?? slug,
    providerUrl: entry?.url ?? `https://openrouter.ai/${id.replace(":free", "")}`,
  };
}

function describeModality(inputModalities: string[]): string {
  if (inputModalities.includes("image") && inputModalities.includes("video")) return "Multimodal (Vision + Video)";
  if (inputModalities.includes("image")) return "Multimodal (Vision)";
  if (inputModalities.includes("audio")) return "Multimodal (Audio)";
  return "Text";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFree(model: any): boolean {
  const p = model.pricing;
  if (!p) return false;
  // truly free: both prompt and completion are "0"
  if (p.prompt === "0" && p.completion === "0") return true;
  // OR model ID has :free suffix
  if (typeof model.id === "string" && model.id.endsWith(":free")) return true;
  return false;
}

export async function GET() {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "free-ai-models/1.0" },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch models" }, { status: 502 });
    }

    const json = await res.json();
    const raw: ModelData[] = json.data
      .filter(isFree)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((m: any): ModelData => {
        const { provider, providerDisplay, providerUrl } = getProvider(m.id);
        const cleanId = m.id.replace(":free", "");
        return {
          id: m.id,
          name: m.name?.replace(" (free)", "").replace(":free", "").trim() ?? m.id,
          description: m.description ?? "",
          contextLength: m.context_length ?? 0,
          modality: describeModality(m.architecture?.input_modalities ?? ["text"]),
          inputModalities: m.architecture?.input_modalities ?? ["text"],
          provider,
          providerDisplay,
          providerUrl,
          openRouterUrl: `https://openrouter.ai/${cleanId}`,
          createdAt: m.created ?? 0,
        };
      })
      .sort((a: ModelData, b: ModelData) => b.createdAt - a.createdAt);

    return NextResponse.json({ models: raw, count: raw.length, updatedAt: Date.now() });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
