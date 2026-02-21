import React, { useRef, useEffect } from 'react';
import { useGameState } from '../../hooks/GameState';

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

interface ArenaProps {
  className?: string;
  gameStateRef: React.MutableRefObject<GameState | null>;
}

const Arena = ({ className = '', gameStateRef }: ArenaProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderNoiseField = (cosmicBackground: number[][] | null, ctx: CanvasRenderingContext2D) => {
    if (!cosmicBackground) return;
    const width = cosmicBackground[0]?.length || 0;
    const height = cosmicBackground.length;
    const imageData = ctx.createImageData(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const value = cosmicBackground[y][x];
        imageData.data[index] = value; // R
        imageData.data[index + 1] = value; // G
        imageData.data[index + 2] = value; // B
        imageData.data[index + 3] = 255; // A
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('No canvas ref');
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('No canvas context');
      return;
    }

    const render = () => {
      const gameState = gameStateRef.current;
      if (!gameState) {
        requestAnimationFrame(render);
        return;
      }

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cosmic background
      renderNoiseField(gameState.cosmicBackground, ctx);

      // Center line
      ctx.strokeStyle = '#444444';
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Left paddle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, gameState.paddles.left.y, 10, gameState.paddles.left.height);

      // Right paddle
      ctx.fillRect(
        canvas.width - 30,
        gameState.paddles.right.y,
        10,
        gameState.paddles.right.height,
      );

      // Ball
      ctx.beginPath();
      ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(render);
    };
    render();
    return () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [gameStateRef]);

  return <canvas ref={canvasRef} width={800} height={600} className="w-full h-full" />;
};

export default Arena;
