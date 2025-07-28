import { useState, useEffect, useMemo } from 'react';
import { useBLEStore } from '@stores/useBLEStore';

interface BattleConfig {
  mode: 'time' | 'rounds';
  rounds: number;
  roundDuration?: number;
}

interface UseBattleTimerProps {
  battleConfig: BattleConfig;
  onFinish: () => void;
}

export const useBattleTimer = ({
  battleConfig,
  onFinish,
}: UseBattleTimerProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(battleConfig.roundDuration || 60);

  // Access BLE store functions
  const removeLastEventFromEachCompetitor = useBLEStore(
    state => state.removeLastEventFromEachCompetitor,
  );
  const combatEvents = useBLEStore(state => state.combatEvents);

  // Timer logic - only for timed battles
  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Only run timer if battle is in time mode
    if (battleConfig.mode === 'time' && isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Round finished - pause timer and advance to next round
            setIsActive(false);
            setIsPaused(false);

            if (currentRound < battleConfig.rounds) {
              // Advance to next round but don't start timer automatically
              setCurrentRound(prev => prev + 1);
              return battleConfig.roundDuration || 60;
            } else {
              // Battle finished
              onFinish();
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft, currentRound, battleConfig, onFinish]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(battleConfig.roundDuration || 60);
    setCurrentRound(1);
  };

  // Check if both competitors have at least one event
  // Using useMemo to recalculate automatically when events change
  const canAdvanceToNextRound = useMemo(() => {
    console.log('🔍 [useBattleTimer] Recalculando canAdvanceToNextRound...', {
      battleMode: battleConfig.mode,
      totalEvents: combatEvents.length,
      currentRound,
    });

    // For timed battles, always allow advancing (timer controls the flow)
    if (battleConfig.mode === 'time') {
      console.log('🔍 [useBattleTimer] Modo tiempo - siempre permitir avanzar');
      return true;
    }

    // For rounds mode, both competitors must have at least one event
    const competitor1Events = combatEvents.filter(
      e => e.fighter_id === 'fighter_1',
    );
    const competitor2Events = combatEvents.filter(
      e => e.fighter_id === 'fighter_2',
    );

    const canAdvance =
      competitor1Events.length > 0 && competitor2Events.length > 0;

    console.log('🔍 [useBattleTimer] Validación de eventos:', {
      competitor1Events: competitor1Events.length,
      competitor2Events: competitor2Events.length,
      canAdvance,
      battleMode: battleConfig.mode,
      allEvents: combatEvents.map(e => ({
        fighter_id: e.fighter_id,
        event_type: e.event_type,
        timestamp: e.timestamp,
      })),
    });

    return canAdvance;
  }, [battleConfig.mode, combatEvents, currentRound]);

  const handleNextRound = () => {
    // Validate if we can advance to next round (only for rounds mode)
    if (battleConfig.mode === 'rounds' && !canAdvanceToNextRound) {
      console.warn(
        'No se puede avanzar a la siguiente ronda: ambos competidores deben tener al menos un evento registrado',
      );
      return;
    }

    if (currentRound < battleConfig.rounds) {
      setCurrentRound(prev => prev + 1);
      // Reset timer for next round if it's a timed battle
      if (battleConfig.mode === 'time' && battleConfig.roundDuration) {
        setTimeLeft(battleConfig.roundDuration);
      }
    } else {
      // All rounds completed
      onFinish();
    }
  };

  const handleResetRound = () => {
    // Remove the last event from each competitor
    removeLastEventFromEachCompetitor();

    // Reset current round timer if it's a timed battle
    if (battleConfig.mode === 'time' && battleConfig.roundDuration) {
      setTimeLeft(battleConfig.roundDuration);
      setIsPaused(false);
    }
  };

  return {
    isActive,
    isPaused,
    currentRound,
    timeLeft,
    handleStart,
    handlePause,
    handleStop,
    handleNextRound,
    handleResetRound,
    canAdvanceToNextRound,
  };
};
