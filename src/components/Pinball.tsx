import React, { useState, useEffect, useRef } from 'react';
import { RefreshCcw } from 'lucide-react';

export const Pinball: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const requestRef = useRef<number>();

  const ball = useRef({ x: 200, y: 300, vx: 2, vy: -5, radius: 8 });
  const paddle = useRef({ x: 150, width: 100, height: 10 });
  const targets = useRef(Array.from({ length: 15 }, (_, i) => ({
      x: 50 + (i % 5) * 70,
      y: 50 + Math.floor(i / 5) * 40,
      width: 50,
      height: 20,
      active: true,
      color: `hsl(${i * 24}, 70%, 60%)`
  })));

  const initGame = () => {
    ball.current = { x: 200, y: 300, vx: 2, vy: -5, radius: 8 };
    paddle.current = { x: 150, width: 100, height: 10 };
    targets.current = targets.current.map(t => ({ ...t, active: true }));
    setScore(0);
    setGameOver(false);
  };

  const update = () => {
    if (gameOver) return;

    const b = ball.current;
    const p = paddle.current;

    // Move ball
    b.x += b.vx;
    b.y += b.vy;

    // Wall collision
    if (b.x - b.radius < 0 || b.x + b.radius > 400) b.vx *= -1;
    if (b.y - b.radius < 0) b.vy *= -1;

    // Paddle collision
    if (b.y + b.radius > 550 && b.x > p.x && b.x < p.x + p.width) {
        b.vy *= -1.1; // Speed up slightly
        b.y = 550 - b.radius;
        // Add velocity based on where it hit the paddle
        b.vx += (b.x - (p.x + p.width / 2)) * 0.1;
    }

    // Target collision
    targets.current.forEach(t => {
        if (t.active && b.x > t.x && b.x < t.x + t.width && b.y > t.y && b.y < t.y + t.height) {
            t.active = false;
            b.vy *= -1;
            setScore(s => s + 100);
        }
    });

    // Game over
    if (b.y > 600) {
        setGameOver(true);
    }

    draw();
    requestRef.current = requestAnimationFrame(update);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 400, 600);

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 400, 600);

    // Targets
    targets.current.forEach(t => {
        if (t.active) {
            ctx.fillStyle = t.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = t.color;
            ctx.fillRect(t.x, t.y, t.width, t.height);
            ctx.shadowBlur = 0;
        }
    });

    // Paddle
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(paddle.current.x, 550, paddle.current.width, paddle.current.height);

    // Ball
    ctx.beginPath();
    ctx.arc(ball.current.x, ball.current.y, ball.current.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.closePath();
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameOver]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 50;
    paddle.current.x = Math.max(0, Math.min(300, x));
  };

  return (
    <div className="bg-slate-950 p-8 flex flex-col items-center gap-6 rounded-3xl shadow-2xl border border-white/5 min-w-[500px]">
      <div className="flex justify-between w-full items-center px-4">
        <h2 className="text-white font-black text-2xl tracking-tighter">Space Pinball</h2>
        <div className="text-blue-400 font-mono font-black text-3xl">{score.toString().padStart(6, '0')}</div>
      </div>

      <div 
        className="relative border-4 border-slate-800 rounded-2xl overflow-hidden cursor-none"
        onMouseMove={handleMouseMove}
      >
        <canvas ref={canvasRef} width={400} height={600} className="bg-slate-900" />
        
        {gameOver && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
              <h3 className="text-5xl font-black text-white mb-2">GAME OVER</h3>
              <p className="text-slate-400 font-bold mb-8 italic">Punteggio: {score}</p>
              <button 
                onClick={initGame}
                className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl"
              >
                RIPROVA
              </button>
            </div>
        )}
      </div>

      <div className="text-slate-500 text-[10px] font-black tracking-widest uppercase opacity-40">Muovi il mouse per controllare la paletta</div>
    </div>
  );
};
