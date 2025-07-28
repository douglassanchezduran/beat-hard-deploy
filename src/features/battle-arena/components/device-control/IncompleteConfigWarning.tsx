import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { AlertCircle } from 'lucide-react';

interface Props {
  show: boolean;
}

const IncompleteConfigWarning: React.FC<Props> = ({ show }) => {
  if (!show) return null;

  return (
    <Card className="mb-6 border border-warning-500/30 bg-warning-500/10">
      <CardBody className="p-4">
        <div className="flex items-center space-x-3">
          <AlertCircle size={20} className="text-warning-500" />
          <div>
            <p className="font-medium text-warning-400">
              Configuración incompleta
            </p>
            <p className="text-sm text-zinc-400">
              Selecciona ambos competidores y al menos un dispositivo para continuar
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default IncompleteConfigWarning;
