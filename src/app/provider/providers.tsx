"use client";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { App } from "antd";
import { useState, useSyncExternalStore, useEffect } from "react";
import { useAuthStore } from "@/libs/store/auth.store";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      {isHydrated ? <App>{children}</App> : children}
    </QueryClientProvider>
  );
}
