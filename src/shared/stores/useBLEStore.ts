import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { devErrorLog, devSuccessLog } from '@utils/devLog';
import { BleDevice } from '@features/battle-arena/types';

// Tipos para eventos de combate
export interface CombatEvent {
  event_type: string; // "slap", "kickdown"
  limb_name: string; // "Mano Izquierda", "Pie Derecho", etc.
  fighter_id: string; // ID del peleador
  competitor_name: string; // Nombre del competidor
  velocity: number; // Velocidad en m/s
  acceleration: number; // Aceleración en m/s²
  force: number; // Fuerza en Newtons
  timestamp: number; // Timestamp del evento
  confidence: number; // Confianza del evento (0.0-1.0)
}

interface DeviceConnection {
  deviceId: string;
  competitorId: number;
  competitorName: string;
  competitorWeight: number;
}

// Estado enfocado SOLO en hardware BLE
interface State {
  availableDevices: BleDevice[];
  connectedDevices: string[];
  combatEvents: CombatEvent[];
  isScanning: boolean;
  isSystemStarted: boolean;
}

// Acciones enfocadas SOLO en operaciones BLE
interface Actions {
  // Gestión de sistema BLE
  startBLESystem: () => Promise<void>;
  scanDevices: () => Promise<BleDevice[]>;

  // Conexiones físicas
  connectToDevice: (
    deviceId: string,
    competitorName: string,
  ) => Promise<string>;
  connectToDeviceWithCompetitor: (
    deviceId: string,
    competitorId: number,
    competitorName: string,
    competitorWeight: number,
  ) => Promise<void>;
  connectMultipleDevices: (
    connections: DeviceConnection[],
  ) => Promise<string[]>;
  disconnectFromDevice: (deviceId: string) => Promise<void>;
  disconnectAllDevices: () => Promise<void>;

  // Estado de hardware
  getConnectedDevices: () => Promise<string[]>;
  refreshConnectedDevices: () => Promise<string[]>;
  getBLEInfo: () => Promise<string>;

  // Acciones internas
  setAvailableDevices: (devices: BleDevice[]) => void;
  setConnectedDevices: (devices: string[]) => void;
  addCombatEvent: (event: CombatEvent) => void;
  removeLastEventFromEachCompetitor: () => void;
  setIsScanning: (scanning: boolean) => void;
  setIsSystemStarted: (started: boolean) => void;

  // Selectores de hardware
  isDeviceConnected: (deviceId: string) => boolean;
  getDeviceByType: (limbType: string) => BleDevice | undefined;
  getConnectedDevicesCount: () => number;
  getLatestCombatEvent: () => CombatEvent | null;
  getCompetitor1Events: () => CombatEvent[];
  getCompetitor2Events: () => CombatEvent[];
  getEventsByCompetitor: (competitorId: 1 | 2) => CombatEvent[];

  // Reset completo del sistema BLE
  resetBLESystem: () => Promise<void>;
}

// Variable global para el listener (evita múltiples listeners)
let globalEventListener: (() => void) | null = null;

// Función para configurar el listener automáticamente
const setupEventListenerIfNeeded = async () => {
  if (globalEventListener) return;

  try {
    devSuccessLog(
      '🎧 Configurando listener de eventos de combate automáticamente...',
    );

    const unlisten = await listen<CombatEvent>('simple-combat-event', event => {
      const combatEvent = event.payload;
      devSuccessLog('🥊 Evento de combate detectado:', combatEvent);
      // Usar el store directamente
      useBLEStore.getState().addCombatEvent(combatEvent);
    });

    globalEventListener = unlisten;

    // Cleanup en caso de hot reload (desarrollo)
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (globalEventListener) {
          devSuccessLog('🧹 Limpiando listener de eventos de combate...');
          globalEventListener();
          globalEventListener = null;
        }
      });
    }
  } catch (error) {
    devErrorLog('❌ Error configurando listener automático:', error);
  }
};

