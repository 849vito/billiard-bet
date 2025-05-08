
import { useState, useEffect, useRef, useCallback } from 'react';
import Matter from 'matter-js';
import { 
  setupTable, 
  createBalls, 
  calculateShotVector, 
  allBallsStopped,
  BALL_RADIUS,
  TABLE_WIDTH,
  TABLE_HEIGHT,
  BALL_COLORS
} from '@/utils/GamePhysics';

type BallState = {
  number: number;
  position: { x: number, y: number };
  pocketed: boolean;
  color: string;
};

type GameState = 'waiting' | 'aiming' | 'shooting' | 'opponent-turn' | 'game-over';

export const useBilliardPhysics = () => {
  const [power, setPower] = useState(0);
  const [isPoweringUp, setIsPoweringUp] = useState(false);
  const [balls, setBalls] = useState<BallState[]>([]);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [message, setMessage] = useState("Your turn! Click and hold to power up the shot.");
  const [aimAngle, setAimAngle] = useState(0);
  const [showTrajectory, setShowTrajectory] = useState(false);
  
  // Refs for matter.js objects
  const engineRef = useRef<Matter.Engine | null>(null);
  const worldRef = useRef<Matter.World | null>(null);
  const ballBodiesRef = useRef<Matter.Body[]>([]);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initialMouseRef = useRef<{ x: number, y: number } | null>(null);
  const currentMouseRef = useRef<{ x: number, y: number } | null>(null);
  
  // Setup the physics world
  const initPhysics = useCallback(() => {
    if (!containerRef.current) return;
    
    // Clear any existing physics engine
    if (engineRef.current) {
      Matter.Engine.clear(engineRef.current);
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
      }
      if (renderRef.current && renderRef.current.canvas) {
        Matter.Render.stop(renderRef.current);
        renderRef.current.canvas.remove();
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    
    // Get container dimensions for responsive sizing
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Calculate scale to fit table in container while preserving aspect ratio
    const scale = Math.min(containerWidth / TABLE_WIDTH, containerHeight / TABLE_HEIGHT);
    
    // Setup Matter.js engine and renderer
    const { engine, world, cushions, pockets } = setupTable();
    engineRef.current = engine;
    worldRef.current = world;
    
    // Create balls
    const ballBodies = createBalls();
    ballBodiesRef.current = ballBodies;
    
    // Add balls to world
    Matter.World.add(world, ballBodies);
    
    // Create visual state of balls
    const ballsState = ballBodies.map(ball => {
      const ballNumber = parseInt(ball.label?.split('-')[1] || '0', 10);
      return {
        number: ballNumber,
        position: {
          x: ball.position.x,
          y: ball.position.y
        },
        pocketed: false,
        color: BALL_COLORS[ballNumber as keyof typeof BALL_COLORS] || 'white'
      };
    });
    
    setBalls(ballsState);
    
    // Setup collision detection for pockets
    Matter.Events.on(engine, 'collisionStart', (event) => {
      const pairs = event.pairs;
      
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        
        // Check if a ball has collided with a pocket
        if (pair.bodyA.label.includes('pocket') && pair.bodyB.label.includes('ball')) {
          const ball = pair.bodyB;
          const ballNumber = parseInt(ball.label.split('-')[1], 10);
          
          // Make ball inactive and update state
          Matter.World.remove(world, ball);
          
          setBalls(prevBalls => 
            prevBalls.map(b => 
              b.number === ballNumber 
                ? { ...b, pocketed: true } 
                : b
            )
          );
          
          // Special handling for the cue ball (respawn it)
          if (ballNumber === 0) {
            setMessage("Scratch! Cue ball will be respawned.");
            
            // Wait a moment, then respawn cue ball
            setTimeout(() => {
              const newCueBall = Matter.Bodies.circle(
                TABLE_WIDTH * 0.25,
                TABLE_HEIGHT / 2,
                BALL_RADIUS,
                {
                  restitution: 0.7,
                  friction: 0.005,
                  frictionAir: 0.015,
                  density: 0.8,
                  label: 'ball-0',
                  render: { fillStyle: 'white' }
                }
              );
              
              Matter.World.add(world, newCueBall);
              
              // Update ref and state
              ballBodiesRef.current = [
                newCueBall,
                ...ballBodiesRef.current.filter(b => b.label !== 'ball-0')
              ];
              
              setBalls(prevBalls => 
                prevBalls.map(b => 
                  b.number === 0 
                    ? { 
                        ...b, 
                        pocketed: false,
                        position: { 
                          x: TABLE_WIDTH * 0.25, 
                          y: TABLE_HEIGHT / 2 
                        } 
                      } 
                    : b
                )
              );
              
              setMessage("Your turn again!");
            }, 1500);
          } else if (ballNumber === 8) {
            // 8-ball handling
            setMessage("8-ball pocketed! Game over!");
            setGameState('game-over');
          }
        }
      }
    });
    
    // Update game state based on ball movement
    const updateInterval = setInterval(() => {
      if (gameState === 'shooting') {
        const allStopped = allBallsStopped(ballBodiesRef.current.filter(ball => {
          // Only consider balls that are still in the world
          return worldRef.current?.bodies.includes(ball);
        }));
        
        if (allStopped) {
          setMessage("Your turn! Click and hold to power up the shot.");
          setGameState('waiting');
        }
      }
      
      // Update ball positions for rendering
      setBalls(prevBalls => {
        return prevBalls.map(ball => {
          // Find the corresponding physics body
          const body = ballBodiesRef.current.find(b => b.label === `ball-${ball.number}`);
          
          if (body && !ball.pocketed) {
            return {
              ...ball,
              position: { x: body.position.x, y: body.position.y }
            };
          }
          
          return ball;
        });
      });
    }, 16); // 60fps update interval
    
    // Start the physics engine
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    runnerRef.current = runner;
    
    setGameState('waiting');
    setMessage("Your turn! Click and hold to power up the shot.");
    
    return () => {
      clearInterval(updateInterval);
    };
  }, [gameState]);
  
  // Initialize game on component mount and when container size changes
  useEffect(() => {
    initPhysics();
    
    // Handle window resize
    const handleResize = () => {
      initPhysics();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current);
      }
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
      }
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [initPhysics]);
  
  // Power up the shot
  const startPoweringUp = useCallback((x: number, y: number) => {
    if (gameState !== 'waiting') return;
    
    setGameState('aiming');
    setIsPoweringUp(true);
    setPower(0);
    initialMouseRef.current = { x, y };
    currentMouseRef.current = { x, y };
    setShowTrajectory(true);
    
    const powerInterval = setInterval(() => {
      setPower(prev => {
        if (prev >= 100) {
          clearInterval(powerInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    
    return powerInterval;
  }, [gameState]);
  
  // Take the shot
  const takeShot = useCallback(() => {
    if (gameState !== 'aiming' || !initialMouseRef.current || !currentMouseRef.current) return;
    
    setIsPoweringUp(false);
    setShowTrajectory(false);
    setGameState('shooting');
    
    // Find cue ball
    const cueBall = ballBodiesRef.current.find(ball => ball.label === 'ball-0');
    if (!cueBall || !worldRef.current) return;
    
    const start = initialMouseRef.current;
    const end = currentMouseRef.current;
    
    // Calculate force vector based on aim and power
    const force = calculateShotVector(
      start.x, 
      start.y, 
      end.x, 
      end.y, 
      power
    );
    
    // Apply force to cue ball
    Matter.Body.applyForce(cueBall, cueBall.position, force);
    
    setMessage(`Shot taken with ${power}% power!`);
    setPower(0);
    
    // Reset references
    initialMouseRef.current = null;
    currentMouseRef.current = null;
  }, [gameState, power]);
  
  // Handle mouse movement for aiming
  const handleMouseMove = useCallback((x: number, y: number) => {
    if (gameState !== 'aiming' || !initialMouseRef.current) return;
    
    currentMouseRef.current = { x, y };
    
    // Calculate angle for rendering cue stick
    const dx = initialMouseRef.current.x - x;
    const dy = initialMouseRef.current.y - y;
    const angle = Math.atan2(dy, dx);
    
    setAimAngle(angle);
  }, [gameState]);
  
  // Calculate the trajectory line points for rendering
  const calculateTrajectoryPoints = useCallback(() => {
    if (!showTrajectory || !initialMouseRef.current || !currentMouseRef.current) {
      return [];
    }
    
    const cueBall = balls.find(ball => ball.number === 0);
    if (!cueBall || cueBall.pocketed) return [];
    
    const start = { x: cueBall.position.x, y: cueBall.position.y };
    
    // Calculate direction vector from mouse positions
    const dx = initialMouseRef.current.x - currentMouseRef.current.x;
    const dy = initialMouseRef.current.y - currentMouseRef.current.y;
    
    // Normalize vector
    const length = Math.sqrt(dx * dx + dy * dy);
    const normalizedX = dx / length;
    const normalizedY = dy / length;
    
    // Generate trajectory points
    const points = [];
    const trajectoryLength = 300; // Length of trajectory line
    
    for (let i = 0; i <= 10; i++) {
      const t = (i / 10) * trajectoryLength;
      points.push({
        x: start.x + normalizedX * t,
        y: start.y + normalizedY * t
      });
    }
    
    return points;
  }, [balls, showTrajectory]);
  
  // Calculate the aim guide line
  const trajectoryPoints = calculateTrajectoryPoints();
  
  // Interface for controlling the game
  return {
    balls,
    power,
    isPoweringUp,
    gameState,
    message,
    aimAngle,
    trajectoryPoints,
    containerRef,
    canvasRef,
    startPoweringUp,
    takeShot,
    handleMouseMove,
    showTrajectory
  };
};
