// 这个站用哪些模型。框架自带一个 `default`：环境变量 LLM_BASE_URL / LLM_API_KEY / LLM_MODEL 指定的模型。
// 这里再列出具名的模型（每个用自己的地址和密钥环境变量），以及每一步默认用哪个；没写的步骤用 default。
// 部署时还可以用环境变量（PREFILTER_MODEL、SCORE_MODEL……）或后台的“模型与评测”页逐步改选。

import type { ModelPreset } from "@aihot/contracts/site-config";
export type { ModelPreset } from "@aihot/contracts/site-config";

/** 具名的模型示例（每个要配自己的密钥）。用不上可以删掉。 */
export const PRESETS: Record<string, ModelPreset> = {
  // Magpie 网关（http://192.168.1.162:3425）
  "magpie-deepseek-v4.1-flash": {
    service: "magpie", model: "auto/deepseek-v4.1-flash", baseUrlEnv: "MAGPIE_BASE_URL", apiKeyEnv: "MAGPIE_API_KEY",
    reasoningTokens: 4000, jsonMode: true, vision: true,
  },
  "magpie-mimo-v2.6-flash-free": {
    service: "magpie", model: "auto/mimo-v2.6-flash-free", baseUrlEnv: "MAGPIE_BASE_URL", apiKeyEnv: "MAGPIE_API_KEY",
    reasoningTokens: 4000, jsonMode: true, vision: true,
  },
  "magpie-glm-5.3-flash-free": {
    service: "magpie", model: "auto/glm-5.3-flash-free", baseUrlEnv: "MAGPIE_BASE_URL", apiKeyEnv: "MAGPIE_API_KEY",
    reasoningTokens: 4000, jsonMode: true, vision: true,
  },
  "magpie-forcp": {
    service: "magpie", model: "group/forcp", baseUrlEnv: "MAGPIE_BASE_URL", apiKeyEnv: "MAGPIE_API_KEY",
    reasoningTokens: 4000, jsonMode: true, vision: true,
  },
  "magpie-auto": {
    service: "magpie", model: "auto/auto", baseUrlEnv: "MAGPIE_BASE_URL", apiKeyEnv: "MAGPIE_API_KEY",
    reasoningTokens: 4000, jsonMode: true, vision: true,
  },
  "magpie-smart-split": {
    service: "magpie", model: "group/smart-split", baseUrlEnv: "MAGPIE_BASE_URL", apiKeyEnv: "MAGPIE_API_KEY",
    reasoningTokens: 4000, jsonMode: true, vision: true,
  },
  // GLM 5.3 Flash always reasons; the lowest effort keeps short structured tasks fast.
  "glm-5.3-flash": {
    service: "zhipu", model: "glm-5.3-flash", baseUrlEnv: "ZHIPU_BASE_URL", apiKeyEnv: "ZHIPU_API_KEY",
    extra: { thinking: { type: "enabled" }, reasoning_effort: "low" }, jsonMode: true, vision: true,
  },
  // The scorer's parameters for glm-5.3-flash: temperature 1 with high reasoning, up to 180 s per call.
  "glm-5.3-flash-selection": {
    service: "zhipu", model: "glm-5.3-flash", baseUrlEnv: "ZHIPU_BASE_URL", apiKeyEnv: "ZHIPU_API_KEY",
    extra: { thinking: { type: "enabled", clear_thinking: false }, reasoning_effort: "high", top_p: 0.95 }, jsonMode: true, vision: true,
    scoreCall: { temperature: 1, maxTokens: 65_536, timeoutMs: 180_000 },
  },
  // DeepSeek Flash reasons by default; structured tasks switch it off. deepseek-flash-think keeps it on,
  // with room in the output for the reasoning.
  "deepseek-flash": {
    service: "deepseek", model: "deepseek-flash", baseUrlEnv: "DEEPSEEK_BASE_URL", apiKeyEnv: "DEEPSEEK_API_KEY",
    extra: { thinking: { type: "disabled" } }, jsonMode: true,
  },
  "deepseek-flash-think": {
    service: "deepseek", model: "deepseek-flash", baseUrlEnv: "DEEPSEEK_BASE_URL", apiKeyEnv: "DEEPSEEK_API_KEY", reasoningTokens: 4000, jsonMode: true,
  },
  "qwen3.7-flash": {
    service: "dashscope", model: "qwen3.7-flash", baseUrlEnv: "DASHSCOPE_BASE_URL", apiKeyEnv: "DASHSCOPE_API_KEY",
    extra: { enable_thinking: false }, jsonMode: true,
  },
  "qwen3.8-flash": {
    service: "dashscope", model: "qwen3.8-flash", baseUrlEnv: "DASHSCOPE_BASE_URL", apiKeyEnv: "DASHSCOPE_API_KEY",
    extra: { enable_thinking: false }, jsonMode: true,
  },
  "mimo-v2.6-flash": {
    service: "mimo", model: "mimo-v2.6-flash", baseUrlEnv: "XIAOMI_MIMO_BASE_URL", apiKeyEnv: "XIAOMI_MIMO_API_KEY",
    extra: { thinking: { type: "disabled" } }, jsonMode: true,
  },
  "qwen3-vl-flash": {
    service: "dashscope", model: "qwen3-vl-flash", baseUrlEnv: "DASHSCOPE_BASE_URL", apiKeyEnv: "DASHSCOPE_API_KEY",
    extra: { enable_thinking: false }, jsonMode: false, vision: true,
  },
};

/**
 * 每一步默认用的模型（步骤见后台“模型与评测”页），值是上面的名字或 default。没写的步骤用 default。
 * 例：{ score: "glm-5.3-flash-selection", groupReview: "mimo-v2.6-flash" }
 */
export const DEFAULTS: Record<string, string> = {
  prefilter: "magpie-deepseek-v4.1-flash",
  score: "magpie-deepseek-v4.1-flash",
  understand: "magpie-deepseek-v4.1-flash",
  summarize: "magpie-deepseek-v4.1-flash",
  wording: "magpie-deepseek-v4.1-flash",
  structure: "magpie-deepseek-v4.1-flash",
  group: "magpie-deepseek-v4.1-flash",
  groupReview: "magpie-deepseek-v4.1-flash",
  digest: "magpie-deepseek-v4.1-flash",
  report: "magpie-deepseek-v4.1-flash",
  translate: "magpie-deepseek-v4.1-flash",
  feedback: "magpie-deepseek-v4.1-flash",
};
