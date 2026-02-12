// contexts/LoadingContext.tsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

type LoadingState = {
  users: boolean;
  entries: boolean;
  summary: boolean;
  [key: string]: boolean;
};

interface LoadingContextType {
  loadingStates: LoadingState;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({
    users: false,
    entries: false,
    summary: false,
  });

  const startLoading = useCallback((key: string) => {
    setLoadingStates((prev) => ({ ...prev, [key]: true }));
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingStates((prev) => ({ ...prev, [key]: false }));
  }, []);

  const isLoading = useCallback(
    (key: string) => {
      return loadingStates[key] || false;
    },
    [loadingStates],
  );

  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  return (
    <LoadingContext.Provider
      value={{
        loadingStates,
        startLoading,
        stopLoading,
        isLoading,
        isAnyLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
