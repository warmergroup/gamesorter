export interface Item {
  id: string;
  name: string;
  order: number;
  categories?: string;
  childCount?: number;
  children?: Item[];
}

export interface HistoryState {
  items: Item[];
}

export interface ReorderPayload {
  itemId: string;
  targetId: string;
  position: 'before' | 'after' | 'inside';
}