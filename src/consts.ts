export const STORAGE_ACCESS_TOKEN_KEY = "bungie_access_token";
export const STORAGE_REFRESH_TOKEN_KEY = "bungie_refresh_token";
export const STORAGE_ACCESS_TOKEN_EXPIRATION_KEY =
  "bungie_access_token_expiration_time";
export const STORAGE_MEMBERSHIP_ID_KEY = "bungie_membership_id";
export const STORAGE_DESTINY_MEMBERSHIPS_KEY = "bungie_destiny_memberships";

export const STORAGE_DESTINY_CHARACTERS_KEY = "bungie_destiny_characters";
export const STORAGE_CHARACTERS_LAST_UPDATED_KEY =
  "bungie_characters_last_updated";

export const STORAGE_MANIFEST_DATA_KEY = "manifest_data";
export const STORAGE_MANIFEST_VERSION_KEY = "manifest_version";
export const STORAGE_MANIFEST_COMPONENTS_MD5_KEY = "manifest_components_md5";

export const STORAGE_ACTIVE_CHAR_ID = "active_character_id";

export const ITEM_SLOT_KINETIC = "kinetic";
export const ITEM_SLOT_ENERGY = "energy";
export const ITEM_SLOT_POWER = "power";
export const ITEM_SLOT_HEAD = "head";
export const ITEM_SLOT_GLOVES = "gloves";
export const ITEM_SLOT_CHEST = "chest";
export const ITEM_SLOT_LEGS = "legs";
export const ITEM_SLOT_CLASS_ITEM = "classItem";

export const ITEM_SLOT_BUCKETS = {
  [ITEM_SLOT_KINETIC]: 1498876634,
  [ITEM_SLOT_ENERGY]: 2465295065,
  [ITEM_SLOT_POWER]: 953998645,
  [ITEM_SLOT_HEAD]: 3448274439,
  [ITEM_SLOT_GLOVES]: 3551918588,
  [ITEM_SLOT_CHEST]: 14239492,
  [ITEM_SLOT_LEGS]: 20886954,
  [ITEM_SLOT_CLASS_ITEM]: 1585787867,
};

export const WEAPON_SLOT_BUCKETS = [
  ITEM_SLOT_BUCKETS["kinetic"],
  ITEM_SLOT_BUCKETS["energy"],
  ITEM_SLOT_BUCKETS["power"],
];

export const ITEM_BUCKET_SLOTS = Object.entries(ITEM_SLOT_BUCKETS).reduce(
  (buckets, [slot, bucket]) => ({ ...buckets, [bucket]: slot }),
  {} as { [bucket: number]: string }
);

export const ITEM_TIER_TYPE_EXOTIC = 6;

export const ITEM_TYPE_ARMOR = 2;
export const ITEM_TYPE_WEAPON = 3;

export const POSTMASTER_ITEMS_BUCKET = 215593132;
export const VAULT_ITEMS_BUCKET = 138197802;

export const PINNACLE_ITEM_HASH = 73143230;
export const PINNACLE_ITEM_WEAK_HASH = 4039143015;
export const POWERFUL_TIER_1_ITEM_HASH = 3114385605;
export const POWERFUL_TIER_2_ITEM_HASH = 3114385606;
export const POWERFUL_TIER_3_ITEM_HASH = 3114385607;
export const POWERFUL_LEGACY_GEAR_ITEM_HASH = 2246571627;

export const ALL_PINNACLE_ITEM_HASH = [
  PINNACLE_ITEM_HASH,
  PINNACLE_ITEM_WEAK_HASH,
];

export const ALL_POWERFUL_ITEM_HASH = [
  POWERFUL_TIER_1_ITEM_HASH,
  POWERFUL_TIER_2_ITEM_HASH,
  POWERFUL_TIER_3_ITEM_HASH,
  POWERFUL_LEGACY_GEAR_ITEM_HASH,
];

export const SEASONAL_SOFT_CAP = 1750;
export const SEASONAL_HARD_CAP = 1800;
export const SEASONAL_PINNACLE_CAP = 1810;

export const CLASS_TITAN = "titan";
export const CLASS_HUNTER = "hunter";
export const CLASS_WARLOCK = "warlock";

export const CLASS_NAMES = [CLASS_TITAN, CLASS_HUNTER, CLASS_WARLOCK];

export const RACE_HUMAN = "human";
export const RACE_AWOKEN = "awoken";
export const RACE_EXO = "exo";

export const RACE_NAMES = [RACE_HUMAN, RACE_AWOKEN, RACE_EXO];
export const BACKGROUND_IMAGE =
  "https://images.contentstack.io/v3/assets/blte410e3b15535c144/blt918a40751e8310c4/63d451e1e408254c88fbfc66/lfl-media-wallpaper-5-full.jpg";
