import express from "express";
import cors from "cors";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { startOfWeek } from "date-fns";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const entrySchema = z.object({
  userId: z.string(),
  date: z.string(),
  count: z.number().int().min(1),
  note: z.string().min(1).max(280),
});

const updateSchema = entrySchema.extend({
  id: z.string(),
});

const ownerSchema = z.object({
  userId: z.string(),
});

const getWeekStart = (isoDate: string) => {
  const parsed = new Date(isoDate);
  return startOfWeek(parsed, { weekStartsOn: 1 });
};

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get("/entries", async (req, res) => {
  const weekStart = req.query.weekStart as string | undefined;
  const where = weekStart ? { weekStart: new Date(weekStart) } : {};
  const entries = await prisma.entry.findMany({
    where,
    include: { user: true },
    orderBy: { date: "desc" },
  });
  res.json(entries);
});

app.get("/weekly-summary", async (req, res) => {
  const weekStart = req.query.weekStart as string | undefined;
  const activeWeek = weekStart ? new Date(weekStart) : getWeekStart(new Date().toISOString());
  const entries = await prisma.entry.findMany({
    where: { weekStart: activeWeek },
  });

  const totals = entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.userId] = (acc[entry.userId] ?? 0) + entry.count;
    return acc;
  }, {});

  res.json({ weekStart: activeWeek, totals });
});

app.post("/entries", async (req, res) => {
  const parsed = entrySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { userId, date, count, note } = parsed.data;
  const weekStart = getWeekStart(date);

  const entry = await prisma.entry.create({
    data: {
      userId,
      date: new Date(date),
      weekStart,
      count,
      note,
    },
  });

  res.status(201).json(entry);
});

app.put("/entries/:id", async (req, res) => {
  const parsed = updateSchema.safeParse({ ...req.body, id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { id, userId, date, count, note } = parsed.data;
  const entry = await prisma.entry.findUnique({ where: { id } });
  if (!entry || entry.userId !== userId) {
    return res.status(403).json({ error: "Not allowed" });
  }

  const weekStart = getWeekStart(date);
  const updated = await prisma.entry.update({
    where: { id },
    data: { date: new Date(date), weekStart, count, note },
  });

  res.json(updated);
});

app.delete("/entries/:id", async (req, res) => {
  const parsed = ownerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const entry = await prisma.entry.findUnique({ where: { id: req.params.id } });
  if (!entry || entry.userId !== parsed.data.userId) {
    return res.status(403).json({ error: "Not allowed" });
  }

  await prisma.entry.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`API ready on :${port}`);
});
