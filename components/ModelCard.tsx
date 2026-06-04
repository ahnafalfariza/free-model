"use client";

import type { ModelEntry } from "@/lib/model-types";
import { SOURCE_META } from "@/lib/model-types";

const MODALITY_COLORS: Record<string, string> = {
  "Text": "bg-[#FFE500] text-[#0A0A0A]",
  "Multimodal (Vision)": "bg-[#FF69E2] text-[#0A0A0A]",
  "Multimodal (Vision + Video)": "bg-[#FF4D00] text-white",
  "Multimodal (Audio)": "bg-[#00D166] text-[#0A0A0A]",
};

function formatContext(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export default function ModelCard({ model }: { model: ModelEntry }) {
  const modalityColor = MODALITY_COLORS[model.modality] ?? "bg-[#0066FF] text-white";
  const desc = model.description.length > 130
    ? model.description.slice(0, 130).trimEnd() + "…"
    : model.description;
  const sourceMeta = SOURCE_META[model.source];

  return (
    <article className="brutal-card flex flex-col gap-3 p-5 rounded-none">
      {/* header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base leading-tight line-clamp-2 text-[#0A0A0A]">
            {model.name}
          </h2>
          <p className="text-[10px] font-mono text-[#888] mt-0.5 truncate">{model.id}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className="text-[9px] font-black uppercase tracking-widest border-2 border-[#0A0A0A] bg-[#FFE500] px-2 py-0.5 leading-tight"
            style={{ boxShadow: "2px 2px 0 #0A0A0A" }}
          >
            FREE
          </span>
          {model.requiresKey && (
            <span className="text-[9px] font-black uppercase tracking-widest border border-[#0A0A0A] bg-white px-2 py-0.5 leading-tight text-[#555]">
              KEY REQ.
            </span>
          )}
        </div>
      </div>

      {/* source badge */}
      <div className="flex items-center gap-1.5">
        <div
          className="w-2 h-2 rounded-full border border-[#0A0A0A] shrink-0"
          style={{ background: sourceMeta.color }}
        />
        <span className="text-[10px] font-black uppercase tracking-widest text-[#555]">
          {sourceMeta.label}
        </span>
      </div>

      {/* description */}
      {desc && (
        <p className="text-sm text-[#333] leading-snug">{desc}</p>
      )}

      {/* tags */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 border border-[#0A0A0A] ${modalityColor}`}>
          {model.modality}
        </span>
        {model.contextLength > 0 && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-[#0A0A0A] bg-white">
            {formatContext(model.contextLength)} ctx
          </span>
        )}
      </div>

      {/* rate limits */}
      {model.rateLimits && (
        <p className="text-[10px] font-mono text-[#555] border-l-2 border-[#0A0A0A] pl-2">
          {model.rateLimits}
        </p>
      )}

      {/* notes */}
      {model.notes && (
        <p className="text-[10px] text-[#888] italic border-l-2 border-[#FFE500] pl-2 leading-snug">
          {model.notes}
        </p>
      )}

      {/* footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t-2 border-[#0A0A0A] mt-auto">
        {model.requiresKey ? (
          <a
            href={model.signupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold uppercase tracking-wide underline decoration-2 hover:text-[#FF4D00] transition-colors"
          >
            Get Free Key ↗
          </a>
        ) : (
          <a
            href={model.providerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold uppercase tracking-wide underline decoration-2 hover:text-[#FF4D00] transition-colors"
          >
            {model.providerDisplay}
          </a>
        )}
        <a
          href={model.modelUrl}
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
