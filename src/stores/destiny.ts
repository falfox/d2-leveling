import {
  DestinyCharacterComponent,
  DestinyItemComponent,
} from "bungie-api-ts/destiny2";
import { GroupUserInfoCard } from "bungie-api-ts/groupv2/interfaces";
import {
  action,
  Action,
  computed,
  Computed,
  createContextStore,
  thunk,
  Thunk,
} from "easy-peasy";
import { mapValues, maxBy } from "lodash";
import { DisplayDestinyItemComponent } from "../App";
import {
  ITEM_SLOT_BUCKETS,
  ITEM_TYPE_ARMOR,
  ITEM_TYPE_WEAPON,
  STORAGE_MANIFEST_VERSION_KEY,
  WEAPON_SLOT_BUCKETS,
  STORAGE_ACTIVE_CHAR_ID,
} from "../consts";
import {
  getDestinyMembership,
  getManifest,
  getProfileInfo,
  ManifestData,
} from "../services/bungie";
import {
  DestinyMilestoneDisplay,
  getPinnacleAndPowerfulMilestones,
} from "../services/destiny/milestones";
import { ObjectOf } from "../utils";

interface DestinyStoreModel {
  // States
  manifest_data: ManifestData | null;
  manifest_version: string | null;
  is_fetching: boolean;
  memberships: GroupUserInfoCard[] | null;
  characters: ObjectOf<DestinyCharacterComponent> | null;
  milestones: ObjectOf<DestinyMilestoneDisplay[]> | null;
  topCharactersItem: ObjectOf<DisplayDestinyItemComponent[]> | null;
  hasData: Computed<DestinyStoreModel, boolean>;
  activeCharId: string | null;
  artifactPowerBonus: number;

  // Actions and Thunks
  loadManifest: Thunk<
    DestinyStoreModel,
    {
      force: boolean;
    }
  >;
  loadProfiles: Thunk<
    DestinyStoreModel,
    {
      force: boolean;
    }
  >;
  setManifestData: Action<
    DestinyStoreModel,
    {
      data: ManifestData;
      version: string;
    }
  >;
  setMembership: Action<DestinyStoreModel, GroupUserInfoCard[]>;
  setCharacters: Action<DestinyStoreModel, ObjectOf<DestinyCharacterComponent>>;
  setFetching: Action<DestinyStoreModel, boolean>;
  setMilestones: Action<DestinyStoreModel, ObjectOf<DestinyMilestoneDisplay[]>>;
  setActiveCharId: Action<DestinyStoreModel, string>;
  setTopCharactersItem: Action<
    DestinyStoreModel,
    ObjectOf<DisplayDestinyItemComponent[]>
  >;
  setArtifactPowerBonus: Action<DestinyStoreModel, number>;
}

