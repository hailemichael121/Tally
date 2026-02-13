// hooks/useDataLoader.ts
import { useState, useCallback } from "react";
import { useLoading } from "../contexts/LoadingContext";
import { useToast } from "../contexts/ToastContext";
import { User, Entry, WeeklySummary } from "../types";

const API_URL: string = import.meta.env.VITE_API_URL as string;

export function useDataLoader() {
  const { startLoading, stopLoading, isLoading } = useLoading();
  const { addToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(
    null,
  );

  const loadAllData = useCallback(
    async (activeUserId?: string) => {
      try {
        startLoading("users");
        startLoading("entries");
        startLoading("summary");

        const [usersResponse, entriesResponse, summaryResponse] =
          await Promise.allSettled([
            fetch(`${API_URL}/users`),
            fetch(
              `${API_URL}/entries${activeUserId ? `?userId=${encodeURIComponent(activeUserId)}` : ""}`,
            ),
            fetch(`${API_URL}/weekly-summary`),
          ]);

        if (usersResponse.status === "fulfilled") {
          const usersData = (await usersResponse.value.json()) as User[];
          setUsers(usersData);
        } else {
          console.error("Failed to load users:", usersResponse.reason);
          addToast("Failed to load users", "error");
        }
        stopLoading("users");

        if (entriesResponse.status === "fulfilled") {
          const entriesData = (await entriesResponse.value.json()) as Entry[];
          setEntries(entriesData);
        } else {
          console.error("Failed to load entries:", entriesResponse.reason);
          addToast("Failed to load entries", "error");
        }
        stopLoading("entries");

        if (summaryResponse.status === "fulfilled") {
          const summaryData =
            (await summaryResponse.value.json()) as WeeklySummary;
          setWeeklySummary(summaryData);
        } else {
          console.error("Failed to load summary:", summaryResponse.reason);
          addToast("Failed to load summary", "error");
        }
        stopLoading("summary");
      } catch (error) {
        console.error("Failed to load data:", error);
        addToast("Failed to load data", "error");
        stopLoading("users");
        stopLoading("entries");
        stopLoading("summary");
      }
    },
    [addToast, startLoading, stopLoading],
  );

  const loadEntries = useCallback(
    async (weekStart?: string, date?: string, activeUserId?: string) => {
      try {
        startLoading("entries");

        let query = "";
        const params = new URLSearchParams();
        if (weekStart) {
          params.set("weekStart", weekStart);
        } else if (date) {
          params.set("date", date);
        }
        if (activeUserId) {
          params.set("userId", activeUserId);
        }

        query = params.toString() ? `?${params.toString()}` : "";

        const response = await fetch(`${API_URL}/entries${query}`);
        const data = (await response.json()) as Entry[];
        setEntries(data);
        return data;
      } catch (error) {
        console.error("Failed to load entries:", error);
        addToast("Failed to load entries", "error");
        return [];
      } finally {
        stopLoading("entries");
      }
    },
    [addToast, startLoading, stopLoading],
  );

  const loadSummary = useCallback(
    async (weekStart?: string) => {
      try {
        startLoading("summary");

        const query = weekStart
          ? `?weekStart=${encodeURIComponent(weekStart)}`
          : "";
        const response = await fetch(`${API_URL}/weekly-summary${query}`);
        const data = (await response.json()) as WeeklySummary;
        setWeeklySummary(data);
        return data;
      } catch (error) {
        console.error("Failed to load summary:", error);
        addToast("Failed to load summary", "error");
      } finally {
        stopLoading("summary");
      }
    },
    [addToast, startLoading, stopLoading],
  );

  return {
    users,
    setUsers,
    entries,
    setEntries,
    weeklySummary,
    setWeeklySummary,
    loadAllData,
    loadEntries,
    loadSummary,
    isLoading,
  };
}
