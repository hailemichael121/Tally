import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ToastProvider, useToast } from "./contexts/ToastContext";
import ToastContainer from "./components/ToastContainer";
import {
  USER_PINS,
  User,
  Entry,
  WeeklySummary,
  ActiveTab,
  EntryActivitiesResponse,
  ReactionKind,
} from "./types";
import Header from "./components/Header";
import JudgeView from "./components/JudgeView";
import WeeklyTotals from "./components/WeeklyTotals";
import WeeklyStatus from "./components/WeeklyStatus";
import PinLock from "./components/PinLock";
import DailyBreakdown from "./components/DailyBreakdown";
import BottomNav from "./components/BottomNav";
import EntryModal from "./components/EntryModal";
import EntryForm from "./components/EntryForm";
import ImageZoom from "./components/ImageZoom";
import ThemeToggle from "./components/ThemeToggle";
import { ThemeContext } from "./contexts/ThemeContext";
import { LoadingProvider, useLoading } from "./contexts/LoadingContext";
import SmartSkeleton from "./components/SmartSkeleton";
import {
  HeaderSkeleton,
  WeeklyTotalsSkeleton,
  WeeklyStatusSkeleton,
  DailyBreakdownSkeleton,
  BottomNavSkeleton,
  FullPageSkeleton,
} from "./components/skeletons";
import { useDataLoader } from "./contexts/useDataLoader";

const API_URL: string = import.meta.env.VITE_API_URL as string;

const STORAGE_KEY = "tally-active-user";
const THEME_STORAGE_KEY = "tally-theme";

const formatWeek = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));

const weekStartFromDate = (value: string) => {
  const date = new Date(value);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
};

