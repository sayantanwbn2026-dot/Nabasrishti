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
      /* Short, so a tab that has been sitting open picks up a CMS edit
         when the visitor comes back to it. Realtime (useLiveContent)
         handles the instant case; this is the fallback when the socket
         is unavailable. */
      staleTime: 15_000,
      refetchOnWindowFocus: true,
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
