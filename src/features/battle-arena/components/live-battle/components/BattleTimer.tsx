import React from 'react';
import { Card, CardBody, Button, Progress, Chip, Tooltip } from '@heroui/react';
import { Play, Pause, Square, Timer, SkipForward, RotateCcw } from 'lucide-react';

interface BattleTimerProps {
  timeLeft: number;
  currentRound: number;
  totalRounds: number;
  roundDuration?: number;
  battleMode: 'time' | 'rounds';
  isActive: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onNextRound?: () => void; // For manual round progression
  onResetRound?: () => void; // For resetting current round
  canAdvanceToNextRound?: boolean; // For validating if both competitors have events
}

const BattleTimer: React.FC<BattleTimerProps> = ({
  timeLeft,
  currentRound,
  totalRounds,
  roundDuration,
  battleMode,
  isActive,
  isPaused,
  onStart,
  onPause,
  onStop,
  onNextRound,
  onResetRound,
  canAdvanceToNextRound = true,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine battle mode based on configuration
  const isTimedBattle = battleMode === 'time';
  const canAdvanceRound = currentRound < totalRounds;
  
  // Always show the button if we can advance rounds, but disable it based on conditions
  const shouldShowNextRoundButton = canAdvanceRound;
  const shouldEnableNextRoundButton = isTimedBattle || canAdvanceToNextRound;
  
  // Debug logging
  console.log('🔍 [BattleTimer] Estado del botón Siguiente Ronda:', {
    canAdvanceToNextRound,
    isTimedBattle,
    battleMode,
    currentRound,
    totalRounds,
    shouldShowNextRoundButton,
    shouldEnableNextRoundButton
  });

  return (
    <Card className="mb-8 border border-zinc-600/50 bg-zinc-900/50">
      <CardBody className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-center">
            {isTimedBattle ? (
              <div className="mb-2 text-4xl font-bold text-white">
                {formatTime(timeLeft)}
              </div>
            ) : (
              <div className="mb-2 text-4xl font-bold text-white">
                Ronda {currentRound}
              </div>
            )}
            <div className="text-sm text-zinc-400">
              {isTimedBattle ? (
                `Ronda ${currentRound} de ${totalRounds}`
              ) : (
                `${currentRound} de ${totalRounds} rondas`
              )}
            </div>
          </div>

          <div className="flex gap-4">
            {isTimedBattle ? (
              // Timed battle controls
              <>
                {!isActive ? (
                  <Button
                    color="success"
                    size="lg"
                    startContent={<Play size={20} />}
                    onPress={onStart}
                  >
                    Iniciar
                  </Button>
                ) : (
                  <Button
                    color="warning"
                    size="lg"
                    startContent={
                      isPaused ? <Play size={20} /> : <Pause size={20} />
                    }
                    onPress={onPause}
                  >
                    {isPaused ? 'Reanudar' : 'Pausar'}
                  </Button>
                )}

                <Button
                  color="danger"
                  variant="bordered"
                  size="lg"
                  startContent={<Square size={20} />}
                  onPress={onStop}
                >
                  Detener
                </Button>
              </>
            ) : (
              // Manual round controls
              <>
                {onResetRound && (
                  <Button
                    color="secondary"
                    variant="bordered"
                    size="lg"
                    startContent={<RotateCcw size={20} />}
                    onPress={onResetRound}
                  >
                    Reiniciar Ronda
                  </Button>
                )}

                {onNextRound && shouldShowNextRoundButton && (
                  <Tooltip
                    content={
                      !shouldEnableNextRoundButton && !isTimedBattle
                        ? "Ambos competidores deben tener al menos un evento registrado para avanzar"
                        : "Avanzar a la siguiente ronda"
                    }
                    isDisabled={shouldEnableNextRoundButton}
                  >
                    <Button
                      color="primary"
                      size="lg"
                      startContent={<SkipForward size={20} />}
                      onPress={onNextRound}
                      isDisabled={!shouldEnableNextRoundButton}
                    >
                      Siguiente Ronda
                    </Button>
                  </Tooltip>
                )}

                <Button
                  color="danger"
                  variant="bordered"
                  size="lg"
                  startContent={<Square size={20} />}
                  onPress={onStop}
                >
                  Finalizar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar - Only for timed battles */}
        {isTimedBattle && roundDuration && (
          <Progress
            value={
              ((roundDuration - timeLeft) / roundDuration) * 100
            }
            color="primary"
            className="mb-4"
          />
        )}

        {/* Round Progress Bar - For manual rounds */}
        {!isTimedBattle && (
          <Progress
            value={(currentRound / totalRounds) * 100}
            color="secondary"
            className="mb-4"
            label={`Progreso del combate`}
          />
        )}

        {/* Battle Status */}
        <div className="flex justify-center">
          <Chip
            color={
              isTimedBattle
                ? isActive
                  ? isPaused
                    ? 'warning'
                    : 'success'
                  : 'default'
                : currentRound <= totalRounds
                ? 'success'
                : 'default'
            }
            variant="flat"
            startContent={<Timer size={16} />}
          >
            {isTimedBattle
              ? isActive
                ? isPaused
                  ? 'Pausado'
                  : 'En Progreso'
                : 'Detenido'
              : currentRound <= totalRounds
              ? `Ronda ${currentRound} Activa`
              : 'Combate Finalizado'}
          </Chip>
        </div>
      </CardBody>
    </Card>
  );
};

export default BattleTimer;
