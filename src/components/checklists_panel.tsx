import React from "react";
import {
  ALL_PINNACLE_ITEM_HASH,
  ALL_POWERFUL_ITEM_HASH,
  SEASONAL_HARD_CAP,
} from "../consts";
import { CUSTOM_MILESTONES_PROPERTIES } from "../services/destiny/milestones";
import { DestinyStores } from "../stores/destiny";
import { calculateMaxPowerExactByTopItems } from "../utils";
import { ChecklistItem } from "./checklist_item";

export function ChecklistsPanel({
  hideCompleted,
  handleHideToggle,
}: {
  hideCompleted: boolean;
  handleHideToggle: (checke: boolean) => void;
}) {
  const { milestones, activeCharId, topCharactersItem } =
    DestinyStores.useStoreState((state) => state);

  if (!milestones || !activeCharId || !topCharactersItem)
    throw new Error("Missing milestones or activeCharId or topCharactersItem");

  const currentMaxPowerExact = calculateMaxPowerExactByTopItems(
    topCharactersItem[activeCharId]
  );

  const hardCapReached = currentMaxPowerExact >= SEASONAL_HARD_CAP;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between pt-6">
        <h3 className="text-2xl font-bold align-bottom">Checklists</h3>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="hide_completed"
            className="text-blue-600 rounded"
            onChange={(e) => handleHideToggle(e.target.checked)}
            checked={hideCompleted}
          />
          <span className="text-sm font-medium">Hide Completed</span>
        </label>
      </div>

      <div className="pt-6">
        <h4 className="pb-2 text-lg font-semibold">Pinnacle</h4>
        <ul className="space-y-4">
          {milestones[activeCharId]
            ?.filter((mile) => {
              if (hideCompleted && mile.completed) return false;

              return mile.rewardItems.some((i) =>
                ALL_PINNACLE_ITEM_HASH.includes(i.itemHash)
              );
            })
            .sort((a, b) => {
              const rewardA =
                CUSTOM_MILESTONES_PROPERTIES[a.friendlyName]?.rewards?.[0]
                  ?.itemHash ?? a.rewardItems?.[0].itemHash;
              const rewardB =
                CUSTOM_MILESTONES_PROPERTIES[b.friendlyName]?.rewards?.[0]
                  ?.itemHash ?? b.rewardItems?.[0].itemHash;
              return rewardA - rewardB;
            })
            .map((mile) => (
              <ChecklistItem
                milestone={mile}
                key={mile.hash}
                hardCapReached={hardCapReached}
              />
            ))}
        </ul>
      </div>

      <div className="pt-6">
        <h4 className="pb-2 text-lg font-semibold">Powerful</h4>
        <ul className="space-y-4">
          {milestones[activeCharId]
            ?.filter(function (mile) {
              if (hideCompleted && mile.completed) return false;

              return mile.rewardItems.some((i) =>
                ALL_POWERFUL_ITEM_HASH.includes(i.itemHash)
              );
            })
            .sort((a, b) => {
              const rewardA =
                CUSTOM_MILESTONES_PROPERTIES[a.friendlyName]?.rewards?.[0]
                  ?.itemHash ?? a.rewardItems?.[0].itemHash;
              const rewardB =
                CUSTOM_MILESTONES_PROPERTIES[b.friendlyName]?.rewards?.[0]
                  ?.itemHash ?? b.rewardItems?.[0].itemHash;
              return rewardA - rewardB;
            })
            .map((mile) => (
              <ChecklistItem
                milestone={mile}
                key={mile.hash}
                hardCapReached={hardCapReached}
              />
            ))}
        </ul>
      </div>
    </div>
  );
}
