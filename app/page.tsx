import type { ModelEntry, ModelSource } from "@/lib/model-types";
import { SOURCE_META } from "@/lib/model-types";
import { STATIC_MODELS } from "@/lib/static-models";
import ModelsGrid from "@/components/ModelsGrid";

export const revalidate = 3600;

async function getOpenRouterModels(): Promise<ModelEntry[]> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "free-ai-models/1.0" },
    });
    const json = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function isFree(m: any) {
      const p = m.pricing;
      if (!p) return false;
      if (p.prompt === "0" && p.completion === "0") return true;
      if (typeof m.id === "string" && m.id.endsWith(":free")) return true;
      return false;
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
      perplexity: { display: "Perplexity", url: "https://www.perplexity.ai" },
      moonshotai: { display: "Moonshot AI", url: "https://moonshot.cn" },
      "z-ai": { display: "Z.AI", url: "https://z.ai" },
      "arcee-ai": { display: "Arcee AI", url: "https://arcee.ai" },
      liquid: { display: "Liquid AI", url: "https://liquid.ai" },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return json.data.filter(isFree).map((m: any): ModelEntry => {
      const providerSlug = m.id.split("/")[0];
      const entry = PROVIDER_MAP[providerSlug];
      const cleanId = m.id.replace(":free", "");
      const inputs: string[] = m.architecture?.input_modalities ?? ["text"];
      let modality = "Text";
      if (inputs.includes("video")) modality = "Multimodal (Vision + Video)";
      else if (inputs.includes("image")) modality = "Multimodal (Vision)";
      else if (inputs.includes("audio")) modality = "Multimodal (Audio)";

      return {
        id: m.id,
        name: (m.name ?? m.id).replace(" (free)", "").replace(":free", "").trim(),
        description: m.description ?? "",
        contextLength: m.context_length ?? 0,
        modality,
        inputModalities: inputs,
        provider: providerSlug,
        providerDisplay: entry?.display ?? providerSlug,
        providerUrl: entry?.url ?? `https://openrouter.ai/${cleanId}`,
        modelUrl: `https://openrouter.ai/${cleanId}`,
        source: "openrouter" as ModelSource,
        requiresKey: false,
        signupUrl: "https://openrouter.ai",
        createdAt: m.created ?? 0,
      } as ModelEntry;
    });
  } catch {
    return [];
  }
}

const TICKER_ITEMS = [
  "100% FREE",
  "NO KEY FOR OPENROUTER",
  "GROQ · GOOGLE · CEREBRAS",
  "NVIDIA · GITHUB · MISTRAL",
  "UPDATED HOURLY",
  "10 PROVIDERS",
  "TEXT · VISION · AUDIO",
];

