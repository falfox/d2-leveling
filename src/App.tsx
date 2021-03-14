import {
  ChevronDoubleLeftSolid,
  ChevronDoubleRightSolid,
  RefreshOutline,
  ViewBoardsOutline,
  ViewBoardsSolid,
} from "@graywolfai/react-heroicons";
import {
  DestinyInventoryItemDefinition,
  DestinyItemComponent,
  DestinyItemInstanceComponent,
} from "bungie-api-ts/destiny2";
import clsx from "clsx";
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";
import { parse } from "query-string";
import React, { useEffect, useState } from "react";
import { LoginWithBungie } from "./components/login_with_bungie";
import { MembershipBadge } from "./components/membership_badge";
import { SingleCharacterPanel } from "./components/single_character_panel";
import {
  ALL_POWERFUL_ITEM_HASH,
  CLASS_NAMES,
  PINNACLE_ITEM_HASH,
} from "./consts";
import { getAccessToken } from "./services/auth";
import { CUSTOM_MILESTONE_NAMES } from "./services/destiny/milestones";
import { AuthStore } from "./stores/auth";
import { DestinyStores } from "./stores/destiny";

const rightPanelVariants = {
  hidden: { opacity: 0, width: 0, display: "hidden" },
  visible: { opacity: 1, width: "100%", display: "block" },
};

export interface DisplayDestinyItemComponent extends DestinyItemComponent {
  instanceData: DestinyItemInstanceComponent;
  itemDefinition: DestinyInventoryItemDefinition;
}

function App() {
  const state = AuthStore.useStoreState((state) => state.state);
  const setState = AuthStore.useStoreActions((actions) => actions.setState);

  console.log({
    state,
  });

  useEffect(() => {
    const qs = parse(window.location.search);
    if (qs.code && state === "uninitialize") {
      setState("logging_in");
      getAccessToken(qs.code as string)
        .then(() => {
          window.location.replace("/");
        })
        .catch((err) => {
          setState("error");
        });
    }
  }, [window.location.search, state]);

  if (state !== "logged_in")
    return (
      <div
        className="relative flex items-center justify-center w-full min-h-screen space-x-2 text-gray-900"
        style={{
          backgroundImage:
            "url(https://www.bungie.net/7/ca/destiny/bgs/season13/pass_overview_bg_desktop.jpg)",
        }}
      >
        <div className="absolute inset-0 z-0 bg-gray-900 bg-opacity-70"></div>
        <div className="relative z-10">
          <LoginWithBungie />;
        </div>
      </div>
    );

  return <NewApp />;
}

function NewApp() {
  const loadProfiles = DestinyStores.useStoreActions(
    (actions) => actions.loadProfiles
  );
  const { hasData } = DestinyStores.useStoreState((state) => state);

  useEffect(() => {
    loadProfiles({
      force: false,
    });
  }, []);

  return (
    <div className="antialiased">
      {!hasData ? (
        <div
          className="relative flex items-center justify-center w-full min-h-screen space-x-2 text-gray-900"
          style={{
            backgroundImage:
              "url(https://www.bungie.net/7/ca/destiny/bgs/season13/pass_overview_bg_desktop.jpg)",
          }}
        >
          <div className="absolute inset-0 z-0 bg-gray-900 bg-opacity-70"></div>
          <div className="relative z-10">
            <button
              type="button"
              className="flex items-center px-4 py-3 space-x-3 bg-white rounded-md shadow-md"
              disabled={true}
            >
              <RefreshOutline className="w-6 h-6 animate-spin" />
              <span className="font-semibold">Loading Characters...</span>
            </button>
          </div>
        </div>
      ) : (
        <AppOld />
      )}
    </div>
  );
}

