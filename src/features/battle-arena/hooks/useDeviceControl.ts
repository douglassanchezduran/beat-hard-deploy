import { useState, useEffect } from 'react';

import { Fighter } from '@features/fighters/models/Fighter';
import { Device, Competitor } from '../types';
import useBattleStore from '../stores/useBattleStore';

// Mock data para simular la búsqueda de dispositivos. Esto debería venir de una API en el futuro.
const mockDevices: Device[] = [
  {
    id: 'C8:F0:9E:8F:3C:A4',
    name: 'Guante Izquierdo',
    bodyPart: 'left_hand',
    battery: 85,
    rssi: -55,
    status: 'connected',
  },
  {
    id: 'E8:F0:9E:8F:3C:A5',
    name: 'Guante Derecho',
    bodyPart: 'right_hand',
    battery: 92,
    rssi: -60,
    status: 'connected',
  },
  {
    id: 'A1:B2:C3:D4:E5:F6',
    name: 'Bota Izquierda',
    bodyPart: 'left_foot',
    battery: 78,
    rssi: -70,
    status: 'disconnected',
  },
];

interface UseDeviceControlProps {
  fighters: Fighter[];
  // Las props relacionadas con los dispositivos seleccionados se podrían mover al store también,
  // pero por ahora las mantenemos para acotar el refactor.
  initialSelectedDevices: Device[];
  onDevicesChange: (devices: Device[]) => void;
}

export const useDeviceControl = ({
  fighters,
  initialSelectedDevices,
  onDevicesChange,
}: UseDeviceControlProps) => {
  // 1. Conexión con el store de Zustand para el estado global de los competidores
  const { competitor1, competitor2, setCompetitor1, setCompetitor2 } =
    useBattleStore();

  // 2. Estado local que solo le importa a este hook y sus componentes
  const [isSearchingDevices1, setIsSearchingDevices1] = useState(false);
  const [isSearchingDevices2, setIsSearchingDevices2] = useState(false);
  const [selectedCompetitor1Key, setSelectedCompetitor1Key] = useState(
    competitor1?.id || '',
  );
  const [selectedCompetitor2Key, setSelectedCompetitor2Key] = useState(
    competitor2?.id || '',
  );
  const [availableDevicesCompetitor1, setAvailableDevicesCompetitor1] =
    useState<Device[]>([]);
  const [availableDevicesCompetitor2, setAvailableDevicesCompetitor2] =
    useState<Device[]>([]);

  // Simulación de búsqueda de dispositivos (la lógica no cambia)
  useEffect(() => {
    if (competitor1) {
      setIsSearchingDevices1(true);
      setTimeout(() => {
        setAvailableDevicesCompetitor1(mockDevices);
        setIsSearchingDevices1(false);
      }, 1000);
    } else {
      setAvailableDevicesCompetitor1([]);
    }
  }, [competitor1]);

  useEffect(() => {
    if (competitor2) {
      setIsSearchingDevices2(true);
      setTimeout(() => {
        setAvailableDevicesCompetitor2(mockDevices);
        setIsSearchingDevices2(false);
      }, 1000);
    } else {
      setAvailableDevicesCompetitor2([]);
    }
  }, [competitor2]);

  // Manejador para la selección de dispositivos (la lógica no cambia)
  const handleDeviceToggle = (device: Device) => {
    const isSelected = initialSelectedDevices.some(d => d.id === device.id);
    const newSelectedDevices = isSelected
      ? initialSelectedDevices.filter(d => d.id !== device.id)
      : [...initialSelectedDevices, device];
    onDevicesChange(newSelectedDevices);
  };

  const handleSearchDevices1 = (isSearching: boolean) => {
    setIsSearchingDevices1(isSearching);
  };

  const handleSearchDevices2 = (isSearching: boolean) => {
    setIsSearchingDevices2(isSearching);
  };

  // 3. Manejadores que ahora actualizan el store global
  const handleCompetitor1Selection = (key: string | null) => {
    if (key) {
      setSelectedCompetitor1Key(key);
      const fighterData = fighters.find(f => f.id === key);
      const enhancedData: Competitor | null = fighterData
        ? { ...fighterData, team: 'red', devices: [] }
        : null;
      setCompetitor1(enhancedData); // <-- Actualiza el store
    } else {
      setSelectedCompetitor1Key('');
      setCompetitor1(null); // <-- Actualiza el store
    }
  };

  const handleCompetitor2Selection = (key: string | null) => {
    if (key) {
      setSelectedCompetitor2Key(key);
      const fighterData = fighters.find(f => f.id === key);
      const enhancedData: Competitor | null = fighterData
        ? { ...fighterData, team: 'blue', devices: [] }
        : null;
      setCompetitor2(enhancedData); // <-- Actualiza el store
    } else {
      setSelectedCompetitor2Key('');
      setCompetitor2(null); // <-- Actualiza el store
    }
  };

  // Sincroniza la key local si el estado del store cambia desde otro lugar
  useEffect(() => {
    setSelectedCompetitor1Key(competitor1?.id || '');
  }, [competitor1]);

  useEffect(() => {
    setSelectedCompetitor2Key(competitor2?.id || '');
  }, [competitor2]);

  // 4. Estado derivado que ahora se basa en el store
  const canProceed = !!(
    competitor1 &&
    competitor2 &&
    initialSelectedDevices.length > 0
  );
  const bothFightersSelected = !!(competitor1 && competitor2);

  return {
    isSearchingDevices1,
    isSearchingDevices2,
    selectedCompetitor1Key,
    selectedCompetitor1Data: competitor1, // <-- Devuelve el valor del store
    selectedCompetitor2Key,
    selectedCompetitor2Data: competitor2, // <-- Devuelve el valor del store
    availableDevicesCompetitor1,
    availableDevicesCompetitor2,
    canProceed,
    bothFightersSelected,
    handleDeviceToggle,
    handleSearchDevices1,
    handleSearchDevices2,
    handleCompetitor1Selection,
    handleCompetitor2Selection,
  };
};
