import { NavBar } from '../components/molecules/NavBar';
import Background from '../components/atoms/Background';
import Arena from '../components/organisms/Arena';
import GameStatusBar from '../components/organisms/GameStatusBar';
import GameControl from '../components/organisms/GameControl';
import { useLocalSession } from '../api/game-api';
import { useGameState } from '../hooks/GameState';
import { useGameWebSocket } from '../hooks/GameWebSocket';
import { useEffect } from 'react';

const colors = {
  start: '#00ff9f',
  end: '#0088ff',
};

export const GamePage = ({ sessionId }: { sessionId: string }) => {
  const { createLocalSession, isLoading } = useLocalSession();
  const { gameStateRef, updateGameState } = useGameState();
  const { openWebSocket } = useGameWebSocket();
  // Connect WebSocket when sessionId is available
  useEffect(() => {
    if (!sessionId) return;

    openWebSocket(sessionId).then((ws) => {
      ws.onmessage = (event) => {
        const state: GameState = JSON.parse(event.data);
        updateGameState(state); // update ref, no React re-render
      };
    });
  }, [sessionId, openWebSocket, updateGameState]);
  return (
    <div className={`w-full h-full relative`}>
      <Background
        grainIntensity={4}
        baseFrequency={0.28}
        colorStart={colors.start}
        colorEnd={colors.end}
      >
        <NavBar />
        <div className="flex flex-row h-full">
          <div className="flex flex-col flex-[1]">
            <GameControl onCreateLocalGame={createLocalSession} loading={isLoading} />
            <GameStatusBar />
          </div>

          <div className="flex-[3]">
            <Arena gameStateRef={gameStateRef} />
          </div>
        </div>
      </Background>
    </div>
  );
};
