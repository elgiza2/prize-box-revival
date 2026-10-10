import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  ClientOnly,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import StarryBackground from "@/components/StarryBackground";
import { resolveTonManifestUrl } from "@/lib/tonconnect-manifest";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover",
      },
      { title: "Nova AI - Mine, Battle & Earn Gram" },
      {
        name: "description",
        content: "Nova AI: mine NOVA, battle monsters, and earn Gram cryptocurrency",
      },
      { name: "author", content: "Nova AI" },
      { property: "og:title", content: "Nova AI - Mine, Battle & Earn Gram" },
      {
        property: "og:description",
        content: "Nova AI: mine NOVA, battle monsters, and earn Gram cryptocurrency",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Special+Elite&family=Geist:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap",
      },
      { rel: "preconnect", href: "https://iqosbhbbyzqozfgpthyj.supabase.co", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://telegram.org" },
    ],
    scripts: [
      // TON evaluates Buffer-dependent modules as soon as the application bundle
      // loads. Keep this classic script outside Vite's module graph so it always
      // runs before the module scripts, including in split production builds.
      { src: "/buffer-polyfill.js" },
      { src: "https://sad.adsgram.ai/js/sad.min.js" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    // Client-only startup tasks from the original entry point.
    Promise.all([import("@/lib/protect"), import("@/lib/perf")]).then(([protectMod, perfMod]) => {
      protectMod.installProtection();
      perfMod.applyPerfMode();
    });
    const interval = window.setInterval(
      () => {
        void Promise.all([import("@/lib/cache"), import("@/lib/image-cache")]).then(
          ([cacheMod, imageMod]) => {
            cacheMod.pruneCache(0.2);
            imageMod.pruneImages(0.2);
          },
        );
      },
      30 * 60 * 1000,
    );
    return () => window.clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ClientOnly
        fallback={
          <div className="min-h-screen" style={{ backgroundColor: "hsl(160 16% 6%)" }} />
        }
      >
        <TonConnectUIProvider
          manifestUrl={resolveTonManifestUrl()}
          restoreConnection={true}
          actionsConfiguration={{ returnStrategy: "back" }}
        >
          <TooltipProvider>
            <Sonner position="top-center" />
            <Toaster />
            <AppProvider>
              <StarryBackground />
              <div className="max-w-lg mx-auto relative z-10">
                <Outlet />
                <BottomNav />
              </div>
            </AppProvider>
          </TooltipProvider>
        </TonConnectUIProvider>
      </ClientOnly>
    </QueryClientProvider>
  );
}
