import {
  ChevronDoubleLeftSolid,
  ChevronDoubleRightSolid,
  LoginOutline,
  RefreshOutline,
  ViewBoardsOutline,
  ViewBoardsSolid,
} from "@graywolfai/react-heroicons";
import { useMediaQuery } from "@react-hook/media-query";
import {
  DestinyInventoryItemDefinition,
  DestinyItemComponent,
  DestinyItemInstanceComponent,
} from "bungie-api-ts/destiny2";
import clsx from "clsx";
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";
import { parse } from "query-string";
import React, { useEffect, useRef, useState } from "react";
import { ChecklistsPanel } from "./components/checklists_panel";
import { LoginWithBungie } from "./components/login_with_bungie";
import { MadeBy } from "./components/made_by";
import { MembershipBadge } from "./components/membership_badge";
import { SingleCharacterPanel } from "./components/single_character_panel";
import { BACKGROUND_IMAGE, CLASS_NAMES } from "./consts";
import { useKeyPress } from "./hooks/useKeyPress";
import { getAccessToken } from "./services/auth";
import { AuthStore } from "./stores/auth";
import { DestinyStores } from "./stores/destiny";

const rightPanelVariants = {
  hidden: { opacity: 0, width: 0, display: "hidden" },
  visible: { opacity: 1, width: "100%", display: "block" },
};

const leftPanelVariantsMobile = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

const rightPanelVariantsMobile = {
  hidden: { opacity: 0, x: "100%" },
  visible: { opacity: 1, x: "0%" },
};

export interface DisplayDestinyItemComponent extends DestinyItemComponent {
  instanceData: DestinyItemInstanceComponent;
  itemDefinition: DestinyInventoryItemDefinition;
}

function App() {
  const state = AuthStore.useStoreState((state) => state.state);
  const setState = AuthStore.useStoreActions((actions) => actions.setState);

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
        className="relative flex items-center justify-center w-full min-h-screen space-x-2 overflow-y-hidden text-gray-900 bg-cover"
        style={{
          backgroundImage: `url(${BACKGROUND_IMAGE})`,
        }}
      >
        <div className="absolute inset-0 z-0 bg-gray-900 bg-opacity-70"></div>
        <div className="relative z-10 overflow-hidden">
          <LoginWithBungie />
        </div>
        <MadeBy />
      </div>
    );

  return <NewApp />;
}

