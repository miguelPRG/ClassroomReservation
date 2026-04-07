export type Room = {
  id: number;
  name: string;
  capacity: number;
  is_active: boolean;
};

export type ReservationStatus = "pending" | "approved" | "cancelled";

export type Reservation = {
  id: number;
  room_id: number;
  user_id: number;
  start_time: string;
  end_time: string;
  status: ReservationStatus;
};

export type NewReservationInput = {
  room_id: number;
  user_id: number;
  start_time: string;
  end_time: string;
};
