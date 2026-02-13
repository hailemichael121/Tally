import express from "express";
import cors from "cors";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { startOfWeek } from "date-fns";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();
const app = express();

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
};

const host = process.env.HOST || `https://tally-bibx.onrender.com`;
console.log(
  `${colors.dim}└─ Health:${colors.reset} ${colors.blue}${host}/${colors.reset}`,
);

const getTimestamp = () => {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
};

const safeObjectKeys = (obj: unknown): string[] => {
  if (!obj || typeof obj !== "object") {
    return [];
  }
  return Object.keys(obj);
};

app.use((req, res, next) => {
  const startTime = Date.now();
  const timestamp = getTimestamp();

  console.log(
    `${colors.dim}[${timestamp}]${colors.reset} ` +
      `${colors.bright}${colors.cyan}→ ${req.method} ${req.path}${colors.reset} ` +
      `${colors.dim}from ${req.ip}${colors.reset}`,
  );

  try {
    const bodyKeys = safeObjectKeys(req.body);
    if (bodyKeys.length > 0 && req.path !== "/uploads") {
      console.log(
        `${colors.dim}   Body:${colors.reset} ` +
          `${colors.white}${JSON.stringify(req.body, null, 2).replace(/\n/g, "\n   ")}${colors.reset}`,
      );
    }

    const queryKeys = safeObjectKeys(req.query);
    if (queryKeys.length > 0) {
      console.log(
        `${colors.dim}   Query:${colors.reset} ` +
          `${colors.white}${JSON.stringify(req.query)}${colors.reset}`,
      );
    }
  } catch {
    console.log(`${colors.dim}   [Could not log request data]${colors.reset}`);
  }

  const originalSend = res.send.bind(res);
  res.send = (body) => {
    const responseTime = Date.now() - startTime;
    const statusColor =
      res.statusCode >= 400
        ? colors.red
        : res.statusCode >= 300
          ? colors.yellow
          : colors.green;
    const statusSymbol =
      res.statusCode >= 400 ? "✗" : res.statusCode >= 300 ? "↪" : "✓";

    console.log(
      `${colors.dim}[${timestamp}]${colors.reset} ` +
        `${colors.bright}${statusColor}${statusSymbol} ${req.method} ${req.path} ${res.statusCode}${colors.reset} ` +
        `${colors.dim}(${responseTime}ms)${colors.reset}`,
    );

    try {
      if (body && typeof body === "string" && body.length < 1000) {
        try {
          const parsed = JSON.parse(body) as unknown;
          const responseKeys = safeObjectKeys(parsed);
          if (responseKeys.length > 0) {
            console.log(
              `${colors.dim}   Response:${colors.reset} ` +
                `${colors.white}${JSON.stringify(parsed, null, 2).replace(/\n/g, "\n   ")}${colors.reset}`,
            );
          }
        } catch {
          // no-op
        }
      }
    } catch {
      // no-op
    }

    return originalSend(body);
  };

  next();
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    const timestamp = getTimestamp();
    const message = error instanceof Error ? error.message : "Unknown error";

    console.log(
      `${colors.dim}[${timestamp}]${colors.reset} ` +
        `${colors.bright}${colors.red}💥 UNHANDLED ERROR:${colors.reset} ` +
        message,
    );

    if (error instanceof Error && error.stack) {
      console.log(
        `${colors.dim}   Stack:${colors.reset} ` +
          `${colors.red}${error.stack.split("\n").slice(0, 3).join("\n   ")}${colors.reset}`,
      );
    }

    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : undefined,
    });
  },
);

app.use(cors());
app.use(express.json({ limit: "50mb" }));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

// Types for Prisma enums
type ReactionKind =
  | "thumbs_up"
  | "love"
  | "smile"
  | "cry"
  | "side_eye"
  | "kind";
type EntryActivityType = "reaction" | "comment" | "reply";

const entrySchema = z.object({
  userId: z.string(),
  date: z.string(),
  count: z.number().int().min(1),
  note: z.string().max(280).nullable().optional(),
  tags: z.array(z.string().min(1)).max(6).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

const partialEntrySchema = entrySchema.partial();
const updateSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
  })
  .extend(partialEntrySchema.shape);

const ownerSchema = z.object({
  userId: z.string(),
});

