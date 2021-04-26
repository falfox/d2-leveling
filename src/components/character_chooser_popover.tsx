import { Popover } from "@headlessui/react";
import clsx from "clsx";
import React, { ReactNode } from "react";
import { CLASS_NAMES } from "../consts";
import { DestinyStores } from "../stores/destiny";

export function CharacterChooserPopover({ header }: { header: ReactNode }) {
  const { activeCharId, characters } = DestinyStores.useStoreState(
    (state) => state
  );
  const { setActiveCharId } = DestinyStores.useStoreActions(
    (actions) => actions
  );
  return (
    <Popover>
      <Popover.Button className="relative md:pointer-events-auto">{header}</Popover.Button>

      <Popover.Panel className="absolute block px-2 py-1 bg-white rounded-md shadow-2xl md:hidden">
        <div className="flex flex-col pt-3 space-y-3">
          {characters
            ? Object.keys(characters).map((character) => {
                const char = characters[character];
                return (
                  <div className="relative" key={character}>
                    <button
                      onClick={() => {
                        setActiveCharId(char.characterId);
                      }}
                      type="button"
                      key={char.characterId}
                      className={clsx(
                        "flex flex-col justify-center text-white bg-no-repeat bg-cover rounded px-14 h-14 transform transition-transform bg-opacity-40 w-full"
                      )}
                      style={{
                        backgroundImage: `url(https://www.bungie.net/${char.emblemBackgroundPath})`,
                      }}
                    >
                      {char.characterId === activeCharId && (
                        <div className="absolute inset-y-0 right-0">
                          <div className="w-2 h-full -mr-px bg-yellow-600 rounded-l-md"></div>
                        </div>
                      )}
                      <span className="block text-xl font-bold leading-5 capitalize">
                        {CLASS_NAMES[char.classType]}
                      </span>
                      <span className="block text-sm font-normal">
                        {char.light}
                      </span>
                    </button>
                  </div>
                );
              })
            : "Loading..."}
        </div>
      </Popover.Panel>
    </Popover>
  );
}
