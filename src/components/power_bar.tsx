import { DestinyItemComponent } from "bungie-api-ts/destiny2";
import clsx from "clsx";
import React from "react";
import { DisplayDestinyItemComponent } from "../App";

export function PowerBar({
  currentMaxPower,
  currentPowerPlus,
  topItemBySlot,
}: {
  topItemBySlot: DisplayDestinyItemComponent[] | null;
  currentMaxPower: number;
  currentPowerPlus: number;
}) {
  return (
    <div className="flex items-center pt-1 space-x-1">
      {(topItemBySlot ?? new Array(8).fill(0)).map((_, i) => {
        return (
          <div
            key={i}
            className={clsx(
              "flex-1 py-px rounded-xl",
              currentMaxPower >= 1310
                ? "bg-emerald-600"
                : {
                    "bg-emerald-600": i < currentPowerPlus,
                    "bg-gray-300": i >= currentPowerPlus,
                  }
            )}
          >
            <div className="h-1"></div>
          </div>
        );
      })}
    </div>
  );
}
