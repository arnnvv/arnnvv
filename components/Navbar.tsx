import { type JSX, Suspense } from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import { ThemeButton } from "./ThemeButton";
import { getCurrentSession, signOutAction } from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { SignOutFormComponent } from "./SignOutForm";
import { globalGETRateLimit } from "@/lib/request";
import { HomeLink } from "./HomeLink";

function AuthControlsSkeleton(): JSX.Element {
  return (
    <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 bg-gray-300 dark:bg-zinc-700 rounded-full animate-pulse" />
  );
}

async function AuthControlsContent(): Promise<JSX.Element | string> {
  const { session, user } = await getCurrentSession();

  if (!(await globalGETRateLimit())) {
    return "Rate Limited! Don't Spam";
  }

  if (session === null) {
    return (
      <a
        href="/login/google"
        className="group gsi-material-button dark:[color-scheme:dark] bg-gray-100 dark:bg-zinc-900 text-gray-700 dark:text-gray-100 border dark:border-zinc-500 rounded-full text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 hover:shadow-sm transition-all duration-200 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black dark:bg-white opacity-0 group-hover:opacity-[8%] group-focus:opacity-[12%] transition-opacity duration-200" />
        <div className="flex items-center">
          <div className="mr-1.5 sm:mr-2 md:mr-3 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5">
            <svg version="1.1" viewBox="0 0 48 48" className="block">
              <title id="google">Google</title>
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
          </div>
          <span className="font-medium text-xs sm:text-sm">Sign in</span>
          <span className="sr-only">Sign in with Google</span>
        </div>
      </a>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 cursor-pointer">
          <AvatarImage
            src={user.picture || "/default-avatar.png"}
            alt={`${user.name || "User"}'s avatar`}
          />
          <AvatarFallback>
            {user.name ? (
              user.name.charAt(0).toUpperCase()
            ) : (
              <UserIcon size={18} />
            )}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <SignOutFormComponent action={signOutAction}>
            <Button variant="ghost" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </Button>
          </SignOutFormComponent>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar(): JSX.Element {
  return (
    <nav className="relative backdrop-blur-md bg-card/70 border-b border-border/50 py-2 sm:py-3 md:py-4 px-3 sm:px-4">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10" />

      <div className="relative z-10 flex flex-row justify-between items-center">
        <HomeLink />

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <Suspense fallback={<AuthControlsSkeleton />}>
            <AuthControlsContent />
          </Suspense>
          <ThemeButton />
        </div>
      </div>
    </nav>
  );
}
