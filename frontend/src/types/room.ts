export type RoomPayload = {
  name?: string;
  location?: string;
  capacity?: number;
  capacity_exam?: number;
  characteristic_name?: string;
  building_identifier?: string;
};

export type Room = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  capacity_exam: number;
  isFree: boolean;
  characteristic_name: string;
  building_identifier: string;
  created_at: string;
  updated_at: string;
};

export type RoomListParams = {
  roomID?: string | null;
  page?: number;
  limit?: number;
};

export type RoomListResponse = {
  items: Room[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
};
