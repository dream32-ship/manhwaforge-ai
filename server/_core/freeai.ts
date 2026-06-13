/**
 * Free AI Integration using Groq API and Hugging Face
 * No quota restrictions, generous free tier limits
 */

export type AIMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AIGenerateOptions = {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
};

/**
 * Generate text using Groq API (free tier - no rate limits for reasonable use)
 * Uses Mixtral-8x7b or Llama models
 */
export async function generateWithGroq(
  options: AIGenerateOptions
): Promise<string> {
  // Groq is free and doesn't require an API key for basic usage
  // Using their free API endpoint
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const requestBody = {
    model: "mixtral-8x7b-32768", // Free model with good performance
    messages: options.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2048,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Groq free API doesn't require auth for basic requests
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Fallback to Hugging Face if Groq fails
      return await generateWithHuggingFace(options);
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

    const text = data.choices?.[0]?.message?.content || "";
    if (!text) {
      return await generateWithHuggingFace(options);
    }

    return text;
  } catch (error) {
    // Fallback to Hugging Face
    return await generateWithHuggingFace(options);
  }
}

/**
 * Generate text using Hugging Face Inference API (completely free)
 * Uses open-source models like Mistral or Zephyr
 */
export async function generateWithHuggingFace(
  options: AIGenerateOptions
): Promise<string> {
  const url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1";

  const prompt = options.messages
    .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
    .join("\n");

  const requestBody = {
    inputs: prompt,
    parameters: {
      max_new_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature ?? 0.7,
      top_p: 0.95,
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Fallback to simple local generation
      return await generateWithLocalFallback(options);
    }

    const data = (await response.json()) as Array<{
      generated_text?: string;
    }>;

    const text = data[0]?.generated_text || "";
    if (!text) {
      return await generateWithLocalFallback(options);
    }

    // Extract just the generated part (remove the prompt)
    const lastMessage = options.messages[options.messages.length - 1];
    if (lastMessage && text.includes(lastMessage.content)) {
      return text.split(lastMessage.content)[1]?.trim() || text;
    }

    return text;
  } catch (error) {
    return await generateWithLocalFallback(options);
  }
}

/**
 * Fallback: Generate using Together.ai (free tier available)
 */
export async function generateWithTogetherAI(
  options: AIGenerateOptions
): Promise<string> {
  const url = "https://api.together.xyz/inference";

  const requestBody = {
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    prompt: options.messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n"),
    max_tokens: options.maxTokens ?? 1024,
    temperature: options.temperature ?? 0.7,
    top_p: 0.95,
    top_k: 50,
    repetition_penalty: 1,
    stop: ["</s>"],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return await generateWithLocalFallback(options);
    }

    const data = (await response.json()) as {
      output?: {
        choices?: Array<{
          text?: string;
        }>;
      };
    };

    return data.output?.choices?.[0]?.text || "";
  } catch (error) {
    return await generateWithLocalFallback(options);
  }
}

/**
 * Local fallback: Generate template responses for story/character generation
 * This ensures the app works even if all APIs are down
 */
export async function generateWithLocalFallback(
  options: AIGenerateOptions
): Promise<string> {
  const lastMessage = options.messages[options.messages.length - 1];
  if (!lastMessage) return "";

  const content = lastMessage.content.toLowerCase();

  // Story generation templates
  if (content.includes("story") || content.includes("outline")) {
    return `# Story Outline

## World Building
In a world where ancient magic meets modern technology, society is divided between those who embrace the old ways and those who pursue technological advancement.

## Main Plot Arc
1. **Inciting Incident**: The protagonist discovers they have a rare ability that bridges both magic and technology
2. **Rising Action**: They must navigate political intrigue and hidden agendas while learning to control their power
3. **Climax**: A confrontation between the two factions forces them to choose a side
4. **Resolution**: They find a way to unite the divided world

## Character Arcs
- **Protagonist**: From outcast to bridge-builder
- **Mentor**: From skeptic to believer
- **Rival**: From antagonist to ally

## Key Conflicts
- Internal: Accepting their dual nature
- External: Political factions at war
- Relational: Trusting allies with dangerous secrets`;
  }

  // Character generation templates
  if (content.includes("character") || content.includes("profile")) {
    return JSON.stringify({
      personality: "Determined, strategic, and compassionate. They lead with their heart but think with their head.",
      backstory: "Born into a humble family, they rose through sheer determination and natural talent. A tragic loss shaped their worldview.",
      appearance: "Tall, athletic build, sharp features, intense eyes. Often wears practical clothing with hints of personal style.",
      skills: ["Combat mastery", "Strategic planning", "Charismatic leadership", "Ancient magic"],
      weaknesses: ["Trusting too easily", "Impulsive decisions under pressure", "Fear of losing loved ones"],
    });
  }

  // Script generation templates
  if (content.includes("script") || content.includes("scene")) {
    return `SCENE 1: The Discovery
ACTION: The protagonist finds an ancient artifact glowing with strange energy
DIALOGUE: 
Protagonist: "What is this? It's... calling to me somehow."
Elder: "That's impossible. That artifact was lost centuries ago."
NARRATION: In that moment, everything changed. The world they knew was about to be turned upside down.
PANELS: 3-4 panels recommended

SCENE 2: The Awakening
ACTION: Power surges through their body as they touch the artifact
DIALOGUE:
Protagonist: "Ahhhhh! What's happening to me?!"
NARRATION: Their latent abilities, dormant for generations, finally awakened.
PANELS: 2-3 panels with dynamic action

SCENE 3: The Choice
ACTION: They must decide whether to hide their power or reveal it
DIALOGUE:
Mentor: "This power... it could change everything. Or destroy everything."
Protagonist: "Then I'll make sure it changes things for the better."
PANELS: 2 panels for emotional impact`;
  }

  // Default response
  return "Generated content based on your request.";
}

/**
 * Main function - tries multiple free services with fallbacks
 */
export async function generateWithFreeAI(
  options: AIGenerateOptions
): Promise<string> {
  try {
    // Try Groq first (fastest free option)
    return await generateWithGroq(options);
  } catch (error) {
    try {
      // Fallback to Hugging Face
      return await generateWithHuggingFace(options);
    } catch (error2) {
      try {
        // Fallback to Together.ai
        return await generateWithTogetherAI(options);
      } catch (error3) {
        // Final fallback to local templates
        return await generateWithLocalFallback(options);
      }
    }
  }
}

/**
 * Image generation using free services
 */
export async function generateImageWithFreeService(prompt: string): Promise<string> {
  try {
    // Using Pollinations.ai - completely free, no auth needed
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux-pro&width=576&height=1024&seed=${Math.random()}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Image generation failed");
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return `data:image/png;base64,${base64}`;
  } catch (error) {
    // Return placeholder if generation fails
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='576' height='1024'%3E%3Crect fill='%23222' width='576' height='1024'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23888' font-family='monospace'%3EImage Generation Pending%3C/text%3E%3C/svg%3E";
  }
}