export const useBLEStore = create<State & Actions>((set, get) => ({
  // Estado inicial
  availableDevices: [],
  connectedDevices: [],
  combatEvents: [],
  isScanning: false,
  isSystemStarted: false,

  // Acciones principales
  startBLESystem: async () => {
    // Configurar listener automáticamente
    await setupEventListenerIfNeeded();

    try {
      await invoke('start_ble_system');
      set({ isSystemStarted: true });
      devSuccessLog('✅ Sistema BLE iniciado');
    } catch (error) {
      devErrorLog('❌ Error iniciando sistema BLE:', error);
      throw error;
    }
  },

  scanDevices: async () => {
    // Configurar listener automáticamente
    await setupEventListenerIfNeeded();

    set({ isScanning: true });
    try {
      const devices = await invoke<BleDevice[]>('scan_ble_devices');
      set({ availableDevices: devices });
      devSuccessLog(
        `📡 Encontrados ${devices.length} dispositivos BLE:`,
        devices,
      );
      return devices;
    } catch (error) {
      devErrorLog('❌ Error escaneando dispositivos:', error);
      throw error;
    } finally {
      set({ isScanning: false });
    }
  },

  connectToDevice: async (deviceId: string, competitorName: string) => {
    // Configurar listener automáticamente
    await setupEventListenerIfNeeded();

    try {
      const result = await invoke<string>('connect_to_device', {
        deviceId,
        competitorName,
      });
      devSuccessLog(`🔗 ${result}`);
      await get().getConnectedDevices();
      return result;
    } catch (error) {
      devErrorLog('❌ Error conectando dispositivo:', error);
      throw error;
    }
  },

  getConnectedDevices: async () => {
    try {
      const devices = await invoke<string[]>('get_connected_devices');
      set({ connectedDevices: devices });
      devSuccessLog(`📱 Dispositivos conectados: ${devices.length}`);
      return devices;
    } catch (error) {
      devErrorLog('❌ Error obteniendo dispositivos conectados:', error);
      throw error;
    }
  },

  connectToDeviceWithCompetitor: async (
    deviceId,
    competitorId,
    competitorName,
    competitorWeight,
  ) => {
    try {
      await invoke('connect_to_device_with_competitor', {
        deviceId,
        competitorId,
        competitorName,
        competitorWeight,
      });
      const connected = await invoke<string[]>('get_connected_devices');
      set({ connectedDevices: connected });
      devSuccessLog(
        `🔗 Dispositivo ${deviceId} conectado para ${competitorName} (${competitorWeight}kg)`,
      );
    } catch (error) {
      devErrorLog(
        `❌ Error conectando dispositivo ${deviceId} para ${competitorName}:`,
        error,
      );
      throw error;
    }
  },

  connectMultipleDevices: async deviceConnections => {
    try {
      devSuccessLog(
        `🔗 Conectando ${deviceConnections.length} dispositivos simultáneamente...`,
      );

      const results = await invoke<string[]>('connect_multiple_devices', {
        deviceConnections,
      });

      const connected = await invoke<string[]>('get_connected_devices');
      set({ connectedDevices: connected });

      devSuccessLog('🏁 Resultados de conexión múltiple:', results);
      return results;
    } catch (error) {
      devErrorLog('❌ Error conectando múltiples dispositivos:', error);
      throw error;
    }
  },

  disconnectFromDevice: async deviceId => {
    try {
      await invoke('disconnect_from_device', { deviceId });
      const connected = await invoke<string[]>('get_connected_devices');
      set({ connectedDevices: connected });
      devSuccessLog(`🔌 Desconectado del dispositivo: ${deviceId}`);
    } catch (error) {
      devErrorLog(`❌ Error desconectando del dispositivo ${deviceId}:`, error);
      throw error;
    }
  },

  disconnectAllDevices: async () => {
    try {
      console.log('🔌 [BLE] Iniciando desconexión de todos los dispositivos...');
      const connectedDevices = get().connectedDevices;
      console.log('🔌 [BLE] Dispositivos conectados antes de desconectar:', connectedDevices);
      
      await invoke('disconnect_all_devices');
      
      console.log('🔌 [BLE] Comando disconnect_all_devices ejecutado, limpiando estado...');
      set({ connectedDevices: [] });
      
      console.log('✅ [BLE] Todos los dispositivos desconectados y estado limpiado');
      devSuccessLog('🔌 Todos los dispositivos desconectados');
    } catch (error) {
      console.error('❌ [BLE] Error durante desconexión:', error);
      devErrorLog('❌ Error desconectando todos los dispositivos:', error);
      throw error;
    }
  },

  getBLEInfo: async () => {
    try {
      const info = await invoke<string>('get_ble_info');
      devSuccessLog('ℹ️ Info del sistema BLE:', info);
      return info;
    } catch (error) {
      devErrorLog('❌ Error obteniendo info BLE:', error);
      throw error;
    }
  },

  refreshConnectedDevices: async () => {
    try {
      const connected = await invoke<string[]>('get_connected_devices');
      set({ connectedDevices: connected });
      return connected;
    } catch (error) {
      devErrorLog('❌ Error obteniendo dispositivos conectados:', error);
      throw error;
    }
  },

  // Acciones internas
  setAvailableDevices: devices => set({ availableDevices: devices }),
  setConnectedDevices: devices => set({ connectedDevices: devices }),

  addCombatEvent: event =>
    set(state => ({
      combatEvents: [event, ...state.combatEvents].slice(0, 50),
    })),

  removeLastEventFromEachCompetitor: () =>
    set(state => {
      const competitor1Events = state.combatEvents.filter(e => e.fighter_id === 'fighter_1');
      const competitor2Events = state.combatEvents.filter(e => e.fighter_id === 'fighter_2');
      
      // Get the latest event from each competitor
      const latestCompetitor1Event = competitor1Events[0];
      const latestCompetitor2Event = competitor2Events[0];
      
      // Remove the latest events from the combat events array
      const filteredEvents = state.combatEvents.filter(event => {
        if (latestCompetitor1Event && event.timestamp === latestCompetitor1Event.timestamp && event.fighter_id === 'fighter_1') {
          return false;
        }
        if (latestCompetitor2Event && event.timestamp === latestCompetitor2Event.timestamp && event.fighter_id === 'fighter_2') {
          return false;
        }
        return true;
      });
      
      return { combatEvents: filteredEvents };
    }),

  setIsScanning: scanning => set({ isScanning: scanning }),
  setIsSystemStarted: started => set({ isSystemStarted: started }),

  // Selectores de hardware
  isDeviceConnected: deviceId => get().connectedDevices.includes(deviceId),

  getDeviceByType: limbType =>
    get().availableDevices.find(d => d.limb_type === limbType),

  getConnectedDevicesCount: () => get().connectedDevices.length,
  getLatestCombatEvent: () => get().combatEvents[0] || null,

  getCompetitor1Events: () =>
    get().combatEvents.filter(e => e.fighter_id === 'fighter_1'),

  getCompetitor2Events: () =>
    get().combatEvents.filter(e => e.fighter_id === 'fighter_2'),

  getEventsByCompetitor: competitorId =>
    get().combatEvents.filter(e => e.fighter_id === `fighter_${competitorId}`),

  // Reset completo del sistema BLE
  resetBLESystem: async () => {
    console.log('🔄 Iniciando reset completo del sistema BLE...');
    
    try {
      // 1. Detener el listener de eventos para evitar procesamiento de datos residuales
      console.log('🔇 Deteniendo listener de eventos de combate...');
      if (globalEventListener) {
        globalEventListener();
        globalEventListener = null;
        console.log('✅ Listener de eventos detenido');
      }
      
      // 2. Desconectar todos los dispositivos físicamente
      console.log('🔌 Desconectando todos los dispositivos BLE...');
      await get().disconnectAllDevices();
      
      // 3. Esperar un momento para asegurar desconexión completa
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 4. Limpiar todo el estado
      console.log('🧹 Limpiando estado del sistema BLE...');
      set({
        availableDevices: [],
        connectedDevices: [],
        combatEvents: [],
        isScanning: false,
        isSystemStarted: false
      });
      
      console.log('✅ Reset del sistema BLE completado exitosamente');
    } catch (error) {
      console.error('❌ Error durante el reset del sistema BLE:', error);
      throw error;
    }
  },
}));
