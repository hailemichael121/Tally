export type User = {
  id: string;
  name: string;
  loveName: string;
  track: string;
};

export type EntryActivityType = "reaction" | "comment" | "reply";
export type ReactionKind =
  | "thumbs_up"
  | "love"
  | "smile"
  | "cry"
  | "side_eye"
  | "kind";

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
  unreadActivityCount?: number;
  activitySummary?: {
    commentCount: number;
    reactionCount: number;
    reactions: Record<ReactionKind, number>;
  };
  user: User;
};

export type EntryActivity = {
  id: string;
  entryId: string;
  actorId: string;
  type: EntryActivityType;
  content: string | null;
  reactionKind: ReactionKind | null;
  parentId: string | null;
  targetCommentId: string | null;
  createdAt: string;
  actor: User;
};

export type EntryActivitiesResponse = {
  comments: EntryActivity[];
  reactions: EntryActivity[];
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
