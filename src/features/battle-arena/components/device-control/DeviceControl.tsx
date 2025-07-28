import { Card, CardBody } from '@heroui/react';

import { Fighter } from '@features/fighters/models/Fighter';
// import useBattleStore from '../../stores/useBattleStore';

/* import { Device } from '../../types';
import { useDeviceControl } from '../../hooks/useDeviceControl'; */

/* import { BattleConfiguration } from '../battle-configuration';
import DeviceControlHeader from './DeviceControlHeader';
import DeviceControlNavigation from './DeviceControlNavigation';
import DeviceList from './DeviceList'; */
import FighterSelectionPanel from './FighterSelectionPanel';
// import DeviceControlNavigation from './DeviceControlNavigation';
/* import IncompleteConfigWarning from './IncompleteConfigWarning';
import VSDisplay from './VSDisplay'; */

interface Props {
  fighters: Fighter[];
}

const DeviceControl: React.FC<Props> = ({ fighters }) => {
  // const { nextStep, prevStep, currentStep } = useBattleStore();

  // El estado de los dispositivos seleccionados se mantiene aquí temporalmente.
  // Podría moverse al store en un futuro refactor.
  // const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);

  // Usar el custom hook para manejar toda la lógica
  /* const {
    isSearchingDevices1,
    isSearchingDevices2,
    selectedCompetitor1Key,
    selectedCompetitor1Data,
    selectedCompetitor2Key,
    selectedCompetitor2Data,
    availableDevicesCompetitor1,
    availableDevicesCompetitor2,
    canProceed,
    bothFightersSelected,
    handleDeviceToggle,
    handleSearchDevices1,
    handleSearchDevices2,
    handleCompetitor1Selection,
    handleCompetitor2Selection,
  } = useDeviceControl({
    fighters,
    initialSelectedDevices: selectedDevices,
    onDevicesChange: setSelectedDevices,
  }); */

  return (
    <div className="">
      <div className="">
        {/* <DeviceControlHeader /> */}
        {/* <BattleConfiguration /> */}

        <Card className="mb-8 border border-zinc-700/50 bg-zinc-800/50 backdrop-blur-sm">
          <CardBody className="p-6">
            <h2 className="mb-6 text-2xl font-bold text-white">
              Configurar combate
            </h2>

            {/* Sección de selección de luchadores */}
            <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <FighterSelectionPanel
                team="red"
                fighters={fighters}
                /* selectedFighter={selectedCompetitor1Data}
                selectedKey={selectedCompetitor1Key}
                onSelectionChange={handleCompetitor1Selection} */
              />
              <FighterSelectionPanel
                team="blue"
                fighters={fighters}
                /* selectedFighter={selectedCompetitor2Data}
                selectedKey={selectedCompetitor2Key}
                onSelectionChange={handleCompetitor2Selection} */
              />
            </div>

            {/* <VSDisplay show={bothFightersSelected} /> */}

            {/* Sección de configuración de dispositivos */}
            {/* {bothFightersSelected && (
              <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                <DeviceList
                  team="red"
                  competitor={selectedCompetitor1Data}
                  availableDevices={availableDevicesCompetitor1}
                  selectedDevices={selectedDevices}
                  isSearching={isSearchingDevices1}
                  onSearch={handleSearchDevices1}
                  onDeviceToggle={handleDeviceToggle}
                />
                <DeviceList
                  team="blue"
                  competitor={selectedCompetitor2Data}
                  availableDevices={availableDevicesCompetitor2}
                  selectedDevices={selectedDevices}
                  isSearching={isSearchingDevices2}
                  onSearch={handleSearchDevices2}
                  onDeviceToggle={handleDeviceToggle}
                />
              </div>
            )} */}

            {/* <IncompleteConfigWarning show={!canProceed} /> */}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default DeviceControl;
