"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { UserCircle, LogOut } from "lucide-react"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import UserProfileModal from "@/components/profile/UserProfileModal";
import { useState } from "react";

const FitTrackLogo = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary">
    <path
      d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
      fill="currentColor"
    ></path>
  </svg>
);

const getInitials = (displayName?: string | null, email?: string | null): string => {
  if (displayName) {
    const nameParts = displayName.trim().split(/\s+/).filter(Boolean);
    if (nameParts.length > 0) {
      const firstInitial = nameParts[0][0];
      if (nameParts.length > 1) {
        const lastInitial = nameParts[nameParts.length - 1][0];
        return `${firstInitial}${lastInitial}`.toUpperCase();
      }
      if (nameParts[0].length > 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
      }
      return firstInitial.toUpperCase(); 
    }
  }
  if (email) {
    const emailPrefix = email.split('@')[0];
    if (emailPrefix.length > 1) {
      return emailPrefix.substring(0, 2).toUpperCase();
    }
    if (emailPrefix.length === 1) {
      return emailPrefix[0].toUpperCase();
    }
  }
  return ""; 
};

export default function Header() {
  const { user, logout, loading, userProfile } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  let displayPhotoURL: string | null = null;
  let displayNameForAvatar: string | null = null;
  let emailForAvatar: string | null = null;
  let initialsForAvatar: string = "";

  if (!loading) {
    displayNameForAvatar = userProfile?.displayName || user?.displayName;
    emailForAvatar = user?.email;
    initialsForAvatar = getInitials(displayNameForAvatar, emailForAvatar);

    if (userProfile?.photoURL && userProfile.photoURL.trim() !== "") {
      displayPhotoURL = userProfile.photoURL;
    } else if (user?.photoURL && user.photoURL.trim() !== "") {
      displayPhotoURL = user.photoURL;
    }
  }
  
  const altTextForAvatar = displayNameForAvatar || emailForAvatar || "User";

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 px-4 sm:px-10 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-10 items-center justify-between p-0">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <FitTrackLogo />
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">FitTrack</h2>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4 md:gap-8">
            {loading && !user ? ( 
              <LoadingSpinner size="sm" />
            ) : user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full p-0">
                      <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                        <AvatarImage src={displayPhotoURL ?? undefined} alt={altTextForAvatar} data-ai-hint="profile person" />
                        <AvatarFallback>
                          {loading ? ( 
                            <LoadingSpinner size="sm" />
                          ) : initialsForAvatar ? (
                            initialsForAvatar
                          ) : (
                            <UserCircle className="h-5 w-5" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayNameForAvatar || "User Profile"}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {emailForAvatar}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)} className="cursor-pointer">
                      Editar Perfil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                  <Button variant="ghost" asChild size="sm">
                      <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild size="sm">
                      <Link href="/signup">Sign Up</Link>
                  </Button>
              </div>
            )}
          </nav>
        </div>
      </header>
      {user && <UserProfileModal isOpen={isProfileModalOpen} onOpenChange={setIsProfileModalOpen} />}
    </>
  );
}
