import type { ModelData } from "@/app/api/models/route";
import ModelsGrid from "@/components/ModelsGrid";
import ProviderCard from "@/components/ProviderCard";
import { FREE_PROVIDERS } from "@/lib/providers";

export const revalidate = 3600;

async function getModels(): Promise<{ models: ModelData[]; count: number; updatedAt: number }> {
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
    const models: ModelData[] = json.data.filter(isFree).map((m: any): ModelData => {
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
        openRouterUrl: `https://openrouter.ai/${cleanId}`,
        createdAt: m.created ?? 0,
      };
    }).sort((a: ModelData, b: ModelData) => b.createdAt - a.createdAt);

    return { models, count: models.length, updatedAt: Date.now() };
  } catch {
    return { models: [], count: 0, updatedAt: Date.now() };
  }
}

const TICKER_ITEMS = [
  "100% FREE",
  "NO API KEY REQUIRED",
  "REAL-TIME DATA",
  "POWERED BY OPENROUTER",
  "TEXT · VISION · AUDIO",
  "UPDATED HOURLY",
];

export default async function HomePage() {
  const { models, count } = await getModels();

  const multimodalCount = models.filter((m) => m.modality !== "Text").length;
  const providers = new Set(models.map((m) => m.provider)).size;
  const maxContext = models.reduce((max, m) => Math.max(max, m.contextLength), 0);

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
        style={{
          borderBottom: "2.5px solid #0A0A0A",
          background: "#0A0A0A",
        }}
      >
        <div className="marquee-track select-none">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-4 px-6 text-xs font-black uppercase tracking-widest text-[#FFE500] whitespace-nowrap">
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
              <span className="font-mono text-xs text-[#555]">via OpenRouter API</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black uppercase leading-none tracking-tighter text-[#0A0A0A]">
              Free AI
              <br />
              <span
                className="relative inline-block"
                style={{
                  WebkitTextStroke: "2.5px #0A0A0A",
                  color: "#FFE500",
                }}
              >
                Models.
              </span>
            </h1>
            <p className="text-base sm:text-lg font-medium text-[#333] max-w-xl leading-relaxed">
              Every AI model you can use right now — completely free.
              No credit card. No API key required for most.
              Updated hourly from{" "}
              <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-2 hover:text-[#FF4D00]">
                OpenRouter
              </a>.
            </p>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 mt-10 border-2 border-[#0A0A0A]" style={{ boxShadow: "4px 4px 0 #0A0A0A" }}>
            {[
              { label: "Free Models", value: count },
              { label: "Providers", value: providers },
              { label: "Multimodal", value: multimodalCount },
              { label: "Max Context", value: maxContext >= 1_000_000 ? `${(maxContext / 1_000_000).toFixed(0)}M` : `${Math.round(maxContext / 1_000)}K` },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col items-center justify-center py-6 px-4 ${i < 3 ? "border-r-2 border-[#0A0A0A]" : ""} ${i < 2 ? "max-sm:border-b-2 max-sm:border-[#0A0A0A]" : ""}`}
                style={{ background: i === 0 ? "#FFE500" : "white" }}
              >
                <span className="text-3xl sm:text-4xl font-black text-[#0A0A0A] leading-none">{s.value}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#555] mt-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Models Grid ── */}
      <main className="flex-1 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <ModelsGrid models={models} />
        </div>
      </main>

      {/* ── More Providers ── */}
      <section className="px-6 py-12 border-t-2 border-[#0A0A0A]" style={{ background: "#F0EEE6" }}>
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {/* section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span
                className="text-[10px] font-black uppercase tracking-widest border-2 border-[#0A0A0A] px-2 py-0.5 bg-[#FF4D00] text-white inline-block mb-3"
                style={{ boxShadow: "2px 2px 0 #0A0A0A" }}
              >
                More Sources
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter leading-none">
                More Free<br />Providers
              </h2>
              <p className="text-sm text-[#555] mt-2 max-w-lg">
                These providers aren&apos;t on OpenRouter but offer generous free tiers.
                Requires a free API key — no credit card needed.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-right shrink-0">
              <p className="font-mono text-xs text-[#555]">Sources:</p>
              <a href="https://github.com/cheahjs/free-llm-api-resources" target="_blank" rel="noopener noreferrer" className="font-mono text-xs font-bold underline hover:text-[#FF4D00]">cheahjs/free-llm-api-resources</a>
              <a href="https://github.com/mnfst/awesome-free-llm-apis" target="_blank" rel="noopener noreferrer" className="font-mono text-xs font-bold underline hover:text-[#FF4D00]">mnfst/awesome-free-llm-apis</a>
              <a href="https://freellm.net" target="_blank" rel="noopener noreferrer" className="font-mono text-xs font-bold underline hover:text-[#FF4D00]">freellm.net</a>
            </div>
          </div>

          {/* provider grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FREE_PROVIDERS.map((provider) => (
              <ProviderCard key={provider.slug} provider={provider} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-6 mt-4"
        style={{
          borderTop: "2.5px solid #0A0A0A",
          background: "#0A0A0A",
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-xs text-[#FFE500]">
            Data: {" "}
            <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline font-black">OpenRouter</a>
            {" "}·{" "}
            <a href="https://github.com/cheahjs/free-llm-api-resources" target="_blank" rel="noopener noreferrer" className="underline font-black">cheahjs</a>
            {" "}·{" "}
            <a href="https://github.com/mnfst/awesome-free-llm-apis" target="_blank" rel="noopener noreferrer" className="underline font-black">mnfst</a>
            {" "}·{" "}
            <a href="https://freellm.net" target="_blank" rel="noopener noreferrer" className="underline font-black">freellm.net</a>
            . Updated hourly.
          </p>
          <p className="font-mono text-xs text-[#555]">
            free-models.vercel.app
          </p>
        </div>
      </footer>
    </div>
  );
}