export default async function HomePage() {
  const [orModels] = await Promise.all([getOpenRouterModels()]);
  const allModels: ModelEntry[] = [...orModels, ...STATIC_MODELS];

  const total = allModels.length;
  const noKeyCount = allModels.filter((m) => !m.requiresKey).length;
  const multimodalCount = allModels.filter((m) => m.modality !== "Text").length;
  const providerCount = new Set(allModels.map((m) => m.source)).size;

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: "#FFFBF0",
          borderBottom: "2.5px solid #0A0A0A",
          boxShadow: "0 3px 0 #0A0A0A",
        }}
      >
        <a href="/" className="flex items-center gap-2 no-underline">
          <span
            className="text-xl font-black tracking-tighter text-[#0A0A0A] border-2 border-[#0A0A0A] px-2 py-0.5"
            style={{ boxShadow: "2px 2px 0 #0A0A0A", background: "#FFE500" }}
          >
            FREE
          </span>
          <span className="text-xl font-black tracking-tight text-[#0A0A0A] uppercase">
            Models
          </span>
        </a>
        <nav className="flex items-center gap-3">
          <a
            href="https://openrouter.ai/models"
            target="_blank"
            rel="noopener noreferrer"
            className="brutal-btn text-xs px-3 py-1.5 bg-white text-[#0A0A0A] no-underline"
          >
            OpenRouter ↗
          </a>
        </nav>
      </header>

      {/* ── Ticker ── */}
      <div
        className="overflow-hidden py-2"
        style={{ borderBottom: "2.5px solid #0A0A0A", background: "#0A0A0A" }}
      >
        <div className="marquee-track select-none">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-4 px-6 text-xs font-black uppercase tracking-widest text-[#FFE500] whitespace-nowrap"
            >
              {item}
              <span className="text-[#FFE500]/40">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="px-6 pt-16 pb-10 border-b-2 border-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-black uppercase tracking-widest border-2 border-[#0A0A0A] px-3 py-1 bg-[#00D166]"
                style={{ boxShadow: "2px 2px 0 #0A0A0A" }}
              >
                ● Live
              </span>
              <span className="font-mono text-xs text-[#555]">
                OpenRouter API + 9 curated providers
              </span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black uppercase leading-none tracking-tighter text-[#0A0A0A]">
              Free AI
              <br />
              <span
                style={{ WebkitTextStroke: "2.5px #0A0A0A", color: "#FFE500" }}
              >
                Models.
              </span>
            </h1>
            <p className="text-base sm:text-lg font-medium text-[#333] max-w-xl leading-relaxed">
              Every AI model you can use for free — across OpenRouter, Groq, Google AI Studio, Cerebras, NVIDIA NIM, and more.
              Filter by access type, source, and modality.
            </p>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-0 mt-10 border-2 border-[#0A0A0A]"
            style={{ boxShadow: "4px 4px 0 #0A0A0A" }}
          >
            {[
              { label: "Total Models", value: total, bg: "#FFE500" },
              { label: "No Key Needed", value: noKeyCount, bg: "white" },
              { label: "Multimodal", value: multimodalCount, bg: "white" },
              { label: "Providers", value: providerCount, bg: "white" },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col items-center justify-center py-6 px-4 ${i < 3 ? "sm:border-r-2 sm:border-[#0A0A0A]" : ""} ${i % 2 === 0 ? "max-sm:border-r-2 max-sm:border-[#0A0A0A]" : ""} ${i < 2 ? "border-b-2 sm:border-b-0 border-[#0A0A0A]" : ""}`}
                style={{ background: s.bg }}
              >
                <span className="text-3xl sm:text-4xl font-black text-[#0A0A0A] leading-none">{s.value}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#555] mt-1">{s.label}</span>
              </div>
            ))}
          </div>

          {/* provider legend */}
          <div className="flex flex-wrap gap-2 mt-5">
            {(Object.entries(SOURCE_META) as [ModelSource, typeof SOURCE_META[ModelSource]][]).map(([key, meta]) => (
              <span
                key={key}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide border border-[#0A0A0A] px-2 py-1 bg-white"
              >
                <span className="w-2 h-2 rounded-full border border-[#0A0A0A]" style={{ background: meta.color }} />
                {meta.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Unified Models Grid ── */}
      <main className="flex-1 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <ModelsGrid models={allModels} />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-6 mt-4"
        style={{ borderTop: "2.5px solid #0A0A0A", background: "#0A0A0A" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-xs text-[#FFE500]">
            Data:{" "}
            <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline font-black">OpenRouter</a>
            {" · "}
            <a href="https://github.com/cheahjs/free-llm-api-resources" target="_blank" rel="noopener noreferrer" className="underline font-black">cheahjs</a>
            {" · "}
            <a href="https://github.com/mnfst/awesome-free-llm-apis" target="_blank" rel="noopener noreferrer" className="underline font-black">mnfst</a>
            {" · "}
            <a href="https://freellm.net" target="_blank" rel="noopener noreferrer" className="underline font-black">freellm.net</a>
            . OpenRouter updated hourly.
          </p>
          <p className="font-mono text-xs text-[#555]">free-model-drab.vercel.app</p>
        </div>
      </footer>
    </div>
  );
}
