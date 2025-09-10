"use client";

import NextLink, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, {
  createContext,
  type ReactNode,
  startTransition,
  use,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const TransitionContext = createContext<(callback: () => void) => void>(() => {
  throw new Error("Missing ViewTransitionsProvider");
});

export function ViewTransitionsProvider({ children }: { children: ReactNode }) {
  const [transition, setTransition] = useState<Promise<void> | null>(null);

  if (transition) {
    use(transition);
  }

  useEffect(() => {
    const handler = () => {
      if (document.startViewTransition) {
        let resolve: () => void;
        const promise = new Promise<void>((r) => {
          resolve = r;
        });
        setTransition(promise);
        document.startViewTransition(() => {
          resolve();
          setTransition(null);
        });
      }
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const startViewTransition = useCallback((callback: () => void) => {
    if (document.startViewTransition) {
      let resolve: () => void;
      const promise = new Promise<void>((r) => {
        resolve = r;
      });
      setTransition(promise);

      document.startViewTransition(() => {
        startTransition(callback);
        resolve();
        setTransition(null);
      });
    } else {
      startTransition(callback);
    }
  }, []);

  return (
    <TransitionContext.Provider value={startViewTransition}>
      {children}
    </TransitionContext.Provider>
  );
}

export const TransitionLink = React.forwardRef<
  HTMLAnchorElement,
  LinkProps & { children: ReactNode; className?: string }
>(function TransitionLink({ href, onClick, className, ...props }, ref) {
  const startViewTransition = useContext(TransitionContext);
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) onClick(e);

      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const targetPath = href.toString();
      if (targetPath === pathname) return;

      e.preventDefault();
      startViewTransition(() => {
        router.push(targetPath);
      });
    },
    [href, router, pathname, startViewTransition, onClick],
  );

  return (
    <NextLink
      href={href}
      onClick={handleClick}
      ref={ref}
      className={className}
      {...props}
    />
  );
});
