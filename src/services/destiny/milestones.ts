import {
  DestinyDisplayPropertiesDefinition,
  DestinyItemQuantity,
  DestinyMilestoneActivityPhase,
  DestinyMilestoneChallengeActivityDefinition,
  DestinyMilestoneQuestDefinition,
  DestinyPublicMilestone,
} from "bungie-api-ts/destiny2";
import {
  PINNACLE_ITEM_HASH,
  PINNACLE_ITEM_WEAK_HASH,
  POWERFUL_TIER_1_ITEM_HASH,
  POWERFUL_TIER_3_ITEM_HASH,
} from "../../consts";
import { ManifestData } from "../bungie";

export const MADE_UP_MILESTONES: DestinyPublicMilestone[] = [];

export const ALL_AVAILABLE_CHALLENGES = [];

export const CUSTOM_MILESTONES_PROPERTIES: {
  [key: string]: {
    name?: string;
    rewards?: DestinyItemQuantity[];
  };
} = {
  MILESTONE_WEEKLY_PROPHECY_DUNGEON_PINNACLE: {
    name: "Prophecy Weekly Completion",
  },
  MILESTONE_WEEKLY_NIGHTFALL_SCORE: {
    name: "Nightfall 100k Score",
  },
  MILESTONE_WEEKLY_CRUCIBLE_ANY: {
    rewards: [],
  },
  MILESTONE_WEEKLY_BATTLEGROUNDS_FIRST: {
    name: "Weekly Battlegrounds Playlist (3)",
  },
  MILESTONE_WEEKLY_BATTLEGROUNDS_SECOND: {
    name: "Weekly Battlegrounds Playlist (6)",
  },
  MILESTONE_WEEKLY_BATTLEGROUNDS_THIRD: {
    name: "Weekly Battlegrounds Playlist (9)",
  },
  MILESTONE_WEEKLY_OVERRIDE_CHESTS: {
    name: "Digital Trove (Open 3 Conflux Chests)",
    rewards: [
      {
        itemHash: PINNACLE_ITEM_WEAK_HASH,
        quantity: 1,
        hasConditionalVisibility: false,
      },
    ],
  },
  MILESTONE_WEEKLY_VAULT_OF_GLASS: {
    name: "Vault of Glass",
  },
};

export interface DestinyMilestoneDisplay {
  hash: number;
  displayProperties: DestinyDisplayPropertiesDefinition;
  friendlyName: string;
  hasActivities: boolean;
  activities?: DestinyMilestoneChallengeActivityDefinition[];
  hasQuest: boolean;
  quests?: DestinyMilestoneQuestDefinition[];
  rewardItems: DestinyItemQuantity[];
  phases?: DestinyMilestoneActivityPhase[];
  completed: number;
  maxCompleted: number;
  dependsOn: string[];
  hasAccess: boolean;
}

