import {
  DestinyActivity,
  DestinyDisplayPropertiesDefinition,
  DestinyItemQuantity,
  DestinyMilestone,
  DestinyMilestoneChallengeActivityDefinition,
  DestinyMilestoneDefinition,
  DestinyMilestoneType,
} from "bungie-api-ts/destiny2";
import { ManifestData } from "../bungie";

export const CUSTOM_MILESTONE_NAMES: { [key: string]: string } = {
  MILESTONE_WEEKLY_PROPHECY_DUNGEON_PINNACLE: "Prophecy Weekly Completion",
  MILESTONE_WEEKLY_NIGHTFALL_SCORE: "Nightfall 100k Score",
};

export interface DestinyMilestoneDisplay {
  hash: number;
  displayProperties: DestinyDisplayPropertiesDefinition;
  friendlyName: string;
  hasActivities: boolean;
  activities?: DestinyMilestoneChallengeActivityDefinition[];
  rewardItems: DestinyItemQuantity[];
}

export function getPinnacleAndPowerfulMilestones(
  milestones: {
    [key: string]: DestinyMilestone;
  },
  manifest: ManifestData
): DestinyMilestoneDisplay[] {
  const reducedMilestones = [];
  const filtered = Object.keys(milestones).filter((k) => {
    const def = manifest.DestinyMilestoneDefinition[k];
    return (
      def &&
      def.milestoneType === DestinyMilestoneType.Weekly &&
      k !== "534869653"
      // Skip XuR
    );
  });

  for (const key of filtered) {
    const mile = milestones[key];
    const mileDefs = manifest.DestinyMilestoneDefinition[mile.milestoneHash];
    if (!mileDefs) continue;

    const rewards = mileDefs.rewards;
    if (!rewards) continue;

    const rewardItems = Object.values(rewards)
      .map((cat) => cat.rewardEntries)
      .flat()
      .map((ent) => Object.values(ent))
      .flat()
      .map((ent) => ent.items)
      .flat();

    const milestoneDisplay: DestinyMilestoneDisplay = {
      hash: mile.milestoneHash,
      friendlyName: mileDefs.friendlyName,
      displayProperties: mileDefs.displayProperties,
      hasActivities: Boolean(mileDefs.activities),
      activities: mileDefs.activities,
      rewardItems: rewardItems,
    };

    reducedMilestones.push(milestoneDisplay);
  }

  return reducedMilestones;
}
