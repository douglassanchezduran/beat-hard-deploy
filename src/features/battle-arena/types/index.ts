import { Fighter } from '@features/fighters/models/Fighter';

// export type BodyPart = 'left_hand' | 'right_hand' | 'left_foot' | 'right_foot';
export type BattleMode = 'time' | 'rounds';
export type TeamColor = 'red' | 'blue';

// Definición de la interfaz para un dispositivo conectable
/* export interface Device {
  id: string; // MAC Address
  name: string;
  bodyPart: BodyPart;
  battery: number;
  rssi: number;
  status: 'connected' | 'disconnected' | 'connecting';
} */

export interface BleDevice {
  id: string;
  name: string;
  address: string;
  limb_type?: string;
  limb_name?: string;
  rssi?: number;
  battery_level?: number; // Nivel de batería (0-100)
  is_connectable: boolean;
}

// Definición de la interfaz para un golpe
/* export interface Hit {
  deviceBodyPart: BodyPart;
  force: number;
  acceleration: number;
  velocity: number;
  timestamp: number;
} */

// Definición de la interfaz para un competidor
export interface Competitor extends Fighter {
  team: TeamColor;
  devices: BleDevice[];
}

// Definición de la interfaz para la configuración de la batalla
export interface BattleConfig {
  mode: BattleMode;
  rounds: number;
  roundDuration?: number;
}
/* export interface BattleConfig {
  rounds: number;
  roundDuration: number; // in seconds
  restDuration: number; // in seconds
} */
