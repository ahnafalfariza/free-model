"use client";

import type { ModelData } from "@/app/api/models/route";

const MODALITY_COLORS: Record<string, string> = {
  "Text": "bg-[#FFE500]",
  "Multimodal (Vision)": "bg-[#FF69E2]",
  "Multimodal (Vision + Video)": "bg-[#FF4D00] text-white",
  "Multimodal (Audio)": "bg-[#00D166]",
};

function formatContext(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export default function ModelCard({ model }: { model: ModelData }) {
  const modalityColor = MODALITY_COLORS[model.modality] ?? "bg-[#0066FF] text-white";
  const desc = model.description.length > 140
    ? model.description.slice(0, 140).trimEnd() + "…"
    : model.description;

  return (
    <article className="brutal-card flex flex-col gap-3 p-5 rounded-none">
      {/* header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base leading-tight line-clamp-2 text-[#0A0A0A]">
            {model.name}
          </h2>
          <p className="text-xs font-mono text-[#555] mt-0.5 truncate">{model.id}</p>
        </div>
        {/* FREE badge */}
        <span
          className="shrink-0 text-[10px] font-black uppercase tracking-widest border-2 border-[#0A0A0A] bg-[#FFE500] px-2 py-0.5 leading-tight"
          style={{ boxShadow: "2px 2px 0 #0A0A0A" }}
        >
          FREE
        </span>
      </div>

      {/* description */}
      {desc && (
        <p className="text-sm text-[#333] leading-snug">{desc}</p>
      )}

      {/* tags row */}
      <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
        <span
          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 border border-[#0A0A0A] ${modalityColor}`}
        >
          {model.modality}
        </span>
        {model.contextLength > 0 && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-[#0A0A0A] bg-white">
            {formatContext(model.contextLength)} ctx
          </span>
        )}
      </div>

      {/* footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t-2 border-[#0A0A0A]">
        <a
          href={model.providerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold uppercase tracking-wide underline decoration-2 hover:text-[#FF4D00] transition-colors"
        >
          {model.providerDisplay}
        </a>
        <a
          href={model.openRouterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="brutal-btn text-[10px] px-3 py-1 bg-[#0A0A0A] text-white no-underline"
        >
          View →
        </a>
      </div>
    </article>
  );
}
