/**
 * Gemini API integration for story generation and image creation
 * Uses free tier Gemini 2.0 Flash model
 */

import { ENV } from "./env";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = "gemini-2.0-flash";

export type GeminiMessage = {
  role: "user" | "assistant";
  content: string;
};

export type GeminiGenerateOptions = {
  messages: GeminiMessage[];
  temperature?: number;
  maxTokens?: number;
};

export type GeminiImageGenerateOptions = {
  prompt: string;
  width?: number;
  height?: number;
};

/**
 * Generate text using Gemini API
 */
export async function generateWithGemini(
  options: GeminiGenerateOptions
): Promise<string> {
  if (!ENV.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const url = `${GEMINI_API_URL}/${MODEL}:generateContent?key=${ENV.geminiApiKey}`;

  const requestBody = {
    contents: options.messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    })),
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 4096,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Gemini API error (${response.status}): ${error}`
    );
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) {
    throw new Error("No text generated from Gemini");
  }

  return text;
}

/**
 * Generate image using Gemini API (via Imagen 3)
 * Note: Imagen 3 is available through Gemini API but requires specific setup
 * For now, we'll use a placeholder that can be replaced with actual image generation
 */
export async function generateImageWithGemini(
  options: GeminiImageGenerateOptions
): Promise<{ url: string; base64: string }> {
  if (!ENV.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  // For image generation, we'll use a free alternative service
  // or implement Imagen 3 integration when available
  // For now, returning a placeholder that generates via Gemini's vision capabilities

  try {
    // Try using Imagen 3 via Gemini API
    const url = `${GEMINI_API_URL}/imagen-3-generate:generateContent?key=${ENV.geminiApiKey}`;

    const requestBody = {
      instances: [
        {
          prompt: options.prompt,
        },
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: "9:16", // Vertical webtoon format
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Fallback to alternative image generation service
      return await generateImageWithFallback(options.prompt);
    }

    const data = (await response.json()) as {
      predictions?: Array<{
        bytesBase64Encoded?: string;
      }>;
    };

    const base64 = data.predictions?.[0]?.bytesBase64Encoded || "";
    if (!base64) {
      return await generateImageWithFallback(options.prompt);
    }

    return {
      url: `data:image/png;base64,${base64}`,
      base64,
    };
  } catch (error) {
    // Fallback to alternative service
    return await generateImageWithFallback(options.prompt);
  }
}

/**
 * Fallback image generation using Pollinations.ai (free service)
 */
async function generateImageWithFallback(prompt: string): Promise<{ url: string; base64: string }> {
  try {
    // Using Pollinations.ai free image generation API
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux-pro&width=576&height=1024`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Fallback image generation failed");
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return {
      url: `data:image/png;base64,${base64}`,
      base64,
    };
  } catch (error) {
    throw new Error(
      `Image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Stream text generation from Gemini (for real-time progress)
 */
export async function* streamGenerateWithGemini(
  options: GeminiGenerateOptions
): AsyncGenerator<string, void, unknown> {
  if (!ENV.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const url = `${GEMINI_API_URL}/${MODEL}:streamGenerateContent?key=${ENV.geminiApiKey}`;

  const requestBody = {
    contents: options.messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    })),
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 4096,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Gemini API error (${response.status}): ${error}`
    );
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body from Gemini");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      // Process all complete lines
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i];
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6)) as {
              candidates?: Array<{
                content?: {
                  parts?: Array<{ text?: string }>;
                };
              }>;
            };
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (text) {
              yield text;
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }

      // Keep the last incomplete line in the buffer
      buffer = lines[lines.length - 1];
    }

    // Process any remaining data
    if (buffer.startsWith("data: ")) {
      try {
        const data = JSON.parse(buffer.slice(6)) as {
          candidates?: Array<{
            content?: {
              parts?: Array<{ text?: string }>;
            };
          }>;
        };
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (text) {
          yield text;
        }
      } catch (e) {
        // Skip malformed JSON
      }
    }
  } finally {
    reader.releaseLock();
  }
}