function AppContent() {
  const { addToast } = useToast();
  const { isLoading } = useLoading();
  const [pinValue, setPinValue] = useState("");
  const [unlockedUser, setUnlockedUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState("");
  const [activeDate, setActiveDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const {
    users,
    setUsers,
    entries,
    setEntries,
    weeklySummary,
    setWeeklySummary,
    loadAllData,
    loadEntries,
    loadSummary,
  } = useDataLoader();

  const [activeUserId, setActiveUserId] = useState<string>("");
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState({
    id: "",
    count: "",
    tags: "",
    note: "",
    date: "",
    imageFile: null as File | null,
    imageUrl: null as string | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">(
    () =>
      (localStorage.getItem(THEME_STORAGE_KEY) as "light" | "dark") || "light",
  );

  const refreshNotificationSummary = async (userId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/notifications/summary?userId=${encodeURIComponent(userId)}`,
      );
      if (!response.ok) return;
      const data = await response.json();
      setUnreadNotificationCount(data.unreadCount || 0);
    } catch (_error) {
      // no-op for subtle notifications
    }
  };

  const markEntryNotificationsAsRead = async (
    entryId: string,
    userId: string,
  ) => {
    try {
      await fetch(`${API_URL}/entries/${entryId}/notifications/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      await loadEntries(selectedWeekStart || undefined, undefined, userId);
      refreshNotificationSummary(userId);
    } catch (_error) {
      // no-op
    }
  };

  const handleEntryClick = async (entry: Entry) => {
    setSelectedEntry(entry);
    if (activeUserId && (entry.unreadActivityCount || 0) > 0) {
      markEntryNotificationsAsRead(entry.id, activeUserId);
    }
  };

  const addEntryActivity = async (
    entryId: string,
    type: "reaction" | "comment" | "reply",
    payload?: {
      content?: string;
      reactionKind?: ReactionKind;
      parentId?: string;
      targetCommentId?: string;
    },
  ) => {
    if (!activeUserId) return;

    await fetch(`${API_URL}/entries/${entryId}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actorId: activeUserId,
        type,
        content: payload?.content,
        reactionKind: payload?.reactionKind,
        parentId: payload?.parentId,
        targetCommentId: payload?.targetCommentId,
      }),
    });

    await loadEntries(selectedWeekStart || undefined, undefined, activeUserId);
    refreshNotificationSummary(activeUserId);
  };

  const loadEntryActivities = async (
    entryId: string,
  ): Promise<EntryActivitiesResponse> => {
    const response = await fetch(`${API_URL}/entries/${entryId}/activities`);
    if (!response.ok) return { comments: [], reactions: [] };
    return response.json();
  };

  const isDarkTheme = theme === "dark";
  const activeUser =
    unlockedUser ?? users.find((user) => user.id === activeUserId) ?? null;
  const weekLabel = weeklySummary
    ? `Week of ${formatWeek(weeklySummary.weekStart)}`
    : "Week of Feb 9";
  const weekNumber = 1;
  const isJudge = activeUserId === "judge";

  const handlePinSubmit = () => {
    setAuthError("");
    const user = USER_PINS[pinValue as keyof typeof USER_PINS];

    if (user) {
      setActiveUserId(user.id);
      setUnlockedUser(user);
      setPinValue("");
      localStorage.setItem(STORAGE_KEY, user.id);
      loadAllData(user.id);
      addToast(`Welcome back, ${user.name}!`, "success");
    } else {
      setAuthError("mock and jock yo scammer try again pls");
      setPinValue("");
      addToast("Invalid PIN. Please try again.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUnlockedUser(null);
    setActiveUserId("");
    setEntries([]);
    setWeeklySummary(null);
    setSelectedEntry(null);
    setIsFormOpen(false);
    addToast("Logged out successfully", "info");
  };

  const handleCreateEntry = async (entryData: any) => {
    if (!activeUserId || isJudge) return;
    const tempId = `temp-${Date.now()}`;
    const tempEntry: Entry = {
      id: tempId,
      userId: activeUserId,
      date: new Date(entryData.date).toISOString(),
      weekStart: weekStartFromDate(entryData.date),
      count: Number(entryData.count),
      note: entryData.note || null,
      tags:
        entryData.tags
          ?.split(",")
          .map((t: string) => t.trim())
          .filter(Boolean) || [],
      imageUrl: entryData.imageUrl || null,
      editedAt: null,
      user: activeUser!,
    };

    setEntries((prev) => [tempEntry, ...prev]);
    setIsFormOpen(false);
    setSelectedEntry(null);
    addToast("Creating entry...", "info");

    try {
      let imageUrl: string | undefined;
      if (entryData.imageFile) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Upload failed"));
          reader.readAsDataURL(entryData.imageFile);
        });

        const uploadResponse = await fetch(`${API_URL}/uploads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: dataUrl }),
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url;
        }
      }

      const payload = {
        userId: activeUserId,
        date: new Date(entryData.date).toISOString(),
        count: Number(entryData.count),
        tags: entryData.tags
          ? entryData.tags
              .split(",")
              .map((tag: string) => tag.trim())
              .filter(Boolean)
          : undefined,
        note: entryData.note || undefined,
        imageUrl,
      };

      const response = await fetch(`${API_URL}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const createdEntry = await response.json();
        setEntries((prev) =>
          prev.map((entry) => (entry.id === tempId ? createdEntry : entry)),
        );
        loadSummary(selectedWeekStart || undefined);
        addToast("Entry created successfully!", "success");
      } else {
        throw new Error("Failed to create entry");
      }
    } catch (error) {
      setEntries((prev) => prev.filter((entry) => entry.id !== tempId));
      setIsFormOpen(true);
      addToast("Failed to create entry", "error");
    }
  };

  const handleUpdateEntry = async (entryData: any) => {
    if (!activeUserId || isJudge) return;
    const originalEntry = entries.find((e) => e.id === entryData.id);
    if (!originalEntry) return;

    const updatedEntry: Entry = {
      ...originalEntry,
      count: Number(entryData.count),
      note: entryData.note || null,
      tags:
        entryData.tags
          ?.split(",")
          .map((t: string) => t.trim())
          .filter(Boolean) || [],
      date: new Date(entryData.date).toISOString(),
      weekStart: weekStartFromDate(entryData.date),
      editedAt: new Date().toISOString(),
    };

    setEntries((prev) =>
      prev.map((entry) => (entry.id === entryData.id ? updatedEntry : entry)),
    );
    setIsFormOpen(false);
    setSelectedEntry(null);
    addToast("Updating entry...", "info");

    try {
      const changes: any = { userId: activeUserId };

      if (Number(entryData.count) !== originalEntry.count) {
        changes.count = Number(entryData.count);
      }
      if (entryData.note !== originalEntry.note) {
        changes.note = entryData.note || null;
      }
      if (
        entryData.date &&
        new Date(entryData.date).toISOString() !== originalEntry.date
      ) {
        changes.date = new Date(entryData.date).toISOString();
      }

      const newTags =
        entryData.tags
          ?.split(",")
          .map((t: string) => t.trim())
          .filter(Boolean) || [];
      const originalTags = originalEntry.tags || [];
      if (
        JSON.stringify(newTags.sort()) !== JSON.stringify(originalTags.sort())
      ) {
        changes.tags = newTags;
      }

      let imageUrl = originalEntry.imageUrl;
      if (entryData.imageFile) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Upload failed"));
          reader.readAsDataURL(entryData.imageFile);
        });

        const uploadResponse = await fetch(`${API_URL}/uploads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: dataUrl }),
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url;
          changes.imageUrl = imageUrl;
        }
      } else if (imagePreviewUrl === null && originalEntry.imageUrl) {
        changes.imageUrl = null;
      }

      if (Object.keys(changes).length > 1) {
        const response = await fetch(`${API_URL}/entries/${entryData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changes),
        });

        if (response.ok) {
          const serverUpdatedEntry = await response.json();
          setEntries((prev) =>
            prev.map((entry) =>
              entry.id === entryData.id ? serverUpdatedEntry : entry,
            ),
          );
          loadSummary(selectedWeekStart || undefined);
          addToast("Entry updated successfully!", "success");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update entry");
        }
      } else {
        addToast("No changes detected", "info");
      }
    } catch (error) {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryData.id ? originalEntry : entry,
        ),
      );
      setIsFormOpen(true);
      addToast("Failed to update entry", "error");
    }
  };

  const handleDeleteEntry = async (entry: Entry) => {
    if (!activeUserId || entry.userId !== activeUserId || isJudge) return;
    const originalEntries = [...entries];
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    setSelectedEntry(null);
    addToast("Deleting entry...", "info");

    try {
      const response = await fetch(`${API_URL}/entries/${entry.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUserId }),
      });

      if (response.ok) {
        loadSummary(selectedWeekStart || undefined);
        addToast("Entry deleted successfully!", "success");
      } else {
        throw new Error("Failed to delete entry");
      }
    } catch (error) {
      setEntries(originalEntries);
      addToast("Failed to delete entry", "error");
    }
  };

  const openNewEntry = () => {
    if (!activeUserId || isJudge) return;
    setFormState({
      id: "",
      count: "",
      tags: "",
      note: "",
      date: new Date().toISOString().slice(0, 10),
      imageFile: null,
      imageUrl: null,
    });
    setImagePreviewUrl(null);
    setIsFormOpen(true);
  };

  const openEditEntry = (entry: Entry) => {
    setFormState({
      id: entry.id,
      count: String(entry.count),
      tags: entry.tags?.join(", ") ?? "",
      note: entry.note ?? "",
      date: entry.date.slice(0, 10),
      imageFile: null,
      imageUrl: entry.imageUrl,
    });
    setImagePreviewUrl(entry.imageUrl);
    setIsFormOpen(true);
  };

  const handleSaveEntry = async () => {
    if (!activeUserId || isJudge) return;
    setIsSubmitting(true);
    if (formState.id) {
      await handleUpdateEntry(formState);
    } else {
      await handleCreateEntry(formState);
    }
    setIsSubmitting(false);
  };

  const handleTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === "new") {
      openNewEntry();
      return;
    }
    const target = document.getElementById(tab);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const user = Object.values(USER_PINS).find((item) => item.id === stored);
    if (user) {
      setActiveUserId(user.id);
      setUnlockedUser(user);
      loadAllData(user.id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!formState.imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const preview = URL.createObjectURL(formState.imageFile);
    setImagePreviewUrl(preview);
    return () => URL.revokeObjectURL(preview);
  }, [formState.imageFile]);

  useEffect(() => {
    if (activeUserId) {
      loadAllData(activeUserId);
      refreshNotificationSummary(activeUserId);
    }
  }, [activeUserId]);

  useEffect(() => {
    if (activeUserId) {
      const week = selectedWeekStart || undefined;
      loadEntries(week, undefined, activeUserId);
      loadSummary(week);
    }
  }, [selectedWeekStart, activeUserId]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Show full page skeleton only on initial load with no data
  if (isLoading("users") && users.length === 0) {
    return <FullPageSkeleton />;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="app-shell min-h-screen">
        <ThemeToggle
          isDark={isDarkTheme}
          onToggle={() =>
            setTheme((prev) => (prev === "dark" ? "light" : "dark"))
          }
        />

        {!activeUserId && (
          <PinLock
            pinValue={pinValue}
            setPinValue={setPinValue}
            authError={authError}
            onPinSubmit={handlePinSubmit}
          />
        )}

        <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-24 pt-10 sm:px-8">
          <SmartSkeleton loadingKey="users" skeleton={<HeaderSkeleton />}>
            <Header
              activeUser={activeUser}
              weekNumber={weekNumber}
              weekLabel={weekLabel}
              onLogout={handleLogout}
            />
          </SmartSkeleton>

          <JudgeView isJudge={isJudge} />

          <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <SmartSkeleton
              loadingKey="summary"
              skeleton={<WeeklyTotalsSkeleton />}
            >
              <WeeklyTotals
                activeUserId={activeUserId}
                users={users}
                weeklySummary={weeklySummary}
              />
            </SmartSkeleton>

            <SmartSkeleton
              loadingKey="summary"
              skeleton={<WeeklyStatusSkeleton />}
            >
              <WeeklyStatus
                activeUserId={activeUserId}
                users={users}
                weeklySummary={weeklySummary}
                isJudge={isJudge}
              />
            </SmartSkeleton>
          </section>

          <SmartSkeleton
            loadingKey="entries"
            skeleton={<DailyBreakdownSkeleton />}
          >
            <DailyBreakdown
              entries={entries}
              selectedWeekStart={selectedWeekStart}
              onWeekChange={(weekStart) => {
                setSelectedWeekStart(weekStart);
                loadEntries(weekStart, undefined, activeUserId);
              }}
              onEntryClick={handleEntryClick}
              onDateSelect={(date) => {
                setActiveDate(date);
              }}
              activeUserId={activeUserId}
            />
          </SmartSkeleton>
        </main>

        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTab}
          onNewEntry={openNewEntry}
          canCreateEntry={Boolean(activeUserId) && !isJudge}
          hasUnreadNotifications={unreadNotificationCount > 0}
        />

        <AnimatePresence>
          {selectedEntry && (
            <EntryModal
              entry={selectedEntry}
              activeUserId={activeUserId}
              isJudge={isJudge}
              onClose={() => setSelectedEntry(null)}
              onEdit={openEditEntry}
              onDelete={handleDeleteEntry}
              onImageClick={setZoomImageUrl}
              onAddActivity={addEntryActivity}
              onLoadActivities={loadEntryActivities}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isFormOpen && (
            <EntryForm
              formState={formState}
              setFormState={setFormState}
              imagePreviewUrl={imagePreviewUrl}
              activeUser={activeUser}
              isSubmitting={isSubmitting}
              isJudge={isJudge}
              onClose={() => setIsFormOpen(false)}
              onSave={handleSaveEntry}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {zoomImageUrl && (
            <ImageZoom
              imageUrl={zoomImageUrl}
              onClose={() => setZoomImageUrl(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </ThemeContext.Provider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <LoadingProvider>
        <ToastContainerWrapper />
      </LoadingProvider>
    </ToastProvider>
  );
}

function ToastContainerWrapper() {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <AppContent />
    </>
  );
}
