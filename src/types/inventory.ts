export interface InventoryItemPayload {
  instanceId?: string;
  MaxDurability?: number;
  Durability?: number;
  slot?: number;
  itemId?: string;
  quantity?: number;
  Quantity?: number;
  qty?: number;
  Amount?: number;
  amount?: number;
}

export interface InventoryDetailsPayload {
  [key: string]: string; // instanceId mapping for slots like equippedArmorHelmetInstanceId
}

export interface InventoryEventPayload {
  data?: {
    InventoryItems?: InventoryItemPayload[];
    InventoryDetails?: InventoryDetailsPayload;
    QuickBarInstances?: (string | null)[];
    QuickBar?: number[];
  };
}

export interface InventoryEquipPayload {
  inventorySlot?: number;
  equipSlot?: string;
  itemId?: string;
  instanceId?: string;
}

export interface GameLootItemPayload {
  name?: string;
  qty?: number;
}
