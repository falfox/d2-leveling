import { DestinyCharacterComponent } from "bungie-api-ts/destiny2";
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
  CLASS_NAMES,
  ITEM_SLOT_BUCKETS,
  ITEM_TYPE_ARMOR,
  ITEM_TYPE_WEAPON,
  SEASONAL_PINNACLE_CAP,
  STORAGE_ACTIVE_CHAR_ID,
  STORAGE_MANIFEST_VERSION_KEY,
  WEAPON_SLOT_BUCKETS,
} from "../consts";
import {
  getAllMilestones,
  getDestinyMembership,
  getManifest,
  getProfileInfo,
} from "../services/bungie";
import {
  DestinyMilestoneDisplay,
  getPinnacleAndPowerfulMilestones,
} from "../services/destiny/milestones";
import { ObjectOf } from "../utils";

interface DestinyStoreModel {
  // States
  manifest_version: string | null;
  is_fetching: boolean;
  memberships: GroupUserInfoCard[] | null;
  characters: ObjectOf<DestinyCharacterComponent> | null;
  milestones: ObjectOf<DestinyMilestoneDisplay[]> | null;
  topCharactersItem: ObjectOf<DisplayDestinyItemComponent[]> | null;
  hasData: Computed<DestinyStoreModel, boolean>;
  activeCharId: string | null;
  artifactPowerBonus: number;
  errorText: string | null;

  // Actions and Thunks
  setErrorText: Action<DestinyStoreModel, string | null>;
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

  setInitialData: Action<
    DestinyStoreModel,
    Required<{
      memberships: DestinyStoreModel["memberships"];
      characters: DestinyStoreModel["characters"];
      activeCharId: DestinyStoreModel["activeCharId"];
      topCharactersItem: DestinyStoreModel["topCharactersItem"];
      artifactPowerBonus: DestinyStoreModel["artifactPowerBonus"];
      milestones: DestinyStoreModel["milestones"];
    }>
  >;
}

