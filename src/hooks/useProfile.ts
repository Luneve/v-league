"use client";

import { useState, useEffect } from "react";
import {
  getProfile,
  getVolunteerProfile,
  getOrganizationProfile,
} from "@/lib/actions";
import { mapVolunteerProfile, mapOrganizationProfile } from "@/lib/mappers";
import type { Role, VolunteerProfile, OrganizationProfile } from "@/types";

interface ProfileState {
  profile: VolunteerProfile | OrganizationProfile | null;
  role: Role | null;
  loading: boolean;
}

export function useProfile(): ProfileState & { refetch: () => void } {
  const [state, setState] = useState<ProfileState>({
    profile: null,
    role: null,
    loading: true,
  });

  const load = async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const baseProfile = await getProfile();
      if (!baseProfile) {
        setState({ profile: null, role: null, loading: false });
        return;
      }

      const role = baseProfile.role as Role;

      if (role === "volunteer") {
        const { data } = await getVolunteerProfile();
        setState({
          profile: data ? mapVolunteerProfile(data) : null,
          role,
          loading: false,
        });
      } else if (role === "organization") {
        const { data } = await getOrganizationProfile();
        setState({
          profile: data ? mapOrganizationProfile(data) : null,
          role,
          loading: false,
        });
      } else {
        // admin
        setState({
          profile: null,
          role,
          loading: false,
        });
      }
    } catch {
      setState({ profile: null, role: null, loading: false });
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, refetch: load };
}
