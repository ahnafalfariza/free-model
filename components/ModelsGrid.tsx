"use client";

import { useState, useMemo } from "react";
import type { ModelEntry, ModelSource } from "@/lib/model-types";
import { SOURCE_META } from "@/lib/model-types";
import ModelCard from "./ModelCard";

const MODALITY_FILTERS = ["All", "Text", "Multimodal (Vision)", "Multimodal (Vision + Video)", "Multimodal (Audio)"];

export default function ModelsGrid({ models }: { models: ModelEntry[] }) {
  const [query, setQuery] = useState("");
  const [modality, setModality] = useState("All");
  const [keyFilter, setKeyFilter] = useState<"all" | "no-key" | "key-required">("all");
  const [source, setSource] = useState<ModelSource | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "context" | "name">("newest");

  const sources = useMemo(() => {
    const set = new Set(models.map((m) => m.source));
    return Array.from(set).sort();
  }, [models]);

  const filtered = useMemo(() => {
    let list = models;

    if (source !== "all") list = list.filter((m) => m.source === source);
    if (modality !== "All") list = list.filter((m) => m.modality === modality);
    if (keyFilter === "no-key") list = list.filter((m) => !m.requiresKey);
    if (keyFilter === "key-required") list = list.filter((m) => m.requiresKey);

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.providerDisplay.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    if (sortBy === "newest") return [...list].sort((a, b) => b.createdAt - a.createdAt);
    if (sortBy === "context") return [...list].sort((a, b) => b.contextLength - a.contextLength);
    if (sortBy === "name") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [models, query, modality, keyFilter, source, sortBy]);

  const noKeyCount = useMemo(() => models.filter((m) => !m.requiresKey).length, [models]);
  const keyCount = useMemo(() => models.filter((m) => m.requiresKey).length, [models]);

  return (
    <div className="flex flex-col gap-5">
      {/* search + sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Search models, providers, capabilities…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="brutal-input flex-1 px-4 py-3 font-mono text-sm"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="brutal-input px-3 py-3 font-mono text-sm font-bold uppercase cursor-pointer"
        >
          <option value="newest">Newest first</option>
          <option value="context">Largest context</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {/* key filter */}
      <div className="flex flex-wrap gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#555] self-center mr-1">Access:</span>
        {(["all", "no-key", "key-required"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKeyFilter(k)}
            className={`brutal-btn text-xs px-3 py-1.5 ${
              keyFilter === k ? "bg-[#0A0A0A] text-white" : "bg-white text-[#0A0A0A]"
            }`}
          >
            {k === "all" && `All (${models.length})`}
            {k === "no-key" && `No Key (${noKeyCount})`}
            {k === "key-required" && `Free Key (${keyCount})`}
          </button>
        ))}
      </div>

      {/* source filter */}
      <div className="flex flex-wrap gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#555] self-center mr-1">Source:</span>
        <button
          onClick={() => setSource("all")}
          className={`brutal-btn text-xs px-3 py-1.5 ${source === "all" ? "bg-[#0A0A0A] text-white" : "bg-white text-[#0A0A0A]"}`}
        >
          All
        </button>
        {sources.map((s) => (
          <button
            key={s}
            onClick={() => setSource(s)}
            className={`brutal-btn text-xs px-3 py-1.5 flex items-center gap-1.5 ${
              source === s ? "bg-[#0A0A0A] text-white" : "bg-white text-[#0A0A0A]"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full border border-current"
              style={{ background: source === s ? "white" : SOURCE_META[s].color }}
            />
            {SOURCE_META[s].label}
          </button>
        ))}
      </div>

      {/* modality filter */}
      <div className="flex flex-wrap gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#555] self-center mr-1">Type:</span>
        {MODALITY_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setModality(f)}
            className={`brutal-btn text-xs px-3 py-1.5 ${
              modality === f ? "bg-[#FFE500] text-[#0A0A0A]" : "bg-white text-[#0A0A0A]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* stats */}
      <p className="font-mono text-xs text-[#555] border-b-2 border-[#0A0A0A] pb-2">
        <span className="font-black text-[#0A0A0A]">{filtered.length}</span> models shown
        {query && ` matching "${query}"`}
      </p>

      {/* grid */}
      {filtered.length === 0 ? (
        <div
          className="text-center py-20 border-2 border-[#0A0A0A] bg-white"
          style={{ boxShadow: "4px 4px 0 #0A0A0A" }}
        >
          <p className="font-black text-2xl uppercase">No models found.</p>
          <p className="font-mono text-sm text-[#555] mt-2">Try a different search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      )}
    </div>
  );
}
