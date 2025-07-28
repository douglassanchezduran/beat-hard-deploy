import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Divider } from '@heroui/react';
import { useBLEStore } from '@stores/useBLEStore';
import DeviceList from './DeviceList';
import CombatEventsDisplay from './CombatEventsDisplay';
import useBattleStore from '../../stores/useBattleStore';
import { devErrorLog, devSuccessLog } from '@utils/devLog';
import { BleDevice } from '@features/battle-arena/types';

const DeviceSelectionManager: React.FC = () => {
  // Obtener competidores del store de batalla
  const competitor1 = useBattleStore(state => state.competitor1);
  const competitor2 = useBattleStore(state => state.competitor2);

  // Store BLE - SOLO para operaciones de hardware
  const connectToDeviceWithCompetitor = useBLEStore(
    state => state.connectToDeviceWithCompetitor,
  );
  const disconnectFromDevice = useBLEStore(state => state.disconnectFromDevice);
  const disconnectAllDevices = useBLEStore(state => state.disconnectAllDevices);
  const connectedDevices = useBLEStore(state => state.connectedDevices);
  const availableDevices = useBLEStore(state => state.availableDevices);

  // Store Battle - Para gestión de asignación de dispositivos
  const competitor1Devices = useBattleStore(state => state.competitor1Devices);
  const competitor2Devices = useBattleStore(state => state.competitor2Devices);
  const toggleDeviceForCompetitor1 = useBattleStore(
    state => state.toggleDeviceForCompetitor1,
  );
  const toggleDeviceForCompetitor2 = useBattleStore(
    state => state.toggleDeviceForCompetitor2,
  );
  const setCompetitor1Devices = useBattleStore(
    state => state.setCompetitor1Devices,
  );
  const setCompetitor2Devices = useBattleStore(
    state => state.setCompetitor2Devices,
  );
  const clearAllDevices = useBattleStore(state => state.clearAllDevices);
  const nextStep = useBattleStore(state => state.nextStep);

  // Estado de conexión (mantiene useState porque es temporal)
  const [isConnectingCompetitor1, setIsConnectingCompetitor1] = useState(false);
  const [isConnectingCompetitor2, setIsConnectingCompetitor2] = useState(false);

  useEffect(() => {
    devSuccessLog('🔄 Sincronizando dispositivos asignados con estado BLE...');
    devSuccessLog('📱 Dispositivos disponibles:', availableDevices.length);
    devSuccessLog('🔗 Dispositivos conectados:', connectedDevices.length);
    devSuccessLog('🔴 Dispositivos competitor1:', competitor1Devices.length);
    devSuccessLog('🔵 Dispositivos competitor2:', competitor2Devices.length);

    // Filtrar dispositivos de competitor1 que ya no están disponibles/conectados
    const validCompetitor1Devices = competitor1Devices.filter(device => {
      const isAvailable = availableDevices.some(d => d.id === device.id);
      const isConnected = connectedDevices.some(d => d === device.id);
      return isAvailable || isConnected;
    });

    // Filtrar dispositivos de competitor2 que ya no están disponibles/conectados
    const validCompetitor2Devices = competitor2Devices.filter(device => {
      const isAvailable = availableDevices.some(d => d.id === device.id);
      const isConnected = connectedDevices.some(d => d === device.id);
      return isAvailable || isConnected;
    });

    // Actualizar estado si hay cambios
    if (validCompetitor1Devices.length !== competitor1Devices.length) {
      devSuccessLog(
        `🔴 Actualizando dispositivos competitor1: ${competitor1Devices.length} → ${validCompetitor1Devices.length}`,
      );
      setCompetitor1Devices(validCompetitor1Devices);
    }

    if (validCompetitor2Devices.length !== competitor2Devices.length) {
      devSuccessLog(
        `🔵 Actualizando dispositivos competitor2: ${competitor2Devices.length} → ${validCompetitor2Devices.length}`,
      );
      setCompetitor2Devices(validCompetitor2Devices);
    }
  }, [
    availableDevices,
    connectedDevices,
    competitor1Devices,
    competitor2Devices,
    setCompetitor1Devices,
    setCompetitor2Devices,
  ]);

  // Manejar selección/deselección de dispositivos para competitor1
  const handleCompetitor1DeviceToggle = (device: BleDevice) => {
    devSuccessLog(`🔴 [COMPETITOR1] Toggle device:`, device.name, device.id);
    toggleDeviceForCompetitor1(device);
  };

  // Manejar selección/deselección de dispositivos para competitor2
  const handleCompetitor2DeviceToggle = (device: BleDevice) => {
    devSuccessLog(`🔵 [COMPETITOR2] Toggle device:`, device.name, device.id);
    toggleDeviceForCompetitor2(device);
  };

  // Conectar dispositivos seleccionados de competitor1
  const handleConnectCompetitor1Devices = async () => {
    setIsConnectingCompetitor1(true);
    try {
      for (const device of competitor1Devices) {
        const weight = Number(competitor1?.weight || 70);
        devSuccessLog(
          '🔍 DEBUG - competitor1 weight type:',
          typeof competitor1?.weight,
          'value:',
          competitor1?.weight,
          'converted:',
          weight,
        );

        await connectToDeviceWithCompetitor(
          device.id,
          1, // competitor_id
          competitor1?.name || 'Competidor 1',
          weight,
        );
        devSuccessLog(
          `🔴 Conectado dispositivo para ${competitor1?.name}: ${device.name}`,
        );
      }
      devSuccessLog(
        `✅ Todos los dispositivos de ${competitor1?.name} conectados (${competitor1Devices.length})`,
      );
    } catch (error) {
      devErrorLog(
        `❌ Error conectando dispositivos de ${competitor1?.name}:`,
        error,
      );
    } finally {
      setIsConnectingCompetitor1(false);
    }
  };

  // Conectar dispositivos seleccionados de competitor2
  const handleConnectCompetitor2Devices = async () => {
    setIsConnectingCompetitor2(true);
    try {
      for (const device of competitor2Devices) {
        const weight = Number(competitor2?.weight || 70);
        devSuccessLog(
          '🔍 DEBUG - competitor2 weight type:',
          typeof competitor2?.weight,
          'value:',
          competitor2?.weight,
          'converted:',
          weight,
        );

        await connectToDeviceWithCompetitor(
          device.id,
          2, // competitor_id
          competitor2?.name || 'Competidor 2',
          weight,
        );
        devSuccessLog(
          `🔵 Conectado dispositivo para ${competitor2?.name}: ${device.name}`,
        );
      }
      devSuccessLog(
        `✅ Todos los dispositivos de ${competitor2?.name} conectados (${competitor2Devices.length})`,
      );
    } catch (error) {
      devErrorLog(
        `❌ Error conectando dispositivos de ${competitor2?.name}:`,
        error,
      );
    } finally {
      setIsConnectingCompetitor2(false);
    }
  };

  // Desconectar dispositivo individual del competidor 1
  const handleDisconnectCompetitor1Device = async (device: BleDevice) => {
    try {
      await disconnectFromDevice(device.id);

      // El estado se sincroniza automáticamente via useEffect
      devSuccessLog(
        `🔴 Desconectado dispositivo de ${competitor1?.name}: ${device.name}`,
      );
    } catch (error) {
      devErrorLog(
        `❌ Error desconectando dispositivo de ${competitor1?.name}:`,
        error,
      );
    }
  };

  // Desconectar dispositivo individual del competidor 2
  const handleDisconnectCompetitor2Device = async (device: BleDevice) => {
    try {
      await disconnectFromDevice(device.id);

      // El estado se sincroniza automáticamente via useEffect
      devSuccessLog(
        `🔵 Desconectado dispositivo de ${competitor2?.name}: ${device.name}`,
      );
    } catch (error) {
      devErrorLog(
        `❌ Error desconectando dispositivo de ${competitor2?.name}:`,
        error,
      );
    }
  };

  // Desconectar todos los dispositivos
  const handleDisconnectAll = async () => {
    try {
      await disconnectAllDevices();

      // Limpiar asignaciones de dispositivos
      clearAllDevices();
      devSuccessLog('🔌 Todos los dispositivos desconectados');
    } catch (error) {
      devErrorLog('❌ Error desconectando todos los dispositivos:', error);
    }
  };

  // Si no hay competidores seleccionados, mostrar mensaje
  if (!competitor1 && !competitor2) {
    return (
      <Card className="border-zinc-700 bg-zinc-900/50">
        <CardBody className="p-8 text-center">
          <h3 className="mb-2 text-xl font-bold text-zinc-100">
            Selecciona los Competidores
          </h3>
          <p className="text-zinc-400">
            Primero debes seleccionar los competidores para poder gestionar sus
            dispositivos BLE.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles globales */}
      <Card className="border-zinc-700 bg-zinc-900/50">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-100">
                Gestión de Dispositivos BLE
              </h2>
              <p className="text-sm text-zinc-400">
                Cada competidor debe seleccionar sus dispositivos y conectarse
              </p>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span className="text-xs text-zinc-400">
                    {competitor1?.name || 'Competidor 1'}:{' '}
                    {competitor1Devices.length} dispositivos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-zinc-400">
                    {competitor2?.name || 'Competidor 2'}:{' '}
                    {competitor2Devices.length} dispositivos
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {connectedDevices.length > 0 && (
                <Button
                  color="warning"
                  variant="bordered"
                  size="sm"
                  onPress={handleDisconnectAll}
                >
                  Desconectar Todo
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Grid de selección de dispositivos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Competitor 1 (Equipo Rojo) */}
        {competitor1 && (
          <Card className="border-zinc-700 bg-zinc-900/50">
            <CardBody className="p-6">
              <DeviceList
                competitor={competitor1}
                team="red"
                selectedDevices={competitor1Devices}
                excludedDevices={competitor2Devices}
                onDeviceToggle={handleCompetitor1DeviceToggle}
                onConnectSelected={handleConnectCompetitor1Devices}
                onDisconnectDevice={handleDisconnectCompetitor1Device}
                isConnecting={isConnectingCompetitor1}
              />

              {competitor1Devices.length > 0 && (
                <div className="mt-4 rounded-lg border border-red-700/30 bg-red-900/20 p-3">
                  <p className="text-sm text-red-300">
                    <strong>{competitor1?.name}</strong> ha seleccionado{' '}
                    {competitor1Devices.length} dispositivo(s):
                  </p>
                  <ul className="mt-1 text-xs text-red-400">
                    {competitor1Devices.map(device => (
                      <li key={device.id}>
                        • {device.name} ({device.limb_type || 'Desconocido'})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Competitor 2 (Equipo Azul) */}
        {competitor2 && (
          <Card className="border-zinc-700 bg-zinc-900/50">
            <CardBody className="p-6">
              <DeviceList
                competitor={competitor2}
                team="blue"
                selectedDevices={competitor2Devices}
                excludedDevices={competitor1Devices}
                onDeviceToggle={handleCompetitor2DeviceToggle}
                onConnectSelected={handleConnectCompetitor2Devices}
                onDisconnectDevice={handleDisconnectCompetitor2Device}
                isConnecting={isConnectingCompetitor2}
              />

              {competitor2Devices.length > 0 && (
                <div className="mt-4 rounded-lg border border-blue-700/30 bg-blue-900/20 p-3">
                  <p className="text-sm text-blue-300">
                    <strong>{competitor2?.name}</strong> ha seleccionado{' '}
                    {competitor2Devices.length} dispositivo(s):
                  </p>
                  <ul className="mt-1 text-xs text-blue-400">
                    {competitor2Devices.map(device => (
                      <li key={device.id}>
                        • {device.name} ({device.limb_type || 'Desconocido'})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Mensaje cuando solo hay un competidor */}
        {competitor1 && !competitor2 && (
          <Card className="border-dashed border-zinc-700 bg-zinc-900/50">
            <CardBody className="p-6 text-center">
              <h4 className="mb-2 text-lg font-semibold text-zinc-300">
                Competidor 2 (Equipo Azul)
              </h4>
              <p className="text-zinc-500">
                Selecciona el segundo competidor para habilitar la gestión de
                sus dispositivos
              </p>
            </CardBody>
          </Card>
        )}

        {!competitor1 && competitor2 && (
          <Card className="border-dashed border-zinc-700 bg-zinc-900/50">
            <CardBody className="p-6 text-center">
              <h4 className="mb-2 text-lg font-semibold text-zinc-300">
                Competidor 1 (Equipo Rojo)
              </h4>
              <p className="text-zinc-500">
                Selecciona el primer competidor para habilitar la gestión de sus
                dispositivos
              </p>
            </CardBody>
          </Card>
        )}
      </div>

      <Divider className="bg-zinc-700" />

      {/* Botón Continuar */}
      {/* <div className="mt-6 flex justify-end">
        <Button
          color="primary"
          size="lg"
          className="w-full"
          isDisabled={
            !competitor1 ||
            !competitor2 ||
            competitor1Devices.length === 0 ||
            competitor2Devices.length === 0
          }
          onPress={nextStep}
        >
          Continuar
        </Button>
      </div> */}

      {/* Eventos de combate en tiempo real */}
      {/* <Card className="border-zinc-700 bg-zinc-900/50">
        <CardBody className="p-6">
          <CombatEventsDisplay maxEventsPerCompetitor={10} />
        </CardBody>
      </Card> */}
    </div>
  );
};

export default DeviceSelectionManager;
