import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getUserProjects,
  getProjectById,
  createProject,
  deleteProject,
  updateProject,
  getProjectCharacters,
  createCharacter,
  deleteCharacter,
  getProjectStories,
  createStory,
  getProjectChapters,
  getChapterById,
  createChapter,
  getChapterPanels,
  createPanel,
  getProjectAssets,
  createAsset,
  deleteAsset,
  getChapterExports,
  createExport,
} from "./db";
import { generateWithFreeAI, generateImageWithFreeService } from "./_core/freeai";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

// ============ Projects Router ============
const projectsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getUserProjects(ctx.user.id);
  }),

  get: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const project = await getProjectById(input.projectId, ctx.user.id);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      return project;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        genre: z.string().optional(),
        themes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await createProject(ctx.user.id, input);
      return result;
    }),

  update: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        genre: z.string().optional(),
        themes: z.string().optional(),
        status: z.enum(["draft", "in_progress", "completed"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { projectId, ...data } = input;
      const project = await getProjectById(projectId, ctx.user.id);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      return updateProject(projectId, ctx.user.id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const project = await getProjectById(input.projectId, ctx.user.id);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      return deleteProject(input.projectId, ctx.user.id);
    }),
});

// ============ Characters Router ============
const charactersRouter = router({
  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getProjectCharacters(input.projectId, ctx.user.id);
    }),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await getProjectById(input.projectId, ctx.user.id);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      return createCharacter(input.projectId, ctx.user.id, {
        name: input.name,
        description: input.description,
      });
    }),

  generateProfile: protectedProcedure
    .input(
      z.object({
        characterId: z.number().optional(),
        projectId: z.number(),
        name: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await getProjectById(input.projectId, ctx.user.id);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const prompt = `You are a professional manga/webtoon character designer. Generate a detailed character profile for a character named "${input.name}" with the following description: "${input.description}".

Provide the response as JSON with these fields:
- personality: string (2-3 sentences about their personality)
- backstory: string (3-4 sentences about their background)
- appearance: string (detailed physical description for manga art)
- skills: array of strings (special abilities or skills)
- weaknesses: array of strings (character weaknesses)

Make it suitable for a professional Korean manhwa/webtoon.`;

      const response = await generateWithFreeAI({
        messages: [{ role: "user", content: prompt }],
      });

      try {
        const profile = JSON.parse(response);
        return profile;
      } catch (e) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to parse character profile" });
      }
    }),

  generateImage: protectedProcedure
    .input(
      z.object({
        characterId: z.number().optional(),
        projectId: z.number(),
        name: z.string(),
        appearance: z.string(),
        style: z.string().default("manga-style anime character"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await getProjectById(input.projectId, ctx.user.id);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const prompt = `Create a professional manga-style character reference image for "${input.name}". 
Appearance: ${input.appearance}
Style: High-quality anime-realism hybrid, ${input.style}, suitable for professional webtoon publication.
Include: Full body pose, clear facial features, clothing details, professional lighting, clean line art.`;

      const url = await generateImageWithFreeService(prompt);
      return { url };
    }),

  delete: protectedProcedure
    .input(z.object({ characterId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return deleteCharacter(input.characterId, ctx.user.id);
    }),
});

// ============ Stories Router ============
const storiesRouter = router({
  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getProjectStories(input.projectId, ctx.user.id);
    }),

  generateOutline: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        genre: z.string(),
        themes: z.array(z.string()),
        characters: z.array(z.string()),
        premise: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await getProjectById(input.projectId, ctx.user.id);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const prompt = `You are a professional Korean webtoon/manhwa story writer. Create a detailed story outline for a ${input.genre} manhwa.

Premise: ${input.premise}
Themes: ${input.themes.join(", ")}
Main Characters: ${input.characters.join(", ")}

Generate:
1. World-building (setting, magic system if applicable, society structure)
2. Main plot arc (5-7 major story beats)
3. Character arcs for each main character
4. Potential conflicts and resolutions
5. Pacing suggestions for chapters

Make it suitable for a long-running professional webtoon series.`;

      const outline = await generateWithFreeAI({
        messages: [{ role: "user", content: prompt }],
      });

      return { outline };
    }),

  generateChapterScript: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        storyOutline: z.string(),
        chapterNumber: z.number(),
        previousChapterSummary: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await getProjectById(input.projectId, ctx.user.id);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const previousContext = input.previousChapterSummary
        ? `Previous Chapter Summary: ${input.previousChapterSummary}\n\n`
        : "";

      const prompt = `You are a professional Korean webtoon/manhwa scriptwriter. Write a detailed script for Chapter ${input.chapterNumber}.

${previousContext}Story Outline:
${input.storyOutline}

Create a complete chapter script with:
1. Scene-by-scene breakdown (each scene becomes a panel or series of panels)
2. Dialogue for each scene
3. Narration/internal monologue
4. Action descriptions
5. Emotional beats and pacing notes
6. Suggested panel count and layout

Format each scene as:
SCENE [number]: [location]
ACTION: [what happens]
DIALOGUE: [character]: "[dialogue]"
NARRATION: [if applicable]
PANELS: [suggested number]

Make it cinematic and suitable for high-quality manga art.`;

      const script = await generateWithFreeAI({
        messages: [{ role: "user", content: prompt }],
      });

      return { script };
    }),
});

