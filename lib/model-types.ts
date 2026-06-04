export type ModelSource =
  | "openrouter"
  | "groq"
  | "google"
  | "cerebras"
  | "nvidia"
  | "github"
  | "mistral"
  | "cohere"
  | "cloudflare"
  | "huggingface"
  | "ovhcloud"
  | "siliconflow"
  | "llm7"
  | "kilo"
  | "ollama"
  | "zai"
  | "modelscope";

export interface ModelEntry {
  id: string;
  name: string;
  description: string;
  contextLength: number;
  modality: string;
  provider: string;
  providerDisplay: string;
  providerUrl: string;
  modelUrl: string;
  source: ModelSource;
  requiresKey: boolean;
  signupUrl: string;
  rateLimits?: string;
  notes?: string;
  createdAt: number;
}

export const SOURCE_META: Record<
  ModelSource,
  { label: string; color: string; signupUrl: string; providerUrl: string }
> = {
  openrouter: { label: "OpenRouter", color: "#7B5CF5", signupUrl: "https://openrouter.ai", providerUrl: "https://openrouter.ai" },
  groq: { label: "Groq", color: "#F55036", signupUrl: "https://console.groq.com/keys", providerUrl: "https://groq.com" },
  google: { label: "Google AI Studio", color: "#4285F4", signupUrl: "https://aistudio.google.com", providerUrl: "https://ai.google.dev" },
  cerebras: { label: "Cerebras", color: "#FF6B35", signupUrl: "https://cloud.cerebras.ai", providerUrl: "https://cerebras.ai" },
  nvidia: { label: "NVIDIA NIM", color: "#76B900", signupUrl: "https://build.nvidia.com", providerUrl: "https://build.nvidia.com" },
  github: { label: "GitHub Models", color: "#24292E", signupUrl: "https://github.com/marketplace/models", providerUrl: "https://github.com/marketplace/models" },
  mistral: { label: "Mistral", color: "#FF7000", signupUrl: "https://console.mistral.ai", providerUrl: "https://mistral.ai" },
  cohere: { label: "Cohere", color: "#39594D", signupUrl: "https://dashboard.cohere.com", providerUrl: "https://cohere.com" },
  cloudflare: { label: "Cloudflare AI", color: "#F38020", signupUrl: "https://dash.cloudflare.com", providerUrl: "https://developers.cloudflare.com/workers-ai" },
  huggingface: { label: "HuggingFace", color: "#FFD21E", signupUrl: "https://huggingface.co/join", providerUrl: "https://huggingface.co" },
  ovhcloud: { label: "OVHcloud", color: "#123F6D", signupUrl: "https://endpoints.ai.cloud.ovh.net", providerUrl: "https://endpoints.ai.cloud.ovh.net" },
  siliconflow: { label: "SiliconFlow", color: "#00C8FF", signupUrl: "https://cloud.siliconflow.cn/account/ak", providerUrl: "https://siliconflow.cn" },
  llm7: { label: "LLM7.io", color: "#8B5CF6", signupUrl: "https://token.llm7.io", providerUrl: "https://llm7.io" },
  kilo: { label: "Kilo Code", color: "#10B981", signupUrl: "https://kilo.ai", providerUrl: "https://kilo.ai" },
  ollama: { label: "Ollama Cloud", color: "#1C1C1C", signupUrl: "https://ollama.com/settings/keys", providerUrl: "https://ollama.com" },
  zai: { label: "Z AI (Zhipu)", color: "#3B82F6", signupUrl: "https://open.bigmodel.cn/usercenter/apikeys", providerUrl: "https://zhipuai.cn" },
  modelscope: { label: "ModelScope", color: "#624AFF", signupUrl: "https://modelscope.cn/my/myaccesstoken", providerUrl: "https://modelscope.cn" },
};
