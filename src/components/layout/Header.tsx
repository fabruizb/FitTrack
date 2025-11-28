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
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const FitTrackLogo = () => (
  <div className="relative w-14 h-14 sm:w-14 sm:h-14 flex items-center justify-center">
    <Image
      src="/photo/FitTrack-Logo.png"
      alt="FitTrack Logo"
      fill
      className="object-contain p-1"
      priority
    />
  </div>
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

  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

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
      <header className="sticky top-0 z-50 w-full border border-white/20 bg-[#c1d4fc]/30 backdrop-blur-lg px-4 sm:px-10 py-3 shadow-lg rounded-b-xl">
        <div className="container mx-auto flex h-10 items-center justify-between p-0">
          <Link href="/" className="flex items-center gap-2 text-[#089bdf]">
            <FitTrackLogo />
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">FitTrack</h2>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4 md:gap-8">
            {loading && !user ? (
              <LoadingSpinner size="sm" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full p-0 border border-white/30 bg-white/20 backdrop-blur-md hover:bg-white/30 transition"
                  >
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
                <DropdownMenuContent
                  align="end"
                  className="w-56 border border-white/20 bg-white/20 backdrop-blur-md shadow-lg rounded-lg"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{displayNameForAvatar || "User Profile"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{emailForAvatar}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="border-white/20" />
                  <DropdownMenuItem
                    onClick={() => setIsProfileModalOpen(true)}
                    className="cursor-pointer hover:bg-white/30"
                  >
                    Editar Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="border-white/20" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-white/30">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
