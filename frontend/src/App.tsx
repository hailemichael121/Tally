import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { USER_PINS, User, Entry, WeeklySummary, ActiveTab } from "./types";
import Header from "./components/Header";
import JudgeView from "./components/JudgeView";
import WeeklyTotals from "./components/WeeklyTotals";
import WeeklyStatus from "./components/WeeklyStatus";
import PinLock from "./components/PinLock";
import DailyBreakdown from "./components/DailyBreakdown";
import BottomNav from "./components/BottomNav";
import EntryForm from "./components/EntryForm";
import EntryModal from "./components/EntryModal";
import ImageZoom from "./components/ImageZoom";
import NewEntrySection from "./components/NewEntrySection";

const API_URL = "http://localhost:4000";
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

export default function App() {
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

  const activeUser =
    unlockedUser ?? users.find((user) => user.id === activeUserId) ?? null;
  const weekLabel = weeklySummary
    ? `Week of ${formatWeek(weeklySummary.weekStart)}`
    : "Week of Feb 9";
  const weekNumber = 1;
  const isJudge = activeUserId === "judge";

  const loadAllData = async (_activeUserId?: string) => {
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

  const handlePinSubmit = () => {
    setAuthError("");

    const user = USER_PINS[pinValue as keyof typeof USER_PINS];

    if (user) {
      setActiveUserId(user.id);
      setUnlockedUser(user);
      setPinValue("");
      localStorage.setItem(STORAGE_KEY, user.id);
      loadAllData(user.id);
    } else {
      setAuthError("mock and jock yo scammer try again pls");
      setPinValue("");
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
  };

  const handleCreateUsers = async () => {
    const usersToCreate = Object.values(USER_PINS);
    await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usersToCreate),
    });
    await loadAllData();
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
    setIsSubmitting(true);

    let imageUrl: string | undefined;

    if (formState.imageFile) {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Upload failed"));
        reader.readAsDataURL(formState.imageFile as Blob);
      });

      try {
        const uploadResponse = await fetch(`${API_URL}/uploads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: dataUrl }),
        });

        if (uploadResponse.ok) {
          const uploadData = (await uploadResponse.json()) as { url: string };
          imageUrl = uploadData.url;
        }
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }

    const payload = {
      userId: activeUserId,
      date: new Date(formState.date).toISOString(),
      count: Number(formState.count),
      tags: formState.tags
        ? formState.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : undefined,
      note: formState.note || undefined,
      imageUrl,
    };

    const isEditing = Boolean(formState.id);
    try {
      const response = await fetch(
        `${API_URL}/entries${isEditing ? `/${formState.id}` : ""}`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        setIsFormOpen(false);
        setSelectedEntry(null);
        loadEntries(selectedWeekStart || undefined);
        loadSummary(selectedWeekStart || undefined);
      }
    } catch (error) {
      console.error("Failed to save entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (entry: Entry) => {
    if (!activeUserId || entry.userId !== activeUserId || isJudge) return;

    try {
      await fetch(`${API_URL}/entries/${entry.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUserId }),
      });
      setSelectedEntry(null);
      loadEntries(selectedWeekStart || undefined);
      loadSummary(selectedWeekStart || undefined);
    } catch (error) {
      console.error("Failed to delete entry:", error);
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isFormOpen || zoomImageUrl || selectedEntry) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isFormOpen, zoomImageUrl, selectedEntry]);

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
          onWeekChange={(value) => setSelectedWeekStart(value)}
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
            onImageClick={(url) => setZoomImageUrl(url)}
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
