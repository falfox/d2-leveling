import { FlagSolid } from "@graywolfai/react-heroicons";
import clsx from "clsx";
import React from "react";
import {
  PINNACLE_ITEM_HASH,
  PINNACLE_ITEM_WEAK_HASH,
  POWERFUL_TIER_1_ITEM_HASH,
  POWERFUL_TIER_2_ITEM_HASH,
  POWERFUL_TIER_3_ITEM_HASH,
} from "../consts";
import {
  CUSTOM_MILESTONES_PROPERTIES,
  DestinyMilestoneDisplay,
} from "../services/destiny/milestones";

export function ChecklistItem({
  milestone,
  hardCapReached = false,
}: {
  milestone: DestinyMilestoneDisplay;
  hardCapReached: boolean;
}) {
  const completed = milestone.completed;
  const rewardItem = milestone.rewardItems?.[0].itemHash;

  return (
    <li
      className={clsx("flex items-start space-x-2", {
        "text-gray-400 line-through font-medium": completed,
        "font-semibold": !completed,
      })}
      key={milestone.hash}
      data-hash={milestone.hash}
    >
      {milestone.displayProperties.icon ? (
        <img
          className={clsx("w-6 h-6 flex-shrink-0", {
            "bg-gray-700": !completed,
            "bg-gray-400": completed,
          })}
          src={`https://www.bungie.net${milestone.displayProperties.icon}`}
          alt={milestone.displayProperties.description}
        />
      ) : (
        <FlagSolid
          className={clsx("w-6 h-6 flex-shrink-0 text-white p-1", {
            "bg-gray-700": !completed,
            "bg-gray-400": completed,
          })}
        ></FlagSolid>
      )}
      <div className="flex flex-col w-full space-y-1 truncate">
        <span
          className="w-full truncate"
          title={
            milestone.friendlyName ?? milestone.displayProperties.description
          }
        >
          {CUSTOM_MILESTONES_PROPERTIES[milestone.friendlyName]?.name ??
            milestone.displayProperties.name}
        </span>
        {milestone.maxCompleted > 1 && (
          <div className="flex space-x-1">
            {milestone?.phases?.map((phase) => (
              <div
                key={phase.phaseHash}
                className={clsx("flex-shrink-0 w-3 h-3 border", {
                  "border-gray-700": !phase.complete,
                  "border-transparent bg-yellow-500": phase.complete,
                })}
              ></div>
            ))}
          </div>
        )}
      </div>
      <span className="flex-shrink-0 tabular-nums">
        {rewardItem === PINNACLE_ITEM_HASH && `+${hardCapReached ? 2 : 5}`}
        {rewardItem === PINNACLE_ITEM_WEAK_HASH && `+${hardCapReached ? 1 : 4}`}
        {rewardItem === POWERFUL_TIER_3_ITEM_HASH &&
          `+${hardCapReached ? 0 : 5}`}
        {rewardItem === POWERFUL_TIER_2_ITEM_HASH &&
          `+${hardCapReached ? 0 : 4}`}
        {rewardItem === POWERFUL_TIER_1_ITEM_HASH &&
          `+${hardCapReached ? 0 : 3}`}
      </span>
    </li>
  );
}
