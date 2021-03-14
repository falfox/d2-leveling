import {
  DestinyDisplayPropertiesDefinition,
  DestinyItemQuantity,
  DestinyMilestoneActivityPhase,
  DestinyMilestoneChallengeActivityDefinition,
  DestinyPublicMilestone,
} from "bungie-api-ts/destiny2";
import { PINNACLE_ITEM_HASH } from "../../consts";
import { ManifestData } from "../bungie";

export const MADE_UP_MILESTONES: DestinyPublicMilestone[] = [];

export const ALL_AVAILABLE_CHALLENGES = [];

export const CUSTOM_MILESTONES_PROPERTIES: {
  [key: string]: {
    name?: string;
    rewards?: {
      pinnacle?: {
        beforeHardCap: number;
        afterHardCap: number;
      };
      powerful?: {
        beforeHardCap: number;
        afterHardCap: number;
      };
    };
  };
} = {
  MILESTONE_WEEKLY_PROPHECY_DUNGEON_PINNACLE: {
    name: "Prophecy Weekly Completion",
  },
  MILESTONE_WEEKLY_NIGHTFALL_SCORE: {
    name: "Nightfall 100k Score",
  },
  MILESTONE_WEEKLY_CRUCIBLE_ANY: {
    rewards: {
      pinnacle: {
        beforeHardCap: 3,
        afterHardCap: 1,
      },
    },
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
};

export interface DestinyMilestoneDisplay {
  hash: number;
  displayProperties: DestinyDisplayPropertiesDefinition;
  friendlyName: string;
  hasActivities: boolean;
  activities?: DestinyMilestoneChallengeActivityDefinition[];
  rewardItems: DestinyItemQuantity[];
  phases?: DestinyMilestoneActivityPhase[];
  completed: number;
  maxCompleted: number;
  dependsOn: string[];
}

export function getPinnacleAndPowerfulMilestones(
  milestones: {
    [key: string]: DestinyPublicMilestone;
  },
  manifest: ManifestData
): DestinyMilestoneDisplay[] {
  const reducedMilestones = [];
  const filtered = Object.keys(milestones).filter((k) => {
    const def = manifest.DestinyMilestoneDefinition[k];
    return (
      def &&
      // def.milestoneType === DestinyMilestoneType.Weekly &&
      k !== "534869653"
      // Skip XuR
    );
  });

  for (const hash of filtered) {
    const mile = milestones[hash];
    const mileDefs = manifest.DestinyMilestoneDefinition[mile.milestoneHash];

    if (!mileDefs) continue;

    let rewardItems: DestinyItemQuantity[] = [];

    // if (mileDefs?.activities?.length) {
    //   const activity = mileDefs.activities[0];

    //   if (activity?.challenges?.length) {
    //     const challenge = activity.challenges[0];

    //     const objective =
    //       manifest.DestinyObjectiveDefinition[challenge.challengeObjectiveHash];
    //     if (!objective) continue;
    //   }
    // }

    const rewards = mileDefs.rewards;

    if (rewards) {
      rewardItems = Object.values(rewards)
        .map((cat) => cat.rewardEntries)
        .flat()
        .map((ent) => Object.values(ent))
        .flat()
        .map((ent) => ent.items)
        .flat();
    } else {
      if (mile.milestoneHash === 541780856) {
        rewardItems.push({
          itemHash: PINNACLE_ITEM_HASH,
          quantity: 1,
        });
      }
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
    } else if (hash == "2953722265") {
      // Battlegrounds Playlist 6
      dependsOn.push("3632712541");
    } else if (hash == "3031052508") {
      // Battlegrounds Playlist 9;
      dependsOn.push("3632712541", "2953722265");
    }

    const milestoneDisplay: DestinyMilestoneDisplay = {
      hash: mile.milestoneHash,
      friendlyName: mileDefs.friendlyName,
      displayProperties: mileDefs.displayProperties,
      hasActivities: Boolean(mileDefs.activities),
      activities: mileDefs.activities,
      rewardItems: rewardItems,
      completed: 0, // This is just placeholder
      maxCompleted: mile.activities?.[0].phaseHashes?.length ?? 1, // Phases for Raids
      dependsOn,
    };

    reducedMilestones.push(milestoneDisplay);
  }

  return reducedMilestones;
}
