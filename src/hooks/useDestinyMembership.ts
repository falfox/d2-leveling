import { GroupUserInfoCard } from "bungie-api-ts/groupv2/interfaces";
import { useEffect, useState } from "react";
import { STORAGE_DESTINY_MEMBERSHIPS_KEY } from "../consts";

export function useDestinyMembership(): {
  membership: GroupUserInfoCard | null;
} {
  const [data, setData] = useState<GroupUserInfoCard | null>(null);

  useEffect(() => {
    const cachedData = localStorage.getItem(STORAGE_DESTINY_MEMBERSHIPS_KEY);

    if (cachedData) {
      setData(JSON.parse(cachedData)[0]);
    }
  }, []);

  console.log({ data });

  return {
    membership: data,
  };
}
