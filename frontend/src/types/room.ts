export type CreateRoomPayload = {
  name: string;
  location: string;
  capacity: number;
  capacity_exam: number;
  active: boolean;
  characteristic_name: string;
  building_identifier: string;
}

export type Room = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  capacity_exam: number;
  active: boolean;
  characteristic_name: string;
  building_identifier: string;
  created_at: string;
  updated_at: string;
}

export type UpdateRoomPayload = {
  name?: string;
  location?: string;
  capacity?: number;
  capacity_exam?: number;
  active?: boolean;
  characteristic_name?: string;
  building_identifier?: string;
}
