import { LogoutOutline } from "@graywolfai/react-heroicons";
import { GroupUserInfoCard } from "bungie-api-ts/groupv2/interfaces";
import React from "react";
import { AuthStore } from "../stores/auth";
import { DestinyStores } from "../stores/destiny";

export function MembershipBadge() {
  const memberships = DestinyStores.useStoreState((state) => state.memberships);
  const logout = AuthStore.useStoreActions((state) => state.logout);
  const membership = memberships?.[0];

  if (!membership) return null;

  return (
    <div className="absolute top-0 left-0 -mt-12">
      <div className="flex items-center justify-start w-full py-4 pl-4 space-x-2">
        <img src={`https://www.bungie.net${membership.iconPath}`} className="w-5 h-5" />
        <span className="font-bold text-white">{membership.displayName}</span>
        <button
          onClick={() => {
            logout();
          }}
        >
          <LogoutOutline className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}