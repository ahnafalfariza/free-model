"use client";

import { useState, useMemo } from "react";
import type { ModelData } from "@/app/api/models/route";
import ModelCard from "./ModelCard";

const MODALITY_FILTERS = ["All", "Text", "Multimodal (Vision)", "Multimodal (Vision + Video)", "Multimodal (Audio)"];

export default function ModelsGrid({ models }: { models: ModelData[] }) {
  const [query, setQuery] = useState("");
  const [modality, setModality] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "context" | "name">("newest");

  const filtered = useMemo(() => {
    let list = models;

    if (modality !== "All") {
      list = list.filter((m) => m.modality === modality);
    }

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
  }, [models, query, modality, sortBy]);

  const providers = useMemo(() => {
    const set = new Set(models.map((m) => m.providerDisplay));
    return Array.from(set).sort();
  }, [models]);

  return (
    <div className="flex flex-col gap-6">
      {/* Search + sort bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Search models, providers…"
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

      {/* Modality filter pills */}
      <div className="flex flex-wrap gap-2">
        {MODALITY_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setModality(f)}
            className={`brutal-btn text-xs px-3 py-1.5 ${
              modality === f
                ? "bg-[#0A0A0A] text-white"
                : "bg-[#FFE500] text-[#0A0A0A]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Stats line */}
      <p className="font-mono text-xs text-[#555] border-b-2 border-[#0A0A0A] pb-2">
        <span className="font-black text-[#0A0A0A]">{filtered.length}</span> models
        {query && ` matching "${query}"`}
        {modality !== "All" && ` · ${modality}`}
        {" "}·{" "}
        <span className="font-black text-[#0A0A0A]">{providers.length}</span> providers
      </p>

      {/* Grid */}
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