// ============ Chapters Router ============
const chaptersRouter = router({
  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getProjectChapters(input.projectId, ctx.user.id);
    }),

  get: protectedProcedure
    .input(z.object({ chapterId: z.number() }))
    .query(async ({ ctx, input }) => {
      const chapter = await getChapterById(input.chapterId, ctx.user.id);
      if (!chapter) throw new TRPCError({ code: "NOT_FOUND" });
      return chapter;
    }),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        chapterNumber: z.number(),
        title: z.string().optional(),
        script: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await getProjectById(input.projectId, ctx.user.id);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      return createChapter(input.projectId, ctx.user.id, {
        chapterNumber: input.chapterNumber,
        title: input.title,
        script: input.script,
      });
    }),
});

// ============ Panels Router ============
const panelsRouter = router({
  list: protectedProcedure
    .input(z.object({ chapterId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getChapterPanels(input.chapterId, ctx.user.id);
    }),

  generateImage: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        chapterId: z.number(),
        sceneDescription: z.string(),
        panelNumber: z.number(),
        style: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const chapter = await getChapterById(input.chapterId, ctx.user.id);
      if (!chapter) throw new TRPCError({ code: "NOT_FOUND" });

      const prompt = `Create a professional manga-style comic panel for a webtoon.

Scene: ${input.sceneDescription}

Style: High-quality anime-realism hybrid, manga panel art, ${input.style || "dynamic action scene"}, suitable for professional webtoon publication.
Include: Detailed characters, expressive emotions, cinematic composition, professional inking, clean line art, vibrant colors.
Format: Vertical webtoon panel (portrait orientation).`;

      const url = await generateImageWithFreeService(prompt);

      const panel = await createPanel(input.chapterId, input.projectId, ctx.user.id, {
        panelNumber: input.panelNumber,
        sceneDescription: input.sceneDescription,
        imageUrl: url,
      });

      return { panel, imageUrl: url };
    }),

  addSpeechBubble: protectedProcedure
    .input(
      z.object({
        panelId: z.number(),
        chapterId: z.number(),
        text: z.string(),
        character: z.string(),
        type: z.enum(["speech", "thought", "narration"]).default("speech"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // This would update the panel with speech bubble data
      // For now, returning success
      return { success: true };
    }),
});

// ============ Assets Router ============
const assetsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        type: z
          .enum(["character", "background", "effect", "weapon", "skill"])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const allAssets = await getProjectAssets(input.projectId, ctx.user.id);
      if (input.type) {
        return allAssets.filter((a) => a.type === input.type);
      }
      return allAssets;
    }),

  save: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        type: z.enum(["character", "background", "effect", "weapon", "skill"]),
        name: z.string(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        metadata: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await getProjectById(input.projectId, ctx.user.id);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      return createAsset(input.projectId, ctx.user.id, {
        type: input.type,
        name: input.name,
        description: input.description,
        imageUrl: input.imageUrl,
        imageKey: input.imageKey,
        metadata: input.metadata,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ assetId: z.number(), projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const project = await getProjectById(input.projectId, ctx.user.id);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      return deleteAsset(input.assetId, ctx.user.id);
    }),
});

// ============ Exports Router ============
const exportsRouter = router({
  list: protectedProcedure
    .input(z.object({ chapterId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getChapterExports(input.chapterId, ctx.user.id);
    }),

  createPDF: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        chapterId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const chapter = await getChapterById(input.chapterId, ctx.user.id);
      if (!chapter) throw new TRPCError({ code: "NOT_FOUND" });

      const exportRecord = await createExport(
        input.chapterId,
        input.projectId,
        ctx.user.id,
        {
          format: "pdf",
        }
      );

      // TODO: Implement PDF generation
      return exportRecord;
    }),

  createImageSequence: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        chapterId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const chapter = await getChapterById(input.chapterId, ctx.user.id);
      if (!chapter) throw new TRPCError({ code: "NOT_FOUND" });

      const exportRecord = await createExport(
        input.chapterId,
        input.projectId,
        ctx.user.id,
        {
          format: "image_sequence",
        }
      );

      // TODO: Implement image sequence generation
      return exportRecord;
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  projects: projectsRouter,
  characters: charactersRouter,
  stories: storiesRouter,
  chapters: chaptersRouter,
  panels: panelsRouter,
  assets: assetsRouter,
  exports: exportsRouter,
});

export type AppRouter = typeof appRouter;
