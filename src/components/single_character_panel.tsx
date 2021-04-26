import { ChevronDownSolid } from "@graywolfai/react-heroicons";
import { DestinyCharacterComponent } from "bungie-api-ts/destiny2";
import clsx from "clsx";
import { floor } from "lodash";
import React from "react";
import { DisplayDestinyItemComponent } from "../App";
import {
  CLASS_NAMES,
  ITEM_BUCKET_SLOTS,
  RACE_NAMES,
  SEASONAL_PINNACLE_CAP
} from "../consts";
import { DestinyStores } from "../stores/destiny";
import { calculateMaxPowerExactByTopItems } from "../utils";
import { CharacterChooserPopover } from "./character_chooser_popover";
import { PowerBar } from "./power_bar";

export function SingleCharacterPanel({
  character,
  topItemBySlot,
}: {
  character: DestinyCharacterComponent;
  topItemBySlot: DisplayDestinyItemComponent[] | null;
}) {
  const { is_fetching, artifactPowerBonus } = DestinyStores.useStoreState(
    (state) => state
  );
  const currentMaxPowerExact = calculateMaxPowerExactByTopItems(topItemBySlot);

  const currentMaxPower = floor(currentMaxPowerExact);
  const currentMaxPowerRemainder = currentMaxPowerExact % 1;
  const artifactPower = artifactPowerBonus;
  const currentPowerPlus = currentMaxPowerRemainder * 8;

  return (
    <>
      <div className="flex justify-between">
        <div className="relative flex flex-col space-y-1 text-left">
          <span className="text-sm font-semibold leading-4 uppercase">
            {RACE_NAMES[character.raceType]}
          </span>
          <CharacterChooserPopover
            header={
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold tracking-tighter capitalize">
                  {CLASS_NAMES[character.classType]}
                </span>
                <ChevronDownSolid className="w-5 h-5 fill-current md:hidden" />
                {is_fetching && (
                  <svg
                    className="w-5 h-5 mr-3 -ml-1 text-gray-900 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx={12}
                      cy={12}
                      r={10}
                      stroke="currentColor"
                      strokeWidth={4}
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
              </div>
            }
          />
        </div>
        <div className="flex flex-col space-y-1 text-right">
          <span className="text-sm font-semibold leading-4">
            {currentMaxPower}
            <span className="pl-1 text-blue-600">+{artifactPower}</span>
          </span>
          <span className="text-2xl font-bold">
            {currentMaxPower + artifactPower}
          </span>
        </div>
      </div>

      <div className="pt-3 pb-2">
        <div className="flex items-end justify-between align-baseline">
          <div className="space-x-1 font-semibold">
            <span>
              {currentMaxPower >= SEASONAL_PINNACLE_CAP
                ? currentMaxPower - 1
                : currentMaxPower}
            </span>
            <span className="text-sm text-emerald-600">
              +{currentPowerPlus}
            </span>
          </div>
          <div className="space-x-1 font-semibold">
            <span>
              {currentMaxPower >= SEASONAL_PINNACLE_CAP
                ? currentMaxPower
                : currentMaxPower + 1}
            </span>
            <span className="text-sm text-orange-600">
              {currentMaxPower >= SEASONAL_PINNACLE_CAP
                ? `+0`
                : `-${8 - currentPowerPlus}`}
            </span>
          </div>
        </div>

        <PowerBar
          currentMaxPower={currentMaxPower}
          currentPowerPlus={currentPowerPlus}
          topItemBySlot={topItemBySlot}
        />

        <div className="pt-5">
          <div className="flex flex-col w-full space-y-2">
            {topItemBySlot?.map((item, i) => {
              const itemPower = item.instanceData.primaryStat.value;
              const isMaxCap = itemPower === SEASONAL_PINNACLE_CAP;
              const powerPlus = itemPower - currentMaxPower;
              const isAbove = powerPlus >= 0;

              return (
                <div
                  className={clsx("flex items-center group", {
                    "text-emerald-600": isMaxCap,
                    "text-gray-700": !isMaxCap && powerPlus === 0,
                    "text-gray-900": !isMaxCap && isAbove,
                    "text-orange-600": !isMaxCap && !isAbove,
                  })}
                  key={i}
                >
                  <img
                    src={
                      "https://www.bungie.net/" +
                      item.itemDefinition.displayProperties.icon
                    }
                    alt=""
                    className="flex-shrink-0 w-12 h-12 bg-gray-600 rounded-md"
                  />
                  <div className="flex items-center flex-1 h-12 px-2 mx-1 overflow-auto font-semibold rounded hover:bg-gray-200">
                    <span className="font-bold">
                      {item.instanceData.primaryStat.value}
                    </span>
                    <div className="flex items-center flex-1 min-w-0 pl-2 text-gray-800 capitalize truncate">
                      <span className="hidden group-hover:inline-block">
                        {item.itemDefinition.displayProperties.name}
                      </span>
                      <span className="inline-block group-hover:hidden">
                        {
                          ITEM_BUCKET_SLOTS[
                            item.itemDefinition.inventory?.bucketTypeHash!
                          ]
                        }
                      </span>
                    </div>
                    <span className="flex-shrink-0 pl-2 text-right tabular-nums">
                      {isAbove ? `+${powerPlus}` : powerPlus}
                    </span>
                  </div>
                </div>
              );
            })}
            {/* <div className="flex items-center justify-end px-3 py-1 font-semibold text-right text-orange-600 tabular-nums">
              {topItemBySlot?.reduce((acc, item) => {
                const powerPlus =
                  item.instanceData.primaryStat.value - currentMaxPower;

                return acc + (powerPlus < 0 ? powerPlus : 0);
              }, 0)}
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
}