export const DestinyStores = createContextStore<DestinyStoreModel>({
  manifest_version: localStorage.getItem(STORAGE_MANIFEST_VERSION_KEY),
  is_fetching: true,
  memberships: null,
  characters: null,
  hasData: computed((state) => state.characters !== null),
  activeCharId: null,
  milestones: null,
  topCharactersItem: null,
  artifactPowerBonus: 0,
  errorText: null,

  setErrorText: action((state, payload) => {
    state.errorText = payload;
  }),
  loadManifest: thunk(async (actions, payload) => {
    try {
      actions.setFetching(true);
      const data = await getManifest(payload.force);
      const version = localStorage.getItem(STORAGE_MANIFEST_VERSION_KEY);

      if (!version) throw new Error("Failed to retrieve manifest version");

      actions.setManifestData({
        version,
      });
    } catch (error) {
      actions.setErrorText(error.message);
      console.error(error);
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

      const memberships = await getDestinyMembership();
      const milestonesData = await getAllMilestones();

      const characters = Response.characters.data;
      if (!milestonesData) {
        throw new Error("Failed to retrieve `milestones` data");
      }

      if (!characters) {
        throw new Error("Failed to retrieve `characters` data");
      }

      const progressionsData = Response.characterProgressions.data;
      if (!progressionsData) {
        throw new Error("Failed to retrieve `profile progressions` data");
      }
      const activitiesData = Response.characterActivities.data;
      if (!activitiesData) {
        throw new Error("Failed to retrieve `profile progressions` data");
      }

      const manifest = await getManifest(payload.force);
      if (!manifest) {
        throw new Error("Failed to retrieve manifest data");
      }

      const allMilestones = milestonesData.Response;

      const milestones = Object.keys(progressionsData).reduce((acc, cur) => {
        console.log("========================");

        const characterProgresses = progressionsData[cur];
        const characterMilestone = characterProgresses.milestones;
        const characterProgress = characterProgresses.progressions;
        const characterActivities = activitiesData[cur];

        console.log("CHARACTER : " + CLASS_NAMES[characters[cur].classType]);

        console.log({
          characterProgress,
          characterMilestone,
        });

        // Inject Weekly Harbinger to PublicMilestones
        allMilestones[1086730368] = {
          activities:
            manifest.DestinyMilestoneDefinition[1086730368]?.activities.map(
              (a) => ({
                ...a,
                booleanActivityOptions: {},
                challengeObjectiveHashes: [1259975935],
                modifierHashes: [],
                phaseHashes: [],
              })
            ) ?? [],
          availableQuests: [],
          milestoneHash: 1086730368,
          order: 9000,
          vendorHashes: [],
          vendors: [],
        };

        // Inject Weekly Exo Challenge to PublicMilestones
        allMilestones[1713200903] = {
          activities:
            manifest.DestinyMilestoneDefinition[1713200903]?.activities.map(
              (a) => ({
                ...a,
                booleanActivityOptions: {},
                challengeObjectiveHashes: [],
                modifierHashes: [],
                phaseHashes: [],
              })
            ) ?? [],
          availableQuests: [],
          milestoneHash: 1713200903,
          order: 9000,
          vendorHashes: [],
          vendors: [],
        };

        for (const act of characterActivities.availableActivities) {
          if (act.activityHash == 4212753278) {
            // presage master

            console.log({
              act,
            });

            allMilestones[3278614711] = {
              activities: [
                {
                  ...act,
                  challengeObjectiveHashes: [3278614711],
                  phaseHashes: [],
                },
              ],
              availableQuests: [],
              milestoneHash: 3278614711,
              order: 9000,
              vendorHashes: [],
              vendors: [],
            };

            characterMilestone[3278614711] = {
              activities: [act],
              availableQuests: [],
              milestoneHash: 3278614711,
              order: 9000,
              rewards: [
                {
                  rewardCategoryHash: 326786556,
                  entries: [
                    {
                      earned: false,
                      redeemed: false,
                      rewardEntryHash: 326786556,
                    },
                  ],
                },
              ],
              values: {},
              vendorHashes: [],
              vendors: [],
            };
          } else if (act.recommendedLight === SEASONAL_PINNACLE_CAP + 20) {
            // Master Empire Hunt shenanigans

            const actDefs =
              manifest.DestinyActivityDefinition[act.activityHash];

            if (actDefs?.displayProperties?.name?.startsWith("Empire Hunt")) {
              allMilestones[291895719] = {
                activities: [],
                availableQuests: [],
                milestoneHash: 291895719,
                order: 9000,
                vendorHashes: [],
                vendors: [],
              };
              characterMilestone[291895719] = {
                activities: [act],
                availableQuests: [],
                milestoneHash: 291895719,
                order: 9000,
                rewards: [
                  {
                    rewardCategoryHash: 326786556,
                    entries: [
                      {
                        earned: false,
                        redeemed: false,
                        rewardEntryHash: 326786556,
                      },
                    ],
                  },
                ],
                values: {},
                vendorHashes: [],
                vendors: [],
              };
            }
          }
        }

        // const characterQuest = characterProgresses.quests;
        console.log({
          allMilestones,
        });

        const milestones = getPinnacleAndPowerfulMilestones(
          allMilestones,
          manifest
        ).map((mile) => {
          let completed = 0;
          let hasAccess = false;

          const activeMilestone = characterMilestone[mile.hash];

          if (!activeMilestone) {
            if (mile.hash === 3603098564) {
              hasAccess = true;
              // Add complete status for Clan Rewards
              completed = 1;
            } else if (mile.dependsOn.length > 0) {
              for (const mileHash of mile.dependsOn) {
                // Check if the milestone depends on another milestones
                // Ex: Trials Seven Wins ["3628293753"] depends on ["3628293757", "3628293755"]
                const dependentMile = characterMilestone[parseInt(mileHash)];
                // Get the other milestone progress
                const mileActs = dependentMile?.activities;

                if (mileActs?.length) {
                  const characterActivity =
                    characterActivities.availableActivities[
                      mileActs[0].activityHash
                    ];

                  hasAccess = characterActivity?.canJoin ?? false;
                }

                if (!mileActs?.[0]?.challenges?.[0].objective.complete) {
                  completed = 0;

                  break;
                } else {
                  completed = 1;
                }
              }
            } else {
              if (mile.hasActivities) {
                hasAccess = characterActivities.availableActivities.some(
                  (act) =>
                    act.canJoin &&
                    manifest.DestinyMilestoneDefinition[mile.hash]?.activities
                      ?.map((a) => a.activityHash)
                      .includes(act.activityHash)
                );
                completed = 1;
              } else if (mile.hasQuest) {
                hasAccess = true;
                completed = 1;
              }
            }
          } else {
            hasAccess = true;
            const milestoneActivities = activeMilestone?.activities;
            const milestoneQuests = activeMilestone?.availableQuests;

            if (milestoneActivities?.length) {
              const activity = milestoneActivities?.[0];

              if (activity?.challenges?.length) {
                // Check for Master Empire Hunt objective, if not exists, it's completed
                if (mile.hash === 291895719) {
                  let masterCompleted = true;

                  for (const chal of activity.challenges) {
                    if (chal.objective.objectiveHash === 1980717736) {
                      masterCompleted = false;
                      break;
                    }
                  }
                  completed = masterCompleted ? 1 : 0;
                } else {
                  const challenge = activity.challenges[0];

                  completed = challenge.objective.complete ? 1 : 0;
                }
              } else {
                // Presage challenges will missing if completed
                completed = 1;
              }
            } else if (milestoneQuests?.length) {
              const quest = milestoneQuests?.[0];

              const status = quest.status;
              completed = status.completed ? 1 : 0;
            }
          }

          return {
            ...mile,
            phases: activeMilestone?.activities?.[0]?.phases,
            completed,
            hasAccess,
          };
        });

        return {
          ...acc,
          [cur]: milestones,
        };
      }, {});

      console.log({ milestones });

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

      const artifactData = Response.profileProgression.data;

      if (!artifactData) {
        throw new Error("Failed to retrieve artifact data");
      }

      const charId =
        localStorage.getItem(STORAGE_ACTIVE_CHAR_ID) ??
        Object.keys(characters)[0];

      actions.setInitialData({
        activeCharId: charId,
        topCharactersItem: topItemsByChar,
        artifactPowerBonus: artifactData.seasonalArtifact.powerBonus,
        characters,
        memberships,
        milestones,
      });
    } catch (error) {
      actions.setErrorText(error.message);
      console.error(error);
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
  setInitialData: action((state, payload) => {
    state.memberships = payload.memberships;
    state.characters = payload.characters;
    state.activeCharId = payload.activeCharId;
    state.topCharactersItem = payload.topCharactersItem;
    state.artifactPowerBonus = payload.artifactPowerBonus;
    state.milestones = payload.milestones;
  }),
});
