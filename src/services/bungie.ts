import {
  BungieMembershipType,
  DestinyActivityDefinition,
  DestinyCharacterResponse,
  DestinyChecklistDefinition,
  DestinyComponentType,
  DestinyInventoryBucketDefinition,
  DestinyInventoryItemDefinition,
  DestinyItemCategoryDefinition,
  DestinyManifestComponentName,
  DestinyMilestoneDefinition,
  DestinyObjectiveDefinition,
  DestinyProfileResponse,
  DestinyProgressionDefinition,
  DestinyPublicMilestone,
  getCharacter,
  getDestinyManifest,
  getDestinyManifestSlice,
  getProfile,
  getPublicMilestones,
  HttpClientConfig,
  ServerResponse,
} from "bungie-api-ts/destiny2";
import { GroupUserInfoCard } from "bungie-api-ts/groupv2/interfaces";
import { getMembershipDataById } from "bungie-api-ts/user";
import { get, set } from "idb-keyval";
import md5 from "md5";
import { stringify } from "query-string";
import { VITE_BUNGIE_API_KEY } from "../config";
import {
  STORAGE_ACCESS_TOKEN_EXPIRATION_KEY,
  STORAGE_ACCESS_TOKEN_KEY,
  STORAGE_CHARACTERS_LAST_UPDATED_KEY,
  STORAGE_DESTINY_CHARACTERS_KEY,
  STORAGE_DESTINY_MEMBERSHIPS_KEY,
  STORAGE_MANIFEST_COMPONENTS_MD5_KEY,
  STORAGE_MANIFEST_DATA_KEY,
  STORAGE_MANIFEST_VERSION_KEY,
  STORAGE_MEMBERSHIP_ID_KEY,
} from "../consts";
import { getAccessToken } from "./auth";

async function $http(config: HttpClientConfig) {
  // fill in the API key, handle OAuth, etc., then make an HTTP request using the config.
  let accessToken = localStorage.getItem(STORAGE_ACCESS_TOKEN_KEY);
  const accessTokenExpiration = localStorage.getItem(
    STORAGE_ACCESS_TOKEN_EXPIRATION_KEY
  );
  if (new Date().getTime() > parseInt(accessTokenExpiration ?? "0")) {
    const { access_token } = await getAccessToken();
    accessToken = access_token;
  }

  const url = config.url + `?${stringify(config.params)}`;
  const isAPICall = config.url.includes("/Platform/");

  const response = await fetch(url, {
    method: config.method,
    headers: {
      ...(isAPICall
        ? {
            "X-API-KEY": VITE_BUNGIE_API_KEY as string,
            Authorization: `Bearer ${accessToken}`,
          }
        : {}),
    },
    body: config.body ? JSON.stringify(config.body) : undefined,
    credentials: isAPICall ? "include" : "same-origin",
  });

  if (response.status !== 200) {
    if (response.status === 401) {
      //   Auth Error
      throw new Error("Authentication Error");
    }
    if (response.status === 503) {
      try {
        const messageData = await response.json();
        if (messageData && messageData.ErrorStatus === "SystemDisabled") {
          // throw new BungieSystemDisabledError();
          throw new Error("Failed to connect to Bungie.net");
        }
      } catch (e) {
        throw new Error(e);
        /* Do nothing if unrecognised or un-parseable 503 */
      }
    } else {
      try {
        const messageData = await response.json();

        throw new Error(messageData.Message);
      } catch (e) {
        throw e;
      }
    }
  }
  return await response.json();
}

async function getMembershipData(membershipId: string) {
  const response = await getMembershipDataById($http, {
    membershipId,
    membershipType: BungieMembershipType.TigerSteam,
  });

  console.log({ response });

  return response;
}

export async function getDestinyMembership(): Promise<GroupUserInfoCard[]> {
  const destinyMemberships = localStorage.getItem(
    STORAGE_DESTINY_MEMBERSHIPS_KEY
  );
  if (!destinyMemberships) {
    const destinyMembershipId = await getMembershipData(
      localStorage.getItem(STORAGE_MEMBERSHIP_ID_KEY) as string
    );

    const memberships = destinyMembershipId.Response.destinyMemberships;
    localStorage.setItem(
      STORAGE_DESTINY_MEMBERSHIPS_KEY,
      JSON.stringify(memberships)
    );

    return memberships;
  }
  return JSON.parse(destinyMemberships);
}

export let cachedManifest: ManifestData | null = null;

export async function getProfileInfo(): Promise<
  ServerResponse<DestinyProfileResponse>
