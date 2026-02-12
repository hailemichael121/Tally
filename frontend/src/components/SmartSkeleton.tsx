// components/SmartSkeleton.tsx
import { ReactNode, useEffect, useState } from "react";
import { useLoading } from "../contexts/LoadingContext";

interface SmartSkeletonProps {
  loadingKey: string;
  skeleton: ReactNode;
  children: ReactNode;
  delay?: number;
}

export default function SmartSkeleton({
  loadingKey,
  skeleton,
  children,
  delay = 300,
}: SmartSkeletonProps) {
  const { isLoading } = useLoading();
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    if (!isLoading(loadingKey)) {
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(true);
    }
  }, [isLoading(loadingKey), delay]);

  if (showSkeleton) {
    return <>{skeleton}</>;
  }

  return <>{children}</>;
}
