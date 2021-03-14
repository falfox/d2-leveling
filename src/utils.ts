import {
  DestinyCharacterComponent,
  DestinyItemComponent,
  DestinyItemInstanceComponent,
} from "bungie-api-ts/destiny2";
import { ITEM_BUCKET_SLOTS, ITEM_TYPE_ARMOR, ITEM_TYPE_WEAPON } from "./consts";
import { ManifestData } from "./services/bungie";
import { DisplayDestinyItemComponent } from "./App";

export interface ObjectOf<T> {
  [key: string]: T;
}

export const mapAndFilterItems = (
  items: DestinyItemComponent[],
  manifest: ManifestData,
  itemInstances: ObjectOf<DestinyItemInstanceComponent>,
  character: DestinyCharacterComponent
): any[] =>
  items
    .map((item) => {
      const instanceData = item.itemInstanceId
        ? itemInstances[item.itemInstanceId]
        : undefined;
      const itemDefinition =
        manifest.DestinyInventoryItemDefinition[item.itemHash];
      return {
        ...item,
        instanceData,
        itemDefinition,
        itemCategories: itemDefinition?.itemCategoryHashes?.map(
          (c) => manifest.DestinyItemCategoryDefinition[c]!
        ),
      };
    })
    .filter(
      (i) =>
        i.instanceData &&
        i.itemDefinition &&
        [ITEM_TYPE_ARMOR, ITEM_TYPE_WEAPON].includes(i.itemDefinition.itemType)
    )
    .map((i) => ({
      ...i,
      instanceData: i.instanceData!,
      itemDefinition: i.itemDefinition!,
    }))
    .map((i) => ({
      ...i,
      slotName: ITEM_BUCKET_SLOTS[i.itemDefinition.inventory!.bucketTypeHash],
    }))
    .filter(
      (i) => i.instanceData.primaryStat && i.instanceData.primaryStat.value
    )
    .map((i) => {
      const id = i.itemInstanceId!;

      return {
        name: i.itemDefinition.displayProperties.name,
        power: itemInstances[id].primaryStat.value,
      };
    });

export const isItemEquippableByCharacter = (
  item: DisplayDestinyItemComponent,
  character: DestinyCharacterComponent
) => {
  if (!item.instanceData) {
    return false;
  }
  if (item.instanceData.equipRequiredLevel > character.baseCharacterLevel) {
    return false;
  }
  if (item.itemDefinition.classType !== character.classType) {
    return false;
  }
  if (item.instanceData.cannotEquipReason === 16) {
    return true;
  } // Only reason is that it's in your vault
  if (item.instanceData.canEquip) {
    return true;
  } // If the game says we can equip it, let's believe it
  // Let's ignore the rest for now
  return true;
};