const activitySchema = z
  .object({
    actorId: z.string(),
    type: z.enum(["reaction", "comment", "reply"]),
    content: z.string().max(280).optional(),
    reactionKind: z
      .enum(["thumbs_up", "love", "smile", "cry", "side_eye", "kind"])
      .optional(),
    parentId: z.string().optional(),
    targetCommentId: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === "reaction" && !value.reactionKind) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reactionKind"],
        message: "reactionKind is required for reaction type",
      });
    }

    if (
      (value.type === "comment" || value.type === "reply") &&
      !value.content?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["content"],
        message: "content is required for comments and replies",
      });
    }
  });

const notificationReadSchema = z.object({
  userId: z.string(),
});

const uploadSchema = z.object({
  imageData: z.string().min(1),
});

const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  loveName: z.string().min(1),
  track: z.string().min(1),
});

const getWeekStart = (isoDate: string) => {
  try {
    const parsed = new Date(isoDate);
    return startOfWeek(parsed, { weekStartsOn: 1 });
  } catch {
    console.log(
      `${colors.yellow}⚠ Invalid date format: ${isoDate}${colors.reset}`,
    );
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  }
};

const serializeTags = (tags?: string[] | null) => {
  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return null;
  }
  const validTags = tags.filter(
    (tag) => tag && typeof tag === "string" && tag.trim().length > 0,
  );
  return validTags.length > 0 ? validTags.join(",") : null;
};

const deserializeTags = (value?: string | null) => {
  if (!value || typeof value !== "string") {
    return [];
  }
  try {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  } catch (error) {
    console.log(
      `${colors.yellow}⚠ Error deserializing tags:${colors.reset}`,
      error,
    );
    return [];
  }
};

const mapEntry = (entry: any) => {
  if (!entry || typeof entry !== "object") {
    return entry;
  }

  return {
    id: entry.id,
    userId: entry.userId,
    date: entry.date,
    weekStart: entry.weekStart,
    count: entry.count,
    note: entry.note || null,
    tags: deserializeTags(entry.tags),
    imageUrl: entry.imageUrl || null,
    editedAt: entry.editedAt || null,
    user: entry.user,
    unreadActivityCount: Array.isArray(entry.notifications)
      ? entry.notifications.length
      : 0,
    activitySummary: entry.activitySummary || {
      commentCount: 0,
      reactionCount: 0,
      reactions: {
        thumbs_up: 0,
        love: 0,
        smile: 0,
        cry: 0,
        side_eye: 0,
        kind: 0,
      },
    },
  };
};

const hasCloudinaryConfig = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
  );
};

const extractPublicId = (url: string): string | null => {
  try {
    const match = url.match(
      /\/upload\/(?:v\d+\/)?(.+?)\.(?:jpg|jpeg|png|gif|webp|bmp|tiff)/i,
    );
    if (match && match[1]) {
      return match[1];
    }

    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    const publicId = filename.split(".")[0];

    return publicId.replace(/^v\d+\//, "");
  } catch (error) {
    console.log(
      `${colors.yellow}⚠ Could not extract public ID from URL: ${url}${colors.reset}`,
    );
    return null;
  }
};

const deleteImageFromCloudinary = async (
  imageUrl: string,
): Promise<boolean> => {
  if (!hasCloudinaryConfig()) {
    console.log(
      `${colors.yellow}⚠ Cloudinary not configured, skipping image deletion${colors.reset}`,
    );
    return false;
  }

  try {
    const publicId = extractPublicId(imageUrl);
    if (!publicId) {
      console.log(
        `${colors.yellow}⚠ Could not extract public ID from URL: ${imageUrl}${colors.reset}`,
      );
      return false;
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      console.log(
        `${colors.green}✓ Deleted image from Cloudinary: ${publicId}${colors.reset}`,
      );
      return true;
    } else {
      console.log(
        `${colors.yellow}⚠ Cloudinary deletion result: ${result.result} for ${publicId}${colors.reset}`,
      );
      return false;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    console.log(
      `${colors.yellow}⚠ Failed to delete image from Cloudinary:${colors.reset}`,
      message,
    );
    return false;
  }
};

// Routes
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    timestamp: getTimestamp(),
    environment: process.env.NODE_ENV || "production",
  });
});

app.get("/users", async (_req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    console.error(
      `${colors.red}✗ Database error in /users:${colors.reset}`,
      message,
    );
    res.status(500).json({
      error: "Database error",
      message: "Could not fetch users.",
    });
  }
});

