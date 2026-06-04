"use client";

import type { FreeProvider } from "@/lib/providers";

export default function ProviderCard({ provider }: { provider: FreeProvider }) {
  return (
    <article className="brutal-card flex flex-col gap-3 p-5">
      {/* header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full border-2 border-[#0A0A0A] shrink-0"
            style={{ background: provider.color }}
          />
          <h3 className="font-black text-base uppercase tracking-tight">{provider.name}</h3>
        </div>
        <span
          className="text-[10px] font-black uppercase tracking-widest border-2 border-[#0A0A0A] px-2 py-0.5 bg-white shrink-0"
          style={{ boxShadow: "2px 2px 0 #0A0A0A" }}
        >
          KEY REQ.
        </span>
      </div>

      {/* description */}
      <p className="text-sm text-[#333] leading-snug">{provider.description}</p>

      {/* rate limits */}
      <div className="border-2 border-[#0A0A0A] px-3 py-2 bg-[#FFFBF0]">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#555] mb-0.5">Rate Limits</p>
        <p className="font-mono text-xs font-bold text-[#0A0A0A]">{provider.rateLimits}</p>
      </div>

      {/* notable models */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#555] mb-1.5">Notable Models</p>
        <div className="flex flex-wrap gap-1">
          {provider.notableModels.map((m) => (
            <span
              key={m}
              className="font-mono text-[10px] px-2 py-0.5 border border-[#0A0A0A] bg-white"
            >
              {m}
            </span>
          ))}
          {provider.modelCount && (
            <span className="font-mono text-[10px] px-2 py-0.5 border border-dashed border-[#0A0A0A] text-[#555]">
              +{Math.max(0, provider.modelCount - provider.notableModels.length)} more
            </span>
          )}
        </div>
      </div>

      {/* notes */}
      {provider.notes && (
        <p className="text-[11px] text-[#777] italic border-l-2 border-[#FFE500] pl-2">{provider.notes}</p>
      )}

      {/* footer */}
      <div className="flex items-center gap-2 pt-2 border-t-2 border-[#0A0A0A] mt-auto">
        <a
          href={provider.signupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="brutal-btn flex-1 text-center text-[10px] px-3 py-1.5 bg-[#FFE500] text-[#0A0A0A] no-underline"
        >
          Get Free API Key →
        </a>
        <a
          href={provider.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="brutal-btn text-[10px] px-3 py-1.5 bg-white text-[#0A0A0A] no-underline"
        >
          Docs
        </a>
      </div>
    </article>
  );
}
