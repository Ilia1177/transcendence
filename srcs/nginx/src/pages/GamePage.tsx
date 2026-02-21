import { NavBar } from '../components/molecules/NavBar';
import Background from '../components/atoms/Background';
import Arena from '../components/organisms/Arena';
import GameStatusBar from '../components/organisms/GameStatusBar';
import GameControl from '../components/organisms/GameControl';
import { useLocalSession } from '../api/game-api';
import { useGameState } from '../hooks/GameState';
import { useGameWebSocket } from '../hooks/GameWebSocket';
import { useEffect } from 'react';

export interface Paddle {
  y: number;
  height: number;
  width: number;
  speed: number;
  moving: 'up' | 'down' | 'stop';
}

export interface Paddles {
  left: Paddle;
  right: Paddle;
}

export interface Scores {
  left: number;
  right: number;
}

export type GameStatus = 'waiting' | 'playing' | 'paused' | 'finished';

export interface GameState {
  ball: {
    x: number;
    y: number;
    radius: number;
  };
  paddles: {
    left: {
      y: number;
      height: number;
    };
    right: {
      y: number;
      height: number;
    };
  };
  scores: Scores;
  status: GameStatus;
  cosmicBackground: number[][] | null;
}
const colors = {
  start: '#00ff9f',
  end: '#0088ff',
};

export const GamePage = ({ sessionId: routeSessionId }: { sessionId: string | null }) => {
  const { createLocalSession, isLoading, sessionId: localSessionId } = useLocalSession();
  const { gameStateRef, updateGameState } = useGameState();
  const { openWebSocket } = useGameWebSocket();

  const activeSessionId = routeSessionId || localSessionId;
  console.log('GamePage render - activeSessionId:', activeSessionId); // Add this
  // Connect WebSocket when sessionId is available
  useEffect(() => {
    if (!activeSessionId) {
      console.log('No Active session...');
      return;
    }

    console.log('Opening WebSocket for session:', activeSessionId);

    openWebSocket(activeSessionId).then((ws) => {
      console.log('WebSocket opened:', ws);
      ws.onmessage = (event) => {
        console.log('Received WebSocket message:', event.data);
        const state: GameState = JSON.parse(event.data);
        console.log('Parsed game state:', state);
        updateGameState(state); // update ref, no React re-render
      };
    });
  }, [activeSessionId, openWebSocket, updateGameState]);
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