function AppOld() {
  const [rightPanelAnimate, toggleRightPanel] = useState<
    keyof typeof rightPanelVariants
  >("visible");

  const [panelView, setPanelView] = useState<"single" | "multi">("single");
  const {
    activeCharId,
    characters,
    memberships,
    topCharactersItem,
    is_fetching,
    milestones,
  } = DestinyStores.useStoreState((state) => state);

  console.log({
    is_fetching,
    milestones,
  });

  const loadProfiles = DestinyStores.useStoreActions(
    (actions) => actions.loadProfiles
  );
  const setActiveCharId = DestinyStores.useStoreActions(
    (actions) => actions.setActiveCharId
  );

  if (!characters) throw new Error("Missing characters");
  if (!activeCharId) throw new Error("Missing active character");
  if (!topCharactersItem) throw new Error("Missing top items");
  if (!milestones) throw new Error("Missing milestones");

  const character = characters?.[activeCharId];

  const membership = memberships?.[0];

  if (!membership) throw new Error("Missing membership");

  return (
    <div
      className="flex items-center justify-center w-full min-h-screen space-x-2 text-gray-900"
      style={{
        backgroundImage:
          "url(https://www.bungie.net/7/ca/destiny/bgs/season13/pass_overview_bg_desktop.jpg)",
      }}
    >
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-center">
          <div className="relative w-192">
            <MembershipBadge />
            <div className="absolute top-0 right-0 -mt-12">
              <div className="flex items-center justify-end w-full py-4 space-x-4">
                <button
                  title="Multi Characters View"
                  onClick={() => {
                    setPanelView(panelView === "multi" ? "single" : "multi");
                  }}
                >
                  {panelView === "multi" ? (
                    <ViewBoardsSolid className={"w-5 h-5 text-white"} />
                  ) : (
                    <ViewBoardsOutline className={"w-5 h-5 text-white"} />
                  )}
                </button>
                <button
                  title="Refresh"
                  onClick={() => {
                    loadProfiles({
                      force: true,
                    });
                  }}
                  disabled={is_fetching}
                >
                  <RefreshOutline
                    className={clsx("w-5 h-5 text-white", {
                      "animate-spin": is_fetching,
                    })}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          className="flex justify-center w-full"
          style={{
            height: "656px",
          }}
        >
          <AnimateSharedLayout>
            <AnimatePresence>
              {panelView === "multi" &&
                Object.keys(characters)
                  .filter((c) => c !== activeCharId)
                  .map((char, i) => (
                    <motion.div
                      key={char}
                      layout
                      initial="hidden"
                      animate={["hidden", "visible"]}
                      exit="hidden"
                      variants={rightPanelVariants}
                      transition={{
                        ease: "easeIn",
                      }}
                      className="max-w-sm overflow-y-auto bg-white shadow first:rounded-l-xl last:rounded-r-xl"
                    >
                      <div className="relative p-6">
                        <SingleCharacterPanel
                          character={characters?.[char]}
                          topItemBySlot={topCharactersItem[char]}
                        />
                      </div>
                    </motion.div>
                  ))}
            </AnimatePresence>
            <motion.div
              layout
              animate="visible"
              variants={rightPanelVariants}
              className="relative max-w-sm transition-all duration-200 bg-white shadow first:rounded-l-xl last:rounded-r-xl"
            >
              <AnimatePresence>
                {panelView === "single" && (
                  <motion.div
                    initial={{
                      opacity: 1,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="absolute top-0 left-0 px-1 -ml-40 space-y-3"
                  >
                    {characters &&
                      Object.values(characters).map((char) => {
                        return (
                          <button
                            onClick={() => {
                              setActiveCharId(char.characterId);
                            }}
                            type="button"
                            key={char.characterId}
                            className="flex flex-col justify-center text-white bg-white bg-no-repeat bg-cover rounded-lg shadow-md w-36 px-14 h-14"
                            style={{
                              backgroundImage: `url(https://www.bungie.net/${char.emblemBackgroundPath})`,
                            }}
                          >
                            <span className="block text-xl font-bold leading-5 capitalize">
                              {CLASS_NAMES[char.classType]}
                            </span>
                            <span className="block text-sm font-normal">
                              {char.light}
                            </span>
                          </button>
                        );
                      })}
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                <div className="relative p-6">
                  {panelView === "single" && (
                    <motion.div
                      initial={{
                        opacity: 1,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      className="absolute top-0 right-0 z-20 mt-4 -mr-5"
                    >
                      <button
                        className="focus:outline-none"
                        onClick={() => {
                          toggleRightPanel(
                            rightPanelAnimate === "hidden"
                              ? "visible"
                              : "hidden"
                          );
                        }}
                      >
                        <div className="p-2 bg-white border border-gray-200 rounded-full shadow-xl">
                          {rightPanelAnimate === "hidden" ? (
                            <ChevronDoubleRightSolid className="w-5 h-5" />
                          ) : (
                            <ChevronDoubleLeftSolid className="w-5 h-5" />
                          )}
                        </div>
                      </button>
                    </motion.div>
                  )}

                  <SingleCharacterPanel
                    character={character}
                    topItemBySlot={topCharactersItem[activeCharId]}
                  />
                </div>
              </AnimatePresence>
            </motion.div>
            <AnimatePresence>
              {panelView === "single" && rightPanelAnimate === "visible" && (
                <motion.div
                  initial="hidden"
                  // animate={rightPanelAnimate}
                  animate={["hidden", "visible"]}
                  variants={rightPanelVariants}
                  transition={{
                    ease: "easeInOut",
                  }}
                  exit="hidden"
                  className="max-w-sm overflow-y-auto bg-white shadow rounded-r-xl"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between pt-6">
                      <h3 className="text-2xl font-bold align-bottom">
                        Checklists
                      </h3>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="hide_completed"
                          className="text-blue-600 rounded"
                        />
                        <span className="text-sm font-medium">
                          Hide Completed
                        </span>
                      </div>
                    </div>

                    <div className="pt-6">
                      <h4 className="pb-2 text-lg font-semibold">Pinnacle</h4>
                      <ul className="space-y-4">
                        {milestones[activeCharId]
                          ?.filter((mile) =>
                            mile.rewardItems.some(
                              (i) => i.itemHash === PINNACLE_ITEM_HASH
                            )
                          )
                          .map((mile) => (
                            <li
                              className="flex items-center space-x-2 font-semibold"
                              key={mile.hash}
                            >
                              <input
                                type="checkbox"
                                name="hide_completed"
                                className="flex-shrink-0 w-5 h-5 rounded"
                                disabled={true}
                              />
                              <span
                                className="w-full truncate"
                                title={mile.friendlyName}
                              >
                                {CUSTOM_MILESTONE_NAMES[mile.friendlyName] ??
                                  mile.displayProperties.name}
                              </span>
                              <span className="tabular-nums">+2</span>
                            </li>
                          ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      <h4 className="pb-2 text-lg font-semibold">Powerful</h4>
                      <ul className="space-y-4">
                        {milestones[activeCharId]
                          ?.filter((mile) =>
                            mile.rewardItems.some((i) =>
                              ALL_POWERFUL_ITEM_HASH.includes(i.itemHash)
                            )
                          )
                          .map((mile) => (
                            <li
                              className="flex items-center space-x-2 font-semibold"
                              key={mile.hash}
                            >
                              <input
                                type="checkbox"
                                name="hide_completed"
                                className="flex-shrink-0 w-5 h-5 rounded"
                                disabled={true}
                              />
                              <span
                                className="w-full truncate"
                                title={mile.friendlyName}
                              >
                                {mile.displayProperties.name}
                              </span>
                              <span className="tabular-nums">+0</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </AnimateSharedLayout>
        </div>
      </div>
    </div>
  );
}

export default App;
