import type { ModelEntry, ModelSource } from "./model-types";
import { SOURCE_META } from "./model-types";
import { STATIC_MODELS } from "./static-models";

// Maps section heading keywords → our source keys
const HEADING_SOURCE_MAP: Array<[RegExp, ModelSource]> = [
  [/groq/i, "groq"],
  [/google gemini|google ai studio/i, "google"],
  [/cerebras/i, "cerebras"],
  [/nvidia nim/i, "nvidia"],
  [/github models/i, "github"],
  [/mistral ai|mistral/i, "mistral"],
  [/cohere/i, "cohere"],
  [/cloudflare workers ai/i, "cloudflare"],
  [/hugging face/i, "huggingface"],
];

function detectSource(heading: string): ModelSource | null {
  for (const [re, src] of HEADING_SOURCE_MAP) {
    if (re.test(heading)) return src;
  }
  return null;
}

function parseContextLength(s: string): number {
  if (!s || s === "—" || s === "-") return 0;
  const clean = s.replace(/[~\s,]/g, "").trim();
  const m = clean.match(/^([\d.]+)([KMG]?)$/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const unit = m[2].toUpperCase();
  if (unit === "G") return Math.round(n * 1e9);
  if (unit === "M") return Math.round(n * 1e6);
  if (unit === "K") return Math.round(n * 1000);
  return Math.round(n);
}

function parseModality(s: string): string {
  const l = s.toLowerCase();
  if (l.includes("video")) return "Multimodal (Vision + Video)";
  if (l.includes("audio") && (l.includes("image") || l.includes("vision"))) return "Multimodal (Vision)";
  if (l.includes("audio")) return "Multimodal (Audio)";
  if (l.includes("image") || l.includes("vision") || l.includes("multimodal")) return "Multimodal (Vision)";
  return "Text";
}

function slugify(name: string, source: ModelSource): string {
  return `${source}/${name.toLowerCase().replace(/[^a-z0-9.\-_/]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")}`;
}

// Parse a markdown pipe table, returns rows as string[][] (skips header + separator rows)
function parseMdTable(block: string): string[][] {
  const lines = block.split("\n").filter((l) => l.trim().startsWith("|"));
  const rows: string[][] = [];
  for (const line of lines) {
    const cols = line.split("|").slice(1, -1).map((c) => c.trim());
    // skip separator rows like |---|---|
    if (cols.every((c) => /^[-: ]+$/.test(c))) continue;
    rows.push(cols);
  }
  return rows;
}

// Column index finder (case-insensitive partial match)
function colIdx(headers: string[], keyword: string): number {
  return headers.findIndex((h) => h.toLowerCase().includes(keyword.toLowerCase()));
}

function parseSection(section: string, source: ModelSource): ModelEntry[] {
  const meta = SOURCE_META[source];
  const models: ModelEntry[] = [];

  // Find markdown table blocks
  const tableBlockRe = /(\|.+\|\n(?:\|[-: |]+\|\n)(?:\|.+\|\n?)+)/g;
  let match: RegExpExecArray | null;

  while ((match = tableBlockRe.exec(section)) !== null) {
    const tableText = match[1];
    const allRows = parseMdTable(tableText);
    if (allRows.length < 2) continue;

    const headers = allRows[0];
    const nameIdx = colIdx(headers, "model");
    const ctxIdx = colIdx(headers, "context");
    const modalityIdx = colIdx(headers, "modality");
    const rateIdx = colIdx(headers, "rate");

    if (nameIdx === -1) continue;

    for (const row of allRows.slice(1)) {
      const rawName = row[nameIdx] ?? "";
      // skip "N more models" summary rows
      if (!rawName || rawName.startsWith("+") || rawName.includes("more model")) continue;
      // strip markdown backticks and bold
      const name = rawName.replace(/`|\*\*/g, "").trim();
      if (!name) continue;

      const contextLength = ctxIdx !== -1 ? parseContextLength(row[ctxIdx] ?? "") : 0;
      const modality = modalityIdx !== -1 ? parseModality(row[modalityIdx] ?? "") : "Text";
      const rateLimits = rateIdx !== -1 ? row[rateIdx]?.replace(/`/g, "").trim() : undefined;

      models.push({
        id: slugify(name, source),
        name,
        description: "",
        contextLength,
        modality,
        provider: source,
        providerDisplay: meta.label,
        providerUrl: meta.providerUrl,
        modelUrl: meta.signupUrl,
        source,
        requiresKey: true,
        signupUrl: meta.signupUrl,
        rateLimits: rateLimits || undefined,
        createdAt: 0,
      });
    }
  }

  return models;
}

export async function fetchDynamicProviders(): Promise<ModelEntry[]> {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/mnfst/awesome-free-llm-apis/main/README.md",
      { next: { revalidate: 3600 }, headers: { "User-Agent": "free-model/1.0" } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    // Split by H3 headings
    const sections = text.split(/(?=^### \[)/m);
    const all: ModelEntry[] = [];

    for (const section of sections) {
      // Extract heading name, e.g. "### [Groq](url) 🇺🇸"
      const headingMatch = section.match(/^### \[([^\]]+)\]/);
      if (!headingMatch) continue;
      const heading = headingMatch[1];

      const source = detectSource(heading);
      if (!source || source === ("openrouter" as ModelSource)) continue;

      const parsed = parseSection(section, source);
      all.push(...parsed);
    }

    // Deduplicate by id within each source
    const seen = new Set<string>();
    return all.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  } catch (err) {
    console.error("[fetchDynamicProviders] README parse failed, falling back to static:", err);
    return STATIC_MODELS;
  }
}
