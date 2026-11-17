import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import "lenis/dist/lenis.css";
import "./index.css";
import { SmoothScroll } from "@/components/motion";
import App from "./App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* reducedMotion="user" makes every transform animation below respect
          the OS "reduce motion" setting without per-component checks. */}
      <MotionConfig reducedMotion="user">
        <SmoothScroll>
          <App />
        </SmoothScroll>
      </MotionConfig>
    </QueryClientProvider>
  </StrictMode>
);
