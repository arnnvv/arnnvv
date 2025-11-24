"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  forwardRef,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  startTransition,
  use,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const ViewTransitionsContext = createContext<(callback: () => void) => void>(
  () => {
    throw new Error("Missing ViewTransitionsProvider.");
  },
);

export function ViewTransitionsProvider({ children }: { children: ReactNode }) {
  const isMountRef = useRef(true);
  const [finishTransition, setFinishTransition] = useState<(() => void) | null>(
    null,
  );
  const [renderBlockingPromise, setRenderBlockingPromise] =
    useState<Promise<void> | null>(null);

  if (renderBlockingPromise) {
    use(renderBlockingPromise);
  }

  useEffect(() => {
    isMountRef.current = false;
  }, []);

  useEffect(() => {
    if (finishTransition && !isMountRef.current) {
      finishTransition();
      startTransition(() => {
        setFinishTransition(null);
      });
    }
  }, [finishTransition]);

  useEffect(() => {
    const handler = () => {
      if (!document.startViewTransition) return;

      let resolveViewTransition: () => void;
      const viewTransitionPromise = new Promise<void>((resolve) => {
        resolveViewTransition = resolve;
      });

      const snapshotPromise = new Promise<void>((resolve) => {
        document.startViewTransition(() => {
          resolve();
          return viewTransitionPromise;
        });
      });

      setRenderBlockingPromise(snapshotPromise);
      setFinishTransition(() => () => {
        resolveViewTransition();
        setRenderBlockingPromise(null);
      });
    };

    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const startViewTransition = useCallback((callback: () => void) => {
    if (!document.startViewTransition) {
      startTransition(callback);
      return;
    }

    const transitionPromise = new Promise<void>((resolve) => {
      setFinishTransition(() => resolve);
      startTransition(callback);
    });

    document.startViewTransition(() => transitionPromise);
  }, []);

  return (
    <ViewTransitionsContext.Provider value={startViewTransition}>
      {children}
    </ViewTransitionsContext.Provider>
  );
}

function useViewTransitions() {
  return useContext(ViewTransitionsContext);
}

export const TransitionLink = forwardRef<
  HTMLAnchorElement,
  LinkProps & { children: ReactNode; className?: string | undefined }
>(function TransitionLink({ href, onClick, ...props }, ref) {
  const startViewTransition = useViewTransitions();
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = useCallback(
    (e: ReactMouseEvent<HTMLAnchorElement>) => {
      if (onClick) onClick(e);

      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }

      const targetPath = href.toString();
      if (targetPath === pathname) return;

      e.preventDefault();

      startViewTransition(() => {
        router.push(targetPath);
      });
    },
    [onClick, href, pathname, router, startViewTransition],
  );

  return <Link href={href} onClick={handleClick} ref={ref} {...props} />;
});
