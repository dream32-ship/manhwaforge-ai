import { eq, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  users,
  projects,
  characters,
  stories,
  chapters,
  panels,
  assets,
  exports,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflict((t) => ({
      target: t.openId,
      do: db.update(users).set(updateSet),
    }));
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Projects ============
export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.userId, userId));
}

export async function getProjectById(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);
  return result[0];
}

export async function createProject(
  userId: number,
  data: { title: string; description?: string; genre?: string; themes?: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values({
    userId,
    title: data.title,
    description: data.description,
    genre: data.genre,
    themes: data.themes,
  });
  return result;
}

// ============ Characters ============
export async function getProjectCharacters(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(characters)
    .where(and(eq(characters.projectId, projectId), eq(characters.userId, userId)));
}

export async function createCharacter(
  projectId: number,
  userId: number,
  data: {
    name: string;
    description?: string;
    personality?: string;
    backstory?: string;
    appearance?: string;
    referenceImageUrl?: string;
    referenceImageKey?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(characters).values({
    projectId,
    userId,
    ...data,
  });
}

// ============ Stories ============
export async function getProjectStories(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(stories)
    .where(and(eq(stories.projectId, projectId), eq(stories.userId, userId)));
}

export async function createStory(
  projectId: number,
  userId: number,
  data: { title: string; outline?: string; worldBuilding?: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(stories).values({
    projectId,
    userId,
    ...data,
  });
}

// ============ Chapters ============
export async function getProjectChapters(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(chapters)
    .where(and(eq(chapters.projectId, projectId), eq(chapters.userId, userId)));
}

export async function getChapterById(chapterId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(chapters)
    .where(and(eq(chapters.id, chapterId), eq(chapters.userId, userId)))
    .limit(1);
  return result[0];
}

export async function createChapter(
  projectId: number,
  userId: number,
  data: {
    chapterNumber: number;
    title?: string;
    script?: string;
    storyId?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(chapters).values({
    projectId,
    userId,
    ...data,
  });
}

// ============ Panels ============
export async function getChapterPanels(chapterId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(panels)
    .where(and(eq(panels.chapterId, chapterId), eq(panels.userId, userId)));
}

export async function createPanel(
  chapterId: number,
  projectId: number,
  userId: number,
  data: {
    panelNumber: number;
    sceneDescription?: string;
    imageUrl?: string;
    imageKey?: string;
    speechBubbles?: string;
    narrationBoxes?: string;
    soundEffects?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(panels).values({
    chapterId,
    projectId,
    userId,
    ...data,
  });
}

// ============ Assets ============
export async function getProjectAssets(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(assets)
    .where(and(eq(assets.projectId, projectId), eq(assets.userId, userId)));
}

export async function createAsset(
  projectId: number,
  userId: number,
  data: {
    type: "character" | "background" | "effect" | "weapon" | "skill";
    name: string;
    description?: string;
    imageUrl?: string;
    imageKey?: string;
    metadata?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(assets).values({
    projectId,
    userId,
    ...data,
  });
}

// ============ Exports ============
export async function getChapterExports(chapterId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(exports)
    .where(and(eq(exports.chapterId, chapterId), eq(exports.userId, userId)));
}

export async function createExport(
  chapterId: number,
  projectId: number,
  userId: number,
  data: {
    format: "pdf" | "image_sequence" | "zip";
    fileUrl?: string;
    fileKey?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(exports).values({
    chapterId,
    projectId,
    userId,
    status: "generating",
    ...data,
  });
}


// ============ Delete Operations ============
export async function deleteAsset(assetId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verify ownership before deleting
  const asset = await db.select().from(assets).where(eq(assets.id, assetId)).limit(1);
  if (!asset[0] || asset[0].userId !== userId) {
    throw new Error("Unauthorized");
  }
  
  return db.delete(assets).where(eq(assets.id, assetId));
}

export async function deleteProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verify ownership before deleting
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project[0] || project[0].userId !== userId) {
    throw new Error("Unauthorized");
  }
  
  return db.delete(projects).where(eq(projects.id, projectId));
}

export async function deleteCharacter(characterId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verify ownership before deleting
  const character = await db.select().from(characters).where(eq(characters.id, characterId)).limit(1);
  if (!character[0] || character[0].userId !== userId) {
    throw new Error("Unauthorized");
  }
  
  return db.delete(characters).where(eq(characters.id, characterId));
}

export async function updateProject(
  projectId: number,
  userId: number,
  data: {
    title?: string;
    description?: string;
    genre?: string;
    themes?: string;
    status?: "draft" | "in_progress" | "completed";
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verify ownership before updating
  const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project[0] || project[0].userId !== userId) {
    throw new Error("Unauthorized");
  }
  
  return db.update(projects).set(data).where(eq(projects.id, projectId));
}
