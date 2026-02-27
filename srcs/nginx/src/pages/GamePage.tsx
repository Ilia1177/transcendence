import { NavBar } from '../components/molecules/NavBar';
import Background from '../components/atoms/Background';
import Arena from '../components/organisms/Arena';
import GameStatusBar from '../components/organisms/GameStatusBar';
import GameControl from '../components/organisms/GameControl';
import { useGameState } from '../hooks/GameState';
import { useGameWebSocket } from '../hooks/GameWebSocket';
import { useEffect, useState, useRef } from 'react';
import { useKeyboardControls } from '../hooks/input.tsx';
import { useGameSessions, UseGameSessionsReturn } from '../hooks/GameSessions';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { api } from '../api/api-client';
// import authProvider from '../providers/AuthProvider'
import {
  ERROR_CODES,
  ErrorCode,
  ErrorDetail,
  FrontendError,
  HTTP_STATUS,
  HttpStatus,
} from '@transcendence/core';

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

interface ServerMessage {
  type: 'connected' | 'state' | 'gameOver' | 'error' | 'pong';
  sessionId?: string;
  data?: GameState;
  message?: string;
}

interface GamePageProps {
  sessionId: string | null;
  gameMode: 'local' | 'remote' | 'tournament';
}
interface CreateSessionPayload {
  gameMode: string;
  tournamentId?: number;
}
// export const GamePage = ({ sessionId: routeSessionId }: { sessionId: string | null }) => {
export const GamePage = ({ sessionId, gameMode }: GamePageProps) => {
  const { openWebSocket, closeWebSocket } = useGameWebSocket();
  const { gameStateRef, updateGameState } = useGameState();
  const [currentSessionId, setSessionId] = useState<string | null>(sessionId);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null); // Use ref instead of state
  const { tournamentId } = useParams<{ tournamentId?: string }>();
  const navigate = useNavigate();
  // const { checkAuth, isLoggedIn } = useAuth(); // Get from context
  useKeyboardControls({
    wsRef,
    gameMode,
    enabled: !!currentSessionId, // Only enable when connected
  });

  const createLocalSession = async () => {
    setIsLoading(true);
    console.log('🍪 Cookies:', document.cookie);
    console.log('create session with...', gameMode);
    // Build request body conditionally
    const requestBody = {
      gameMode: gameMode,
      ...(tournamentId ? { tournamentId } : {}),
    };

    try {
      const payload: CreateSessionPayload = {
        gameMode: gameMode,
        tournamentId: 43,
      };
      console.log('Making request with credentials:', api.defaults.withCredentials);
      const response = await api.post('/game/create-session', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // const response = await api.post('/game/create-session', payload);
      const data = response.data; // or destructure: const { data } = response;

      if (data && data.sessionId) {
        console.log('Success');
        setSessionId(data.sessionId);
      }
    } catch (error) {
      // Your interceptor will transform this to FrontendError
      console.error('Failed to create session:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }

    setIsLoading(false);
  };

  const onStartGame = () => {
    if (!wsRef.current) {
      console.error('WebSocket not connected');
      return;
    }

    console.log('📤 Sending start message');
    wsRef.current.send(JSON.stringify({ type: 'start' }));
  };

  const onExitGame = async () => {
    if (!currentSessionId) {
      console.log('no Session');
      return;
    }
    try {
      const response = await api.delete(`/game/del/${currentSessionId}`);
      const data = response.data; // or destructure: const { data } = response;
      if (data && data.sessionId) {
        console.log('Success');
        setSessionId(data.sessionId);
      }
    } catch (error) {
      // Your interceptor will transform this to FrontendError
      console.error('Failed to create session:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
      navigate('/home');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (gameMode === 'local' && !currentSessionId) {
      createLocalSession();
      console.log('Auto-creating local session...');
    }
  }, [gameMode, currentSessionId]); // Only run when gameMode changes (on mount)

  useEffect(() => {
    if (!currentSessionId) return;
    const connectWebSocket = async () => {
      try {
        const ws = await openWebSocket(currentSessionId, (message: ServerMessage) => {
          if (message.type === 'state' && message.data) {
            updateGameState(message.data);
          }
        });

        wsRef.current = ws; // Store WebSocket in ref
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };

    connectWebSocket();

    // Cleanup on unmount or sessionId change
    return () => {
      closeWebSocket();
      wsRef.current = null;
    };
  }, [currentSessionId, openWebSocket, updateGameState, closeWebSocket]);

  const handleSelectSession = (selectedSessionId: string) => {
    console.log('Selected session:', selectedSessionId);
    setSessionId(selectedSessionId);
    // navigate('game/remote');
  };
  const sessions = useGameSessions() as UseGameSessionsReturn;

  return (
    <div className={`w-full h-full relative`}>
      <Background
        grainIntensity={4}
        baseFrequency={0.28}
        colorStart={colors.start}
        colorEnd={colors.end}
      >
        <NavBar />
        <div className="flex flex-row flex-1 overflow-hidden">
          {' '}
          {/* Added flex-1 and overflow-hidden */}
          <div className="flex flex-col flex-[1] overflow-y-auto p-4">
            {' '}
            {/* Added overflow and padding */}
            <GameControl
              onCreateLocalGame={createLocalSession}
              onStartGame={onStartGame}
              onExitGame={onExitGame}
              gameMode={gameMode}
              loading={isLoading}
            />
            {gameMode === 'remote' ? (
              <GameStatusBar sessionsData={sessions} onSelectSession={handleSelectSession} />
            ) : (
              <GameStatusBar sessionsData={null} />
            )}
          </div>
          <div className="flex-[3] flex justify-center p-4">
            {' '}
            {/* Added flex centering */}
            <Arena gameStateRef={gameStateRef} />
          </div>
        </div>
      </Background>
    </div>
  );
};