export function getPinnacleAndPowerfulMilestones(
  milestones: {
    [key: string]: DestinyPublicMilestone;
  },
  manifest: ManifestData
): DestinyMilestoneDisplay[] {
  const reducedMilestones = [];

  const dares = manifest.DestinyMilestoneDefinition[295129163];

  if (!dares) throw new Error("Failed to retrieve prophecy definition");

  // Borrows defs from Prophecy
  manifest.DestinyMilestoneDefinition[3278614711] = {
    ...dares,
    activities: [
      {
        activityHash: 4212753278,
        challenges: [
          {
            challengeObjectiveHash: 3278614711,
          },
        ],
        activityGraphNodes: [],
        phases: [],
      },
    ],
    defaultOrder: 9000,
    displayProperties: {
      ...dares?.displayProperties,
      description:
        "Search the Glykon to earn Dead Man's Tale, and get yourself a Pinnacle drop while you're there",
      name: "Weekly Presage Challenge",
      icon: "/common/destiny2_content/icons/3e67c5cbdb9f63247765dd7f2fa464e8.png",
    },
    friendlyName: "PRESAGE_WEEKLY_CHALLENGE",
  };
  // Fake milestone hash
  manifest.DestinyMilestoneDefinition[291895719] = {
    ...dares,
    activities: [],
    defaultOrder: 9000,
    displayProperties: {
      ...dares?.displayProperties,
      description: "Complete a Master Empire Hunt",
      name: "Master Empire Hunt",
      icon: "/common/destiny2_content/icons/3e67c5cbdb9f63247765dd7f2fa464e8.png",
    },
    friendlyName: "MASTER_EMPIRE_HUNT_WEEKLY",
  };

  const filtered = Object.keys(milestones).filter((k) => {
    const def = manifest.DestinyMilestoneDefinition[k];
    return (
      def &&
      // def.milestoneType === DestinyMilestoneType.Weekly &&
      !["534869653", "4253138191", "480262465"].includes(k)
      // Skip XuR, Clan Objectives and Master Class (Guardian Games) for now
    );
  });

  for (const hash of filtered) {
    const mile = milestones[hash];
    const mileDefs = manifest.DestinyMilestoneDefinition[mile.milestoneHash];

    if (!mileDefs) continue;

    let rewardItems: DestinyItemQuantity[] = [];
    const rewards = mileDefs.rewards;
    const hasQuest = Boolean(mileDefs.quests);
    const quests = Object.values(mileDefs.quests ?? {});

    if (rewards) {
      rewardItems = Object.values(rewards)
        .map((cat) => cat.rewardEntries)
        .flat()
        .map((ent) => Object.values(ent))
        .flat()
        .map((ent) => ent.items)
        .flat();
    } else if (hasQuest) {
      const quest = quests?.[0];
      if (!quest) continue;
      const questRewards = quest.questRewards?.items;

      if (mile.milestoneHash === 3603098564) {
        // Clan Rewards 5K EXP
        rewardItems.push({
          itemHash: PINNACLE_ITEM_WEAK_HASH,
          quantity: 1,
          hasConditionalVisibility: false,
        });
      } else if (questRewards?.length) {
        rewardItems.push(...questRewards);
      }
    } else {
      if (mile.milestoneHash === 541780856) {
        // Deep Stone Crypt
        rewardItems.push({
          itemHash: POWERFUL_TIER_3_ITEM_HASH,
          quantity: 1,
          hasConditionalVisibility: false,
        });
      }
    }

    if ([1437935813, 3448738070, 3312774044].includes(mile.milestoneHash)) {
      // Weekly Vanguard, Gambit, and Crucible match/playlist
      rewardItems = [
        {
          itemHash: PINNACLE_ITEM_WEAK_HASH,
          quantity: 1,
          hasConditionalVisibility: false,
        },
      ];
    } else if (
      [2709491520, 4186783783, 2594202463, 3899487295].includes(
        mile.milestoneHash
      )
    ) {
      // Weekly Vanguard, Gambit, Crucible and Banshee 8 bounties
      rewardItems = [
        {
          itemHash: POWERFUL_TIER_1_ITEM_HASH,
          quantity: 1,
          hasConditionalVisibility: false,
        },
      ];
    }

    let dependsOn: string[] = [];
    if (hash == "3628293757") {
      // Trials Three Wins
    } else if (hash == "3628293755") {
      // Trials Five Wins
      dependsOn.push("3628293757");
    } else if (hash == "3628293753") {
      // Trials Seven Wins
      dependsOn.push("3628293757", "3628293755");
    } else if (hash == "3632712541") {
      // Battlegrounds Playlist 3
    }

    const milestoneDisplay: DestinyMilestoneDisplay = {
      hash: mile.milestoneHash,
      friendlyName: mileDefs.friendlyName,
      displayProperties: mileDefs.displayProperties,
      hasActivities: Boolean(mileDefs.activities),
      activities: mileDefs.activities,
      rewardItems: rewardItems,
      completed: 0, // This is just placeholder
      maxCompleted: mile.activities?.[0]?.phaseHashes?.length ?? 1, // Phases for Raids
      hasQuest: Boolean(mileDefs.quests),
      quests: Object.values(mileDefs.quests ?? {}),
      dependsOn,
      hasAccess: false,
    };

    reducedMilestones.push(milestoneDisplay);
  }

  return reducedMilestones;
}