export const DestinyStores = createContextStore<DestinyStoreModel>({
  manifest_data: null,
  manifest_version: localStorage.getItem(STORAGE_MANIFEST_VERSION_KEY),
  is_fetching: true,
  memberships: null,
  characters: null,
  hasData: computed((state) => state.characters !== null),
  activeCharId: null,
  milestones: null,
  topCharactersItem: null,
  artifactPowerBonus: 0,

  loadManifest: thunk(async (actions, payload) => {
    try {
      actions.setFetching(true);
      const data = await getManifest(payload.force);
      const version = localStorage.getItem(STORAGE_MANIFEST_VERSION_KEY);

      if (!version) throw new Error("Failed to retrieve manifest version");

      actions.setManifestData({
        data,
        version,
      });
    } catch (error) {
      console.warn({
        error,
      });
    } finally {
      actions.setFetching(false);
    }
  }),
  loadProfiles: thunk(async (actions, payload, helpers) => {
    try {
      await actions.loadManifest({
        force: payload.force,
      });
      actions.setFetching(true);
      const { Response } = await getProfileInfo();

      const membership = await getDestinyMembership();
      actions.setMembership(membership);
      const characters = Response.characters.data;

      if (!characters) {
        throw new Error("Failed to retrieve `characters` data");
      }

      const progressionsData = Response.characterProgressions.data;

      if (!progressionsData) {
        throw new Error("Failed to retrieve `profile progressions` data");
      }
      const manifest = helpers.getState().manifest_data;

      if (!manifest) {
        throw new Error("Failed to retrieve manifest data");
      }

      const milestones = Object.keys(progressionsData).reduce((acc, cur) => {
        const milestones = getPinnacleAndPowerfulMilestones(
          progressionsData[cur].milestones,
          manifest
        );

        return {
          ...acc,
          [cur]: milestones,
        };
      }, {});

      const inventoryData = Response.characterInventories.data;
      const equipmentData = Response.characterEquipment.data;
      const itemInstances = Response.itemComponents.instances.data;
      const profileInventories = Response.profileInventory.data;

      if (!characters) {
        throw new Error("Missing characters data");
      }

      if (
        !inventoryData ||
        !equipmentData ||
        !itemInstances ||
        !profileInventories
      ) {
        throw new Error("Failed to load inventory data");
      }

      const allCharactersInventories = mapValues(
        inventoryData,
        (inv) => inv.items
      );

      const topItemsByChar = Object.keys(equipmentData).reduce((acc, cur) => {
        const characterEquipment = equipmentData[cur].items;

        const inventories = [
          ...Object.values(allCharactersInventories).flat(),
          ...profileInventories.items,
          ...characterEquipment,
        ].flat();

        const equipableItem = inventories
          .filter((i) => i.itemInstanceId && i.itemHash)
          .map((i) => {
            return {
              ...i,
              instanceData: itemInstances?.[i?.itemInstanceId ?? ""],
              itemDefinition:
                manifest.DestinyInventoryItemDefinition[i?.itemHash ?? ""],
            };
          })
          .filter(
            (i) =>
              i.instanceData &&
              i.itemDefinition &&
              [ITEM_TYPE_ARMOR, ITEM_TYPE_WEAPON].includes(
                i.itemDefinition.itemType
              )
          )
          .filter((item) => {
            const definition =
              manifest.DestinyInventoryItemDefinition[item.itemHash];

            if (!definition) return false;

            // Check if the same class
            if (definition.classType === characters[cur].classType) {
              return true;
            }

            // Check if weapon
            const bucketTypeHash =
              item?.itemDefinition?.inventory?.bucketTypeHash;
            if (bucketTypeHash && WEAPON_SLOT_BUCKETS.includes(bucketTypeHash))
              return true;

            return false;
          });

        const topItems = Object.values(ITEM_SLOT_BUCKETS).map(
          (bucketHash) =>
            maxBy(
              equipableItem.filter((i) => {
                return (
                  i?.itemDefinition?.inventory?.bucketTypeHash === bucketHash
                );
              }),
              (i) => itemInstances[i.itemInstanceId!].primaryStat.value
            )!
        );

        return {
          ...acc,
          [cur]: topItems,
        };
      }, {});

      actions.setMilestones(milestones);
      actions.setTopCharactersItem(topItemsByChar);

      const artifactData = Response.profileProgression.data;

      if (!artifactData) {
        throw new Error("Failed to retrieve artifact data");
      }
      actions.setArtifactPowerBonus(artifactData.seasonalArtifact.powerBonus);

      const charId =
        localStorage.getItem(STORAGE_ACTIVE_CHAR_ID) ??
        Object.keys(characters)[0];
      console.log({ charId });

      actions.setActiveCharId(charId);
      actions.setCharacters(characters);
    } catch (error) {
      console.warn(error);

      // TOOD: handle errors
    } finally {
      actions.setFetching(false);
    }
  }),
  setMembership: action((state, payload) => {
    state.memberships = payload;
  }),
  setCharacters: action((state, payload) => {
    state.characters = payload;
  }),
  setManifestData: action((state, payload) => {
    state.manifest_data = payload.data;
    state.manifest_version = payload.version;
  }),
  setFetching: action((state, payload) => {
    state.is_fetching = payload;
  }),
  setMilestones: action((state, payload) => {
    state.milestones = payload;
  }),
  setActiveCharId: action((state, payload) => {
    localStorage.setItem(STORAGE_ACTIVE_CHAR_ID, payload);
    state.activeCharId = payload;
  }),
  setTopCharactersItem: action((state, payload) => {
    state.topCharactersItem = payload;
  }),
  setArtifactPowerBonus: action((state, payload) => {
    state.artifactPowerBonus = payload;
  }),
});
