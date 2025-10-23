
export type UserRole = 'user' | 'admin';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
}

export interface TrainClass {
  price: number;
  totalSeats: number;
  availableSeats: number;
}

export interface TrainClasses {
  First: TrainClass;
  Business: TrainClass;
  Economy: TrainClass;
}

export type TrainClassName = keyof TrainClasses;

export interface Train {
  id: string;
  trainName: string;
  trainNumber: string;
  source: string;
  destination: string;
  departure: string;
  description?: string;
  classes: TrainClasses;
}

export interface Booking {
  id: string;
  userId: string;
  trainId: string;
  trainNumber: string;
  trainName: string;
  destination: string;
  date: string;
  class: TrainClassName;
  passengers: number;
  totalPrice: number;
  status: 'Confirmed' | 'Cancelled';
}
