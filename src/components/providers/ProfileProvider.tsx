"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import type { Role, VolunteerProfile, OrganizationProfile } from "@/types";

interface ProfileContextValue {
  profile: VolunteerProfile | OrganizationProfile | null;
  role: Role | null;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  role: null,
});

export function useProfileContext(): ProfileContextValue {
  return useContext(ProfileContext);
}

interface ProfileProviderProps {
  profile: VolunteerProfile | OrganizationProfile | null;
  role: Role | null;
  children: ReactNode;
}

export function ProfileProvider({
  profile,
  role,
  children,
}: ProfileProviderProps) {
  return (
    <ProfileContext.Provider value={{ profile, role }}>
      {children}
    </ProfileContext.Provider>
  );
}