> {
  const cachedProfile = localStorage.getItem(STORAGE_DESTINY_CHARACTERS_KEY);
  const lastUpdated = parseInt(
    localStorage.getItem(STORAGE_CHARACTERS_LAST_UPDATED_KEY) ?? "0"
  );

  if (cachedProfile && lastUpdated + 1000 * 5 > new Date().getTime()) {
    return JSON.parse(cachedProfile);
  }

  const destinyMemberships = await getDestinyMembership();
  const profile = await getProfile($http, {
    components: [
      DestinyComponentType.Characters,
      DestinyComponentType.CharacterInventories,
      DestinyComponentType.ProfileInventories,
      // DestinyComponentType.Profiles,
      DestinyComponentType.CharacterEquipment,
      DestinyComponentType.ItemInstances,
      DestinyComponentType.ProfileProgression,
      DestinyComponentType.CharacterProgressions,
      DestinyComponentType.CharacterActivities,
    ],
    destinyMembershipId: destinyMemberships[0].membershipId,
    membershipType: destinyMemberships[0].membershipType,
  });

  localStorage.setItem(STORAGE_DESTINY_CHARACTERS_KEY, JSON.stringify(profile));

  localStorage.setItem(
    STORAGE_CHARACTERS_LAST_UPDATED_KEY,
    new Date().getTime().toString()
  );

  return profile;
}

export interface ManifestData {
  [key: string]: any | undefined;
  DestinyInventoryItemDefinition: {
    [key: string]: DestinyInventoryItemDefinition | undefined;
  };
  DestinyItemCategoryDefinition: {
    [key: string]: DestinyItemCategoryDefinition | undefined;
  };
  DestinyProgressionDefinition: {
    [key: string]: DestinyProgressionDefinition | undefined;
  };
  DestinyChecklistDefinition: {
    [key: string]: DestinyChecklistDefinition | undefined;
  };
  DestinyMilestoneDefinition: {
    [key: string]: DestinyMilestoneDefinition | undefined;
  };
  DestinyActivityDefinition: {
    [key: string]: DestinyActivityDefinition | undefined;
  };
  DestinyInventoryBucketDefinition: {
    [key: string]: DestinyInventoryBucketDefinition | undefined;
  };
  DestinyObjectiveDefinition: {
    [key: string]: DestinyObjectiveDefinition | undefined;
  };
}

export async function getManifest(
  forceRefresh: boolean = false
): Promise<ManifestData> {
  if (cachedManifest && !forceRefresh) return cachedManifest;

  const idbValue = await get(STORAGE_MANIFEST_DATA_KEY);
  cachedManifest = idbValue;

  const manifestVersion = localStorage.getItem(STORAGE_MANIFEST_VERSION_KEY);
  const currentManifestKeysMd5 = localStorage.getItem(
    STORAGE_MANIFEST_COMPONENTS_MD5_KEY
  );

  const destinyManifest = await getDestinyManifest($http);

  const tableNames: DestinyManifestComponentName[] = [
    "DestinyInventoryItemDefinition",
    "DestinyItemCategoryDefinition",
    "DestinyProgressionDefinition",
    "DestinyChecklistDefinition",
    "DestinyMilestoneDefinition",
    "DestinyActivityDefinition",
    "DestinyInventoryBucketDefinition",
    "DestinyProgressionDefinition",
    "DestinyObjectiveDefinition",
  ];

  const manifestKeysMd5 = md5(tableNames.join(","));

  if (
    !idbValue ||
    manifestVersion !== destinyManifest.Response.version ||
    currentManifestKeysMd5 !== manifestKeysMd5
  ) {
    const slicedManifest = await getDestinyManifestSlice($http, {
      destinyManifest: destinyManifest.Response,
      language: "en",
      tableNames,
    });
    localStorage.setItem(
      STORAGE_MANIFEST_VERSION_KEY,
      destinyManifest.Response.version
    );

    set(STORAGE_MANIFEST_DATA_KEY, slicedManifest);
    localStorage.setItem(STORAGE_MANIFEST_COMPONENTS_MD5_KEY, manifestKeysMd5);

    return slicedManifest;
  }
  return idbValue;
}

export async function getCharacterInfo(
  characterId: string
): Promise<ServerResponse<DestinyCharacterResponse>> {
  const destinyMemberships = await getDestinyMembership();

  return await getCharacter($http, {
    characterId,
    components: [DestinyComponentType.CharacterInventories],
    destinyMembershipId: destinyMemberships[0].membershipId,
    membershipType: destinyMemberships[0].membershipType,
  });
}

export async function getAllMilestones(): Promise<
  ServerResponse<{
    [key: string]: DestinyPublicMilestone;
  }>
> {
  return await getPublicMilestones($http);
}
