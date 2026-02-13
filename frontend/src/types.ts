export type User = {
  id: string;
  name: string;
  loveName: string;
  track: string;
};

export type EntryComment = {
  id: string;
  entryId: string;
  userId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    loveName: string;
  } | null;
};

export type Entry = {
  id: string;
  userId: string;
  date: string;
  weekStart: string;
  count: number;
  note: string | null;
  tags: string[];
  imageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
  editedAt: string | null;
  user: User;
  hasUnseenActivity?: boolean;
  commentCount?: number;
  reactionCount?: number;
  reactionGroups?: Record<string, number>;
  latestActivityAt?: string | null;
  lastSeenAt?: string | null;
};

export type WeeklySummary = {
  weekStart: string;
  totals: Record<string, number>;
};

export type ActiveTab = "dashboard" | "new" | "history";

export const USER_PINS = {
  "0424": { id: "tekta", name: "Tekta", loveName: "Shefafit", track: "males" },
  "1221": { id: "yihun", name: "Yihun", loveName: "Shebeto", track: "females" },
  "0427": { id: "judge", name: "Judge", loveName: "Judge", track: "judge" },
} as const;
