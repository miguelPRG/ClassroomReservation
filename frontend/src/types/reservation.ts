export type ReservationPayload = {
  room_id: string;
  start_datetime: string;
  end_datetime: string;
};

export type Reservation = {
  id: string;
  room_id: string;
  start_datetime: string;
  end_datetime: string;
  created_by: string;
  created_at: string;
  creator_email?: string;
  estado?: string;
};