app.post("/users", async (req, res) => {
  try {
    const parsed = userSchema.array().safeParse(req.body);
    if (!parsed.success) {
      console.log(
        `${colors.yellow}⚠ Validation failed for /users${colors.reset}`,
      );
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    const created = await prisma.$transaction(
      parsed.data.map((user) =>
        prisma.user.upsert({
          where: { id: user.id },
          create: user,
          update: user,
        }),
      ),
    );

    console.log(
      `${colors.green}✓ Created/updated ${created.length} users${colors.reset}`,
    );
    res.status(201).json(created);
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    console.error(
      `${colors.red}✗ Transaction failed in /users:${colors.reset}`,
      message,
    );
    res.status(500).json({
      error: "Transaction failed",
      message: "Could not save users.",
    });
  }
});

app.get("/entries", async (req, res) => {
  try {
    const weekStart = req.query.weekStart as string | undefined;
    const date = req.query.date as string | undefined;
    const userId = req.query.userId as string | undefined;

    const where: any = {};

    if (weekStart) {
      where.weekStart = new Date(weekStart);
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    console.log(
      `${colors.cyan}📅 Filtering entries with:${colors.reset}`,
      where,
    );

    const entries = await prisma.entry.findMany({
      where,
      include: {
        user: true,
        notifications: userId
          ? {
              where: {
                userId,
                isRead: false,
              },
              select: { id: true },
            }
          : false,
      },
      orderBy: { date: "desc" },
    });

    const entryIds = entries.map((entry) => entry.id);
    const activities =
      entryIds.length > 0
        ? await prisma.entryActivity.findMany({
            where: { entryId: { in: entryIds } },
            select: { entryId: true, type: true, reactionKind: true },
          })
        : [];

    const defaultSummary = () => ({
      commentCount: 0,
      reactionCount: 0,
      reactions: {
        thumbs_up: 0,
        love: 0,
        smile: 0,
        cry: 0,
        side_eye: 0,
        kind: 0,
      },
    });

    const summaryMap: Record<string, ReturnType<typeof defaultSummary>> = {};

    for (const activity of activities) {
      if (!summaryMap[activity.entryId]) {
        summaryMap[activity.entryId] = defaultSummary();
      }

      if (activity.type === "reaction" && activity.reactionKind) {
        summaryMap[activity.entryId].reactionCount += 1;
        summaryMap[activity.entryId].reactions[activity.reactionKind] += 1;
      } else if (activity.type === "comment" || activity.type === "reply") {
        summaryMap[activity.entryId].commentCount += 1;
      }
    }

    const mappedEntries = entries.map((entry) =>
      mapEntry({
        ...entry,
        activitySummary: summaryMap[entry.id] || defaultSummary(),
      }),
    );

    console.log(
      `${colors.green}✓ Found ${entries.length} entries${colors.reset}`,
    );
    res.json(mappedEntries);
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    console.error(
      `${colors.red}✗ Database error in /entries:${colors.reset}`,
      message,
    );
    res.status(500).json({
      error: "Database error",
      message: "Could not fetch entries.",
    });
  }
});

app.get("/entries/:id/activities", async (req, res) => {
  try {
    const activities = await prisma.entryActivity.findMany({
      where: { entryId: req.params.id },
      include: { actor: true },
      orderBy: { createdAt: "asc" },
    });

    const comments = activities.filter(
      (activity) => activity.type === "comment" || activity.type === "reply",
    );
    const reactions = activities.filter(
      (activity) => activity.type === "reaction",
    );

    res.json({ comments, reactions });
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    console.error(
      `${colors.red}✗ Failed to fetch activities:${colors.reset}`,
      message,
    );
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

app.post("/entries/:id/activities", async (req, res) => {
  try {
    const parsed = activitySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    const entry = await prisma.entry.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    const actor = await prisma.user.findUnique({
      where: { id: parsed.data.actorId },
    });
    if (!actor) {
      return res.status(404).json({ error: "Actor not found" });
    }

    // For reactions - handle toggle
    if (parsed.data.type === "reaction") {
      const targetId = parsed.data.targetCommentId || null;

      const existingReaction = await prisma.entryActivity.findFirst({
        where: {
          entryId: entry.id,
          actorId: parsed.data.actorId,
          type: "reaction",
          targetCommentId: targetId,
        },
      });

      if (existingReaction) {
        if (existingReaction.reactionKind === parsed.data.reactionKind) {
          await prisma.entryActivity.delete({
            where: { id: existingReaction.id },
          });

          await prisma.notification.deleteMany({
            where: { activityId: existingReaction.id },
          });

          return res.status(200).json({
            message: "Reaction removed",
            action: "removed",
            reactionKind: parsed.data.reactionKind,
          });
        } else {
          const updated = await prisma.entryActivity.update({
            where: { id: existingReaction.id },
            data: { reactionKind: parsed.data.reactionKind },
          });
          return res.status(200).json(updated);
        }
      }
    }

    // Validate parent comment if needed
    if (parsed.data.parentId) {
      const parentComment = await prisma.entryActivity.findFirst({
        where: { id: parsed.data.parentId, entryId: entry.id },
      });
      if (!parentComment) {
        return res.status(404).json({ error: "Parent comment not found" });
      }
    }

    // Validate target comment if needed
    if (parsed.data.targetCommentId) {
      const targetComment = await prisma.entryActivity.findFirst({
        where: { id: parsed.data.targetCommentId, entryId: entry.id },
      });
      if (!targetComment) {
        return res.status(404).json({ error: "Target comment not found" });
      }
    }

    const activity = await prisma.entryActivity.create({
      data: {
        entryId: entry.id,
        actorId: parsed.data.actorId,
        type: parsed.data.type,
        content: parsed.data.content?.trim() || null,
        reactionKind: parsed.data.reactionKind,
        parentId: parsed.data.parentId || null,
        targetCommentId: parsed.data.targetCommentId || null,
      },
    });

    // Create notifications
    const recipientIds = new Set<string>();

    if (entry.userId !== parsed.data.actorId) {
      recipientIds.add(entry.userId);
    }

    if (parsed.data.parentId) {
      const parent = await prisma.entryActivity.findUnique({
        where: { id: parsed.data.parentId },
      });
      if (parent && parent.actorId !== parsed.data.actorId) {
        recipientIds.add(parent.actorId);
      }
    }

    if (parsed.data.targetCommentId) {
      const target = await prisma.entryActivity.findUnique({
        where: { id: parsed.data.targetCommentId },
      });
      if (target && target.actorId !== parsed.data.actorId) {
        recipientIds.add(target.actorId);
      }
    }

    if (recipientIds.size > 0) {
      await prisma.notification.createMany({
        data: Array.from(recipientIds).map((userId) => ({
          userId,
          actorId: parsed.data.actorId,
          entryId: entry.id,
          activityId: activity.id,
          type: parsed.data.type,
          isRead: false,
        })),
      });
    }

    res.status(201).json(activity);
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    console.error(
      `${colors.red}✗ Failed to create activity:${colors.reset}`,
      message,
    );
    res.status(500).json({ error: "Failed to create activity" });
  }
});

app.get("/notifications/summary", async (req, res) => {
  try {
    const parsed = notificationReadSchema.safeParse(req.query);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: parsed.error.flatten() });
    }

    const unreadCount = await prisma.notification.count({
      where: {
        userId: parsed.data.userId,
        isRead: false,
      },
    });

    res.json({ unreadCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    console.error(
      `${colors.red}✗ Failed to load notification summary:${colors.reset}`,
      message,
    );
    res.status(500).json({ error: "Failed to load notification summary" });
  }
});

app.post("/entries/:id/notifications/read", async (req, res) => {
  try {
    const parsed = notificationReadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: parsed.error.flatten() });
    }

    await prisma.notification.updateMany({
      where: {
        entryId: req.params.id,
        userId: parsed.data.userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    console.error(
      `${colors.red}✗ Failed to mark notifications read:${colors.reset}`,
      message,
    );
    res.status(500).json({ error: "Failed to mark notifications read" });
  }
});

app.get("/entries/:id/image", async (req, res) => {
  try {
    const entry = await prisma.entry.findUnique({
      where: { id: req.params.id },
    });
    if (!entry || !entry.imageUrl) {
      return res.status(404).json({ error: "Image not found" });
    }
    res.json({ url: entry.imageUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    console.error(
      `${colors.red}✗ Failed to fetch entry image:${colors.reset}`,
      message,
    );
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

app.get("/weekly-summary", async (req, res) => {
  try {
    const weekStart = req.query.weekStart as string | undefined;
    const activeWeek = weekStart
      ? new Date(weekStart)
      : getWeekStart(new Date().toISOString());

    const entries = await prisma.entry.findMany({
      where: { weekStart: activeWeek },
    });

    const totals = entries.reduce<Record<string, number>>((acc, entry) => {
      if (entry && entry.userId) {
        acc[entry.userId] = (acc[entry.userId] ?? 0) + (entry.count || 0);
      }
      return acc;
    }, {});

    console.log(`${colors.green}✓ Weekly summary calculated${colors.reset}`);
    res.json({
      weekStart: activeWeek,
      totals,
      entryCount: entries.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    console.error(
      `${colors.red}✗ Error calculating weekly summary:${colors.reset}`,
      message,
    );
    res.status(500).json({
      error: "Calculation error",
      message: "Could not calculate weekly summary.",
    });
  }
});

app.post("/uploads", async (req, res) => {
  try {
    if (!hasCloudinaryConfig()) {
      console.log(`${colors.red}✗ Cloudinary not configured${colors.reset}`);
      return res.status(400).json({
        error: "Cloudinary not configured",
        message: "Image upload service is not available.",
      });
    }

    const parsed = uploadSchema.safeParse(req.body);
    if (!parsed.success) {
      console.log(
        `${colors.yellow}⚠ Validation failed for /uploads${colors.reset}`,
      );
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    const result = await cloudinary.uploader.upload(parsed.data.imageData, {
      folder: "tally",
    });

    console.log(`${colors.green}✓ Image uploaded to Cloudinary${colors.reset}`);
    console.log(`${colors.dim}   URL: ${result.secure_url}${colors.reset}`);
    res.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    console.error(
      `${colors.red}✗ Cloudinary upload failed:${colors.reset}`,
      message,
    );
    res.status(500).json({
      error: "Upload failed",
      message: "Could not upload image.",
    });
  }
});

app.post("/entries", async (req, res) => {
  try {
    const parsed = entrySchema.safeParse(req.body);
    if (!parsed.success) {
      console.log(
        `${colors.yellow}⚠ Validation failed for /entries${colors.reset}`,
      );
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    const { userId, date, count, note, tags, imageUrl } = parsed.data;
    const weekStart = getWeekStart(date);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.log(`${colors.red}✗ User not found: ${userId}${colors.reset}`);
      return res.status(404).json({
        error: "User not found",
        message: "The specified user does not exist.",
      });
    }

    const entry = await prisma.entry.create({
      data: {
        userId,
        date: new Date(date),
        weekStart,
        count,
        note: note || null,
        tags: serializeTags(tags || null),
        imageUrl: imageUrl || null,
      },
    });

    console.log(
      `${colors.green}✓ Entry created for ${user.name}${colors.reset}`,
    );
    res.status(201).json(mapEntry(entry));
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    console.error(
      `${colors.red}✗ Failed to create entry:${colors.reset}`,
      message,
    );
    res.status(500).json({
      error: "Failed to create entry",
      message: "Could not save the entry.",
    });
  }
});

app.put("/entries/:id", async (req, res) => {
  try {
    const parsed = updateSchema.safeParse({ ...req.body, id: req.params.id });
    if (!parsed.success) {
      console.log(
        `${colors.yellow}⚠ Validation failed for /entries/:id${colors.reset}`,
      );
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    const { id, userId, date, count, note, tags, imageUrl } = parsed.data;

    const entry = await prisma.entry.findUnique({ where: { id } });
    if (!entry) {
      console.log(`${colors.red}✗ Entry not found: ${id}${colors.reset}`);
      return res.status(404).json({
        error: "Entry not found",
        message: "The specified entry does not exist.",
      });
    }

    if (entry.userId !== userId) {
      console.log(
        `${colors.red}✗ Unauthorized update attempt for entry ${id}${colors.reset}`,
      );
      return res.status(403).json({
        error: "Not allowed",
        message: "You can only update your own entries.",
      });
    }

    const updateData: any = { editedAt: new Date() };

    if (date !== undefined) {
      updateData.date = new Date(date);
      updateData.weekStart = getWeekStart(date);
    }

    if (count !== undefined) updateData.count = count;
    if (note !== undefined) updateData.note = note;
    if (tags !== undefined) updateData.tags = serializeTags(tags);

    if (imageUrl !== undefined) {
      if (entry.imageUrl) {
        if (imageUrl === null || imageUrl !== entry.imageUrl) {
          console.log(
            `${colors.cyan}🔄 Deleting old image from Cloudinary${colors.reset}`,
          );
          await deleteImageFromCloudinary(entry.imageUrl);
        }
      }
      updateData.imageUrl = imageUrl;
    }

    const updated = await prisma.entry.update({
      where: { id },
      data: updateData,
    });

    console.log(`${colors.green}✓ Entry ${id} updated${colors.reset}`);
    res.json(mapEntry(updated));
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    console.error(
      `${colors.red}✗ Failed to update entry:${colors.reset}`,
      message,
    );
    res.status(500).json({
      error: "Failed to update entry",
      message: "Could not update the entry.",
    });
  }
});

app.delete("/entries/:id", async (req, res) => {
  try {
    const parsed = ownerSchema.safeParse(req.body);
    if (!parsed.success) {
      console.log(
        `${colors.yellow}⚠ Validation failed for DELETE /entries/:id${colors.reset}`,
      );
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    const entry = await prisma.entry.findUnique({
      where: { id: req.params.id },
    });

    if (!entry) {
      console.log(
        `${colors.red}✗ Entry not found: ${req.params.id}${colors.reset}`,
      );
      return res.status(404).json({
        error: "Entry not found",
        message: "The specified entry does not exist.",
      });
    }

    if (entry.userId !== parsed.data.userId) {
      console.log(
        `${colors.red}✗ Unauthorized delete attempt for entry ${req.params.id}${colors.reset}`,
      );
      return res.status(403).json({
        error: "Not allowed",
        message: "You can only delete your own entries.",
      });
    }

    if (entry.imageUrl) {
      console.log(
        `${colors.cyan}🔄 Deleting image from Cloudinary${colors.reset}`,
      );
      await deleteImageFromCloudinary(entry.imageUrl);
    }

    await prisma.entry.delete({ where: { id: req.params.id } });

    console.log(
      `${colors.green}✓ Entry ${req.params.id} deleted${colors.reset}`,
    );
    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    console.error(
      `${colors.red}✗ Failed to delete entry:${colors.reset}`,
      message,
    );
    res.status(500).json({
      error: "Failed to delete entry",
      message: "Could not delete the entry.",
    });
  }
});

app.use((req, res) => {
  console.log(
    `${colors.dim}[${getTimestamp()}]${colors.reset} ` +
      `${colors.bright}${colors.yellow}↪ ${req.method} ${req.path} 404${colors.reset} ` +
      `${colors.dim}(Route not found)${colors.reset}`,
  );
  res.status(404).json({
    error: "Route not found",
    message: `The route ${req.method} ${req.path} does not exist.`,
  });
});

console.clear();
console.log(`${colors.bright}${colors.magenta}
╔══════════════════════════════════════════╗
║          TALLY BACKEND STARTING          ║
╚══════════════════════════════════════════╝${colors.reset}`);

(async () => {
  try {
    await prisma.$connect();
    console.log(`${colors.green}✅ Database connected${colors.reset}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : error;
    console.log(
      `${colors.red}⚠ Database connection failed:${colors.reset}`,
      message,
    );
  }
})();

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

process.on("SIGTERM", async () => {
  console.log(
    `${colors.yellow}🔄 SIGTERM received, shutting down...${colors.reset}`,
  );
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log(
    `${colors.yellow}🔄 SIGINT received, shutting down...${colors.reset}`,
  );
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(port, () => {
  console.log(
    `\n${colors.bright}${colors.green}✅ API Server Ready${colors.reset}`,
  );
  console.log(
    `${colors.dim}└─ Port:${colors.reset} ${colors.cyan}${port}${colors.reset}`,
  );
  console.log(
    `${colors.dim}└─ Time:${colors.reset} ${colors.white}${getTimestamp()}${colors.reset}`,
  );
  console.log(
    `${colors.dim}└─ Environment:${colors.reset} ${colors.yellow}${process.env.NODE_ENV || "development"}${colors.reset}\n`,
  );
  console.log(
    `${colors.dim}${colors.bright}📡 Waiting for requests...${colors.reset}\n`,
  );
});
