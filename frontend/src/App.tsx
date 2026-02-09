import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ToastProvider, useToast } from "./contexts/ToastContext";
import ToastContainer from "./components/ToastContainer";
import { USER_PINS, User, Entry, WeeklySummary, ActiveTab } from "./types";
import Header from "./components/Header";
import JudgeView from "./components/JudgeView";
import WeeklyTotals from "./components/WeeklyTotals";
import WeeklyStatus from "./components/WeeklyStatus";
import PinLock from "./components/PinLock";
import DailyBreakdown from "./components/DailyBreakdown";
import NewEntrySection from "./components/NewEntrySection";
import BottomNav from "./components/BottomNav";
import EntryModal from "./components/EntryModal";
import EntryForm from "./components/EntryForm";
import ImageZoom from "./components/ImageZoom";
import LoadingSkeleton from "./components/LoadingSkeleton";

const API_URL = "https://tally-bibx.onrender.com";
const STORAGE_KEY = "tally-active-user";

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
  const [pinValue, setPinValue] = useState("");
  const [unlockedUser, setUnlockedUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState("");

  const [users, setUsers] = useState<User[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(
    null,
  );
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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const loadAllData = async (_activeUserId?: string) => {
    setIsLoading(true);
    try {
      const usersResponse = await fetch(`${API_URL}/users`);
      const usersData = (await usersResponse.json()) as User[];
      setUsers(usersData);

      const entriesResponse = await fetch(`${API_URL}/entries`);
      const entriesData = (await entriesResponse.json()) as Entry[];
      setEntries(entriesData);

      const summaryResponse = await fetch(`${API_URL}/weekly-summary`);
      const summaryData = (await summaryResponse.json()) as WeeklySummary;
      setWeeklySummary(summaryData);
    } catch (error) {
      console.error("Failed to load data:", error);
      addToast("Failed to load data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadEntries = async (weekStart?: string) => {
    const query = weekStart
      ? `?weekStart=${encodeURIComponent(weekStart)}`
      : "";
    const response = await fetch(`${API_URL}/entries${query}`);
    const data = (await response.json()) as Entry[];
    setEntries(data);
  };

  const loadSummary = async (weekStart?: string) => {
    const query = weekStart
      ? `?weekStart=${encodeURIComponent(weekStart)}`
      : "";
    const response = await fetch(`${API_URL}/weekly-summary${query}`);
    const data = (await response.json()) as WeeklySummary;
    setWeeklySummary(data);
  };

  // OPTIMISTIC CREATE
  const handleCreateEntry = async (entryData: any) => {
    if (!activeUserId || isJudge) return;

    // Generate temporary ID for optimistic update
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

    // Optimistic update
    setEntries((prev) => [tempEntry, ...prev]);
    setIsFormOpen(false);
    setSelectedEntry(null);

    addToast("Creating entry...", "info");

    try {
      // Upload image if exists
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

        // Replace temp entry with real entry
        setEntries((prev) =>
          prev.map((entry) => (entry.id === tempId ? createdEntry : entry)),
        );

        // Refresh summary
        loadSummary(selectedWeekStart || undefined);

        addToast("Entry created successfully!", "success");
      } else {
        throw new Error("Failed to create entry");
      }
    } catch (error) {
      // Rollback optimistic update
      setEntries((prev) => prev.filter((entry) => entry.id !== tempId));
      setIsFormOpen(true);

      addToast("Failed to create entry", "error");
    }
  };

  // OPTIMISTIC UPDATE
  const handleUpdateEntry = async (entryData: any) => {
    if (!activeUserId || isJudge) return;

    const originalEntry = entries.find((e) => e.id === entryData.id);
    if (!originalEntry) return;

    // Optimistic update
    const updatedEntry: Entry = {
      ...originalEntry,
      date: new Date(entryData.date).toISOString(),
      count: Number(entryData.count),
      note: entryData.note || null,
      tags:
        entryData.tags
          ?.split(",")
          .map((t: string) => t.trim())
          .filter(Boolean) || [],
      imageUrl: entryData.imageUrl || originalEntry.imageUrl,
      editedAt: new Date().toISOString(),
    };

    setEntries((prev) =>
      prev.map((entry) => (entry.id === entryData.id ? updatedEntry : entry)),
    );
    setIsFormOpen(false);
    setSelectedEntry(null);

    addToast("Updating entry...", "info");

    try {
      // Upload new image if exists
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
        }
      }

      const payload = {
        id: entryData.id,
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

      const response = await fetch(`${API_URL}/entries/${entryData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const serverUpdatedEntry = await response.json();

        // Update with server response
        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === entryData.id ? serverUpdatedEntry : entry,
          ),
        );

        // Refresh summary
        loadSummary(selectedWeekStart || undefined);

        addToast("Entry updated successfully!", "success");
      } else {
        throw new Error("Failed to update entry");
      }
    } catch (error) {
      // Rollback optimistic update
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryData.id ? originalEntry : entry,
        ),
      );
      setIsFormOpen(true);

      addToast("Failed to update entry", "error");
    }
  };

  // OPTIMISTIC DELETE
  const handleDeleteEntry = async (entry: Entry) => {
    if (!activeUserId || entry.userId !== activeUserId || isJudge) return;

    // Store original entry for rollback
    const originalEntries = [...entries];

    // Optimistic update
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
        // Refresh summary
        loadSummary(selectedWeekStart || undefined);

        addToast("Entry deleted successfully!", "success");
      } else {
        throw new Error("Failed to delete entry");
      }
    } catch (error) {
      // Rollback optimistic update
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
    });
    setImagePreviewUrl(entry.imageUrl ?? null);
    setIsFormOpen(true);
  };

  const handleSaveEntry = async () => {
    if (!activeUserId || isJudge) return;

    if (formState.id) {
      await handleUpdateEntry(formState);
    } else {
      await handleCreateEntry(formState);
    }
  };

  const handleTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    const targetId =
      tab === "dashboard" ? "dashboard" : tab === "new" ? "new" : "history";
    const target = document.getElementById(targetId);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const user = Object.values(USER_PINS).find((item) => item.id === stored);
    if (user) {
      setActiveUserId(user.id);
      setUnlockedUser(user);
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
    }
  }, [activeUserId]);

  useEffect(() => {
    if (activeUserId) {
      const week = selectedWeekStart || undefined;
      loadEntries(week);
      loadSummary(week);
    }
  }, [selectedWeekStart, activeUserId]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      {!activeUserId && (
        <PinLock
          pinValue={pinValue}
          setPinValue={setPinValue}
          authError={authError}
          onPinSubmit={handlePinSubmit}
        />
      )}

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-24 pt-10 sm:px-8">
        <Header
          activeUser={activeUser}
          weekNumber={weekNumber}
          weekLabel={weekLabel}
          onLogout={handleLogout}
        />

        <JudgeView isJudge={isJudge} />

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <WeeklyTotals
            activeUserId={activeUserId}
            users={users}
            weeklySummary={weeklySummary}
          />

          <WeeklyStatus
            activeUserId={activeUserId}
            users={users}
            weeklySummary={weeklySummary}
            isJudge={isJudge}
          />
        </section>

        <DailyBreakdown
          entries={entries}
          selectedWeekStart={selectedWeekStart}
          onWeekChange={setSelectedWeekStart}
          onEntryClick={setSelectedEntry}
        />

        <NewEntrySection
          activeUserId={activeUserId}
          isJudge={isJudge}
          onNewEntry={openNewEntry}
        />
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTab} />

      {/* Modals */}
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
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ToastContainerWrapper />
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