function NewApp() {
  const loadProfiles = DestinyStores.useStoreActions(
    (actions) => actions.loadProfiles
  );
  const login = AuthStore.useStoreActions((actions) => actions.loginWithBungie);
  const { hasData, errorText } = DestinyStores.useStoreState((state) => state);

  useEffect(() => {
    loadProfiles({
      force: false,
    });
  }, []);

  return (
    <div className="relative antialiased">
      {!hasData ? (
        <div
          className="relative flex items-center justify-center w-full min-h-screen space-x-2 text-gray-900 bg-cover"
          style={{
            backgroundImage: `url(${BACKGROUND_IMAGE})`,
          }}
        >
          <div className="absolute inset-0 z-0 bg-gray-900 bg-opacity-70"></div>
          {errorText ? (
            <div className="flex flex-col items-center">
              <h2 className="relative z-20 text-lg font-semibold text-center text-white w-96">
                {errorText}
              </h2>
              {errorText === "Failed to authenticate" ? (
                <button
                  type="button"
                  className="relative z-20 flex items-center px-4 py-3 mt-4 space-x-3 bg-white rounded-md shadow-md"
                  onClick={() => login()}
                >
                  <LoginOutline className="w-6 h-6" />
                  <span className="font-semibold">Login with Bungie.net</span>
                </button>
              ) : null}
            </div>
          ) : (
            <div className="relative z-10 overflow-hidden">
              <button
                type="button"
                className="flex items-center px-4 py-3 space-x-3 bg-white rounded-md shadow-md"
                disabled={true}
              >
                <RefreshOutline className="w-6 h-6 transform animate-spin -scale-x-1 -scale-y-1" />
                <span className="font-semibold">Loading Characters...</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <MainApp />
      )}
      <MadeBy />
    </div>
  );
}

function MainApp() {
  const [panelView, setPanelView] = useState<"single" | "multi">("single");
  const {
    characters,
    memberships,
    topCharactersItem,
    is_fetching,
    milestones,
  } = DestinyStores.useStoreState((state) => state);
  const activeCharId = DestinyStores.useStoreState(
    (state) => state.activeCharId
  );
  const loadProfiles = DestinyStores.useStoreActions(
    (actions) => actions.loadProfiles
  );
  const setActiveCharId = DestinyStores.useStoreActions(
    (actions) => actions.setActiveCharId
  );

  const isMobileMediaQuery = useMediaQuery("(max-width: 768px)");
  console.log({ isMobileMediaQuery });

  const [rightPanelAnimate, toggleRightPanel] = useState<
    keyof typeof rightPanelVariants
  >(() => (isMobileMediaQuery ? "hidden" : "visible"));

  const [hideCompleted, setHideCompleted] = useState(false);
  const loadingRef = useRef(is_fetching);

  useEffect(() => {
    loadingRef.current = is_fetching;
  }, [is_fetching]);

  useKeyPress("r", () => {
    if (!loadingRef.current) {
      loadProfiles({
        force: false,
      });
    }
  });

  if (!characters) throw new Error("Missing characters");
  if (!activeCharId) throw new Error("Missing active character");
  if (!topCharactersItem) throw new Error("Missing top items");
  if (!milestones) throw new Error("Missing milestones");

  const character = characters?.[activeCharId];

  const membership = memberships?.[0];

  if (!membership) throw new Error("Missing membership");

  return (
    <div
      className="relative flex items-center justify-center w-full min-h-screen space-x-2 text-gray-900 bg-cover"
      style={{
        backgroundImage: `url(${BACKGROUND_IMAGE})`,
      }}
    >
      <div className="absolute inset-0 z-0 bg-gray-900 bg-opacity-70"></div>
      <div className="relative flex flex-col w-full">
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-sm md:max-w-3xl">
            <MembershipBadge />
            <div className="absolute top-0 right-0 -mt-12">
              <div className="flex items-center justify-end w-full py-4 pr-4 space-x-4">
                <button
                  title="Multi Characters View"
                  onClick={() => {
                    setPanelView(panelView === "multi" ? "single" : "multi");
                  }}
                >
                  {panelView === "multi" ? (
                    <ViewBoardsSolid className="w-5 h-5 text-white" />
                  ) : (
                    <ViewBoardsOutline className="w-5 h-5 text-white" />
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
                    className={clsx(
                      "w-5 h-5 text-white transform -scale-x-1 -scale-y-1",
                      {
                        "animate-spin": is_fetching,
                      }
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          className="flex justify-center w-full"
          style={{
            height: "620px",
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
                      variants={
                        isMobileMediaQuery
                          ? leftPanelVariantsMobile
                          : rightPanelVariants
                      }
                      transition={{
                        ease: "easeIn",
                      }}
                      className="max-w-sm overflow-y-auto bg-white shadow first:rounded-l-xl last:rounded-r-xl"
                    >
                      <div className="p-6 bg-white">
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
                    className="absolute top-0 left-0 hidden px-1 -ml-40 space-y-3 md:block"
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
                            className={clsx(
                              "flex flex-col justify-center text-white bg-white bg-no-repeat bg-cover rounded-lg shadow-md w-36 px-14 h-14 transform transition-transform",
                              {
                                "scale-110": char.characterId === activeCharId,
                              }
                            )}
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
                      // TODO: Fix z-Index issue
                      className="absolute top-0 right-0 z-40 mt-4 -mr-5"
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
                            <ChevronDoubleRightSolid className="w-5 h-5 transform -scale-x-1 sm:scale-x-100" />
                          ) : (
                            <ChevronDoubleLeftSolid className="w-5 h-5 transform -scale-x-1 sm:scale-x-100" />
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
                  variants={
                    isMobileMediaQuery
                      ? rightPanelVariantsMobile
                      : rightPanelVariants
                  }
                  transition={{
                    ease: "easeInOut",
                  }}
                  exit="hidden"
                  className="absolute z-10 max-w-sm overflow-y-auto bg-white shadow md:rounded-r-xl md:rounded-none rounded-xl md:static"
                  style={{
                    height: "620px",
                  }}
                >
                  <ChecklistsPanel
                    hideCompleted={hideCompleted}
                    handleHideToggle={(checked) => setHideCompleted(checked)}
                  />
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
