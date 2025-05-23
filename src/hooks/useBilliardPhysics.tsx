import { useState, useEffect, useRef, useCallback } from 'react';
import Matter from 'matter-js';
import { toast } from "sonner";
import { 
  setupTable, 
  createBalls, 
  calculateShotVector, 
  allBallsStopped,
  BALL_RADIUS,
  TABLE_WIDTH,
  TABLE_HEIGHT,
  BALL_COLORS,
  BallType
} from '@/utils/GamePhysics';
import { applyEnglish, calculateTrajectoryPath, findFirstCollisionBall, simulateCueStrike } from '@/utils/BallPhysics';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

type BallState = {
  number: number;
  position: { x: number, y: number };
  pocketed: boolean;
  color: string;
  type: BallType;
};

type GameState = 'waiting' | 'aiming' | 'shooting' | 'opponent-turn' | 'game-over';
type PlayerTurn = 'player' | 'opponent';

type UseBilliardPhysicsProps = {
  onShotTaken?: () => void;
  onBallPocketed?: (ballNumber: number) => void;
};

export const useBilliardPhysics = (isPracticeMode: boolean = false, props?: UseBilliardPhysicsProps) => {
  const [power, setPower] = useState(0);
  const [isPoweringUp, setIsPoweringUp] = useState(false);
  const [balls, setBalls] = useState<BallState[]>([]);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [message, setMessage] = useState("Your turn! Click and hold to power up the shot.");
  const [aimAngle, setAimAngle] = useState(0);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [playerType, setPlayerType] = useState<BallType | null>(null);
  const [playerTurn, setPlayerTurn] = useState<PlayerTurn>('player');
  const [legalBreak, setLegalBreak] = useState(false);
  const [gameInitialized, setGameInitialized] = useState(false);
  const [eightBallPocketable, setEightBallPocketable] = useState(false);
  const [isBreakShot, setIsBreakShot] = useState(true);
  const [trajectoryPoints, setTrajectoryPoints] = useState<Array<{x: number, y: number}>>([]);
  const { user, isAuthenticated } = useAuth();
  
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
  const shotTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Game state refs
  const lastPocketedBallRef = useRef<number | null>(null);
  const breakShotRef = useRef(true);
  const turnEndedRef = useRef(false);
  const cushionHitRef = useRef(false);
  const firstBallHitRef = useRef<number | null>(null);
  const foulCommittedRef = useRef(false);

  // Save shot data to Supabase
  const saveShot = async (successful: boolean, ballsPocketed: number[] = []) => {
    if (!isAuthenticated || !user) return;
    
    try {
      // Get session id from localStorage or create one
      let sessionId = localStorage.getItem('pool_practice_session_id');
      
      if (!sessionId) {
        const { data, error } = await supabase
          .from('practice_sessions')
          .insert({
            user_id: user.id,
            shots_taken: 0,
            balls_pocketed: 0
          })
          .select('id')
          .single();
          
        if (error || !data) {
          console.error("Failed to create practice session", error);
          return;
        }
        
        sessionId = data.id;
        localStorage.setItem('pool_practice_session_id', sessionId);
      }
      
      // Save shot data
      await supabase
        .from('practice_shots')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          power,
          angle: aimAngle,
          balls_hit: firstBallHitRef.current ? [firstBallHitRef.current] : [],
          balls_pocketed: ballsPocketed,
          successful,
          english_x: 0, // Could track english if implemented
          english_y: 0
        });
    } catch (err) {
      console.error("Error saving shot data:", err);
    }
  };

  // Handle a ball being pocketed
  const handlePocketedBall = useCallback((ballNumber: number) => {
    // On break shot, check if any balls were pocketed or hit the rails
    if (breakShotRef.current) {
      if (ballNumber !== 0) {
        setLegalBreak(true);
      }
      
      // Determine player type based on first pocketed ball (excluding cue ball)
      if (ballNumber > 0 && ballNumber < 8 && playerType === null) {
        setPlayerType(BallType.SOLID);
        toast.success("You are assigned Solid balls (1-7)");
      } else if (ballNumber > 8 && playerType === null) {
        setPlayerType(BallType.STRIPE);
        toast.success("You are assigned Striped balls (9-15)");
      }
    }
    
    // Special handling for the cue ball (respawn it)
    if (ballNumber === 0) {
      setMessage("Scratch! Cue ball will be respawned.");
      toast.error("You scratched! Turn will pass to opponent.");
      
      // Turn ends when you pocket the cue ball
      turnEndedRef.current = true;
      foulCommittedRef.current = true;
      
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
        
        if (!worldRef.current) return;
        Matter.World.add(worldRef.current, newCueBall);
        
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
        
        // In practice mode, don't switch turns
        if (isPracticeMode) {
          setGameState('waiting');
          setMessage("Your turn again!");
        } else {
          // Switch turns
          setPlayerTurn('opponent');
          setGameState('opponent-turn');
          setMessage("Opponent's turn");
        }
      }, 1500);
    } else if (ballNumber === 8) {
      // 8-ball handling
      const solidsRemaining = balls.filter(b => b.number > 0 && b.number < 8 && !b.pocketed).length;
      const stripesRemaining = balls.filter(b => b.number > 8 && !b.pocketed).length;
      
      if ((playerType === BallType.SOLID && solidsRemaining === 0) || 
          (playerType === BallType.STRIPE && stripesRemaining === 0)) {
        setMessage("8-ball pocketed! You win!");
        toast.success("You win! All your balls and the 8-ball were pocketed.");
        setGameState('game-over');
      } else {
        setMessage("8-ball pocketed too early! You lose!");
        toast.error("You lost! You pocketed the 8-ball before clearing your balls.");
        setGameState('game-over');
      }
    } else {
      // Regular ball pocketed
      const ballTypePocketed = ballNumber < 8 ? BallType.SOLID : BallType.STRIPE;
      
      // In practice mode, always allow player to keep shooting
      if (isPracticeMode) {
        setMessage(`Ball ${ballNumber} pocketed! Continue your turn.`);
      } else {
        // First pocketed ball determines player type if not already set
        if (playerType === null) {
          setPlayerType(ballTypePocketed);
          toast.success(`You are assigned ${ballTypePocketed === BallType.SOLID ? 'Solid' : 'Striped'} balls`);
        }
        
        // Check if player pocketed the right type
        if (playerType === ballTypePocketed) {
          setMessage(`Ball ${ballNumber} pocketed! You can shoot again.`);
        } else {
          setMessage(`Ball ${ballNumber} pocketed! Opponent's ball.`);
          turnEndedRef.current = true;
        }
      }
    }
    
    // Save the pocketed ball to Supabase if authenticated
    if (isAuthenticated && user && ballNumber > 0) {
      saveShot(true, [ballNumber]);
    }
  }, [balls, isPracticeMode, playerType, isAuthenticated, user]);

  // Simulate opponent's turn (for non-practice mode)
  const simulateOpponentShot = useCallback(() => {
    if (!worldRef.current) return;
    
    // Find cue ball
    const cueBall = ballBodiesRef.current.find(ball => ball.label === 'ball-0');
    if (!cueBall) return;
    
    // Find opponent ball type
    const opponentType = playerType === BallType.SOLID ? BallType.STRIPE : BallType.SOLID;
    
    // Find opponent balls
    const opponentBalls = balls.filter(b => 
      !b.pocketed && 
      ((opponentType === BallType.SOLID && b.number > 0 && b.number < 8) ||
       (opponentType === BallType.STRIPE && b.number > 8))
    );
    
    // Try to target one of opponent's balls or 8-ball if appropriate
    const targetableBalls = opponentBalls.length > 0 ? opponentBalls : 
                          balls.filter(b => !b.pocketed && b.number === 8);
    
    // If no balls to target, just do a random shot
    if (targetableBalls.length === 0) {
      const randomAngle = Math.random() * Math.PI * 2;
      const randomPower = 30 + Math.random() * 40;
      
      const force = {
        x: Math.cos(randomAngle) * randomPower * 0.05,
        y: Math.sin(randomAngle) * randomPower * 0.05
      };
      
      // Apply the force
      Matter.Body.applyForce(cueBall, cueBall.position, force);
      setGameState('shooting');
      setMessage("Opponent is shooting...");
      
      // Always end opponent's turn after their shot
      turnEndedRef.current = true;
      return;
    }
    
    // Select a random target ball
    const targetBall = targetableBalls[Math.floor(Math.random() * targetableBalls.length)];
    
    // Calculate angle to hit the target ball
    const dx = targetBall.position.x - cueBall.position.x;
    const dy = targetBall.position.y - cueBall.position.y;
    const angle = Math.atan2(dy, dx);
    
    // Add some random inaccuracy
    const inaccuracy = (Math.random() - 0.5) * 0.3; // +/- 0.15 radians
    const finalAngle = angle + inaccuracy;
    
    // Calculate power
    const distance = Math.sqrt(dx * dx + dy * dy);
    const basePower = Math.min(80, Math.max(30, distance * 0.2)); // Scale power by distance
    const randomPower = basePower * (0.8 + Math.random() * 0.4); // 80-120% of base power
    
    const force = {
      x: Math.cos(finalAngle) * randomPower * 0.05,
      y: Math.sin(finalAngle) * randomPower * 0.05
    };
    
    // Apply the force
    Matter.Body.applyForce(cueBall, cueBall.position, force);
    setGameState('shooting');
    setMessage("Opponent is shooting...");
    
    // Always end opponent's turn after their shot
    turnEndedRef.current = true;
  }, [balls, playerType]);
  
  // Enhanced handleShotCompleted function to ensure state transitions properly
  const handleShotCompleted = useCallback(() => {
    console.log("SHOT COMPLETED - Transitioning game state");
    
    // Reset powering up state - critical fix
    setIsPoweringUp(false);
    
    // Break shot is over
    if (breakShotRef.current) {
      breakShotRef.current = false;
      setIsBreakShot(false);
      
      // Check if it was a legal break
      if (!legalBreak && !isPracticeMode) {
        setMessage("Illegal break! No balls pocketed or hit cushions.");
        turnEndedRef.current = true;
        foulCommittedRef.current = true;
      }
    }
    
    // Reset shot tracking vars
    firstBallHitRef.current = null;
    cushionHitRef.current = false;
    
    // CRITICAL FIX: Force transition back to waiting state for practice mode
    if (isPracticeMode) {
      console.log("Practice mode - forcing state back to waiting");
      setMessage("Your turn! Click and hold to power up the shot.");
      setGameState('waiting');
    } else {
      // For regular game mode with turns
      console.log("Game mode - checking turn end conditions");
      if (turnEndedRef.current) {
        setPlayerTurn(prev => prev === 'player' ? 'opponent' : 'player');
        turnEndedRef.current = false;
        
        if (foulCommittedRef.current) {
          toast.error("Foul committed! Turn passes to opponent.");
          foulCommittedRef.current = false;
        }
        
        if (playerTurn === 'player') {
          setGameState('opponent-turn');
          setMessage("Opponent's turn");
          
          // Simulate opponent's turn after delay
          if (playerTurn === 'player') {
            setTimeout(() => {
              simulateOpponentShot();
            }, 2000);
          }
        } else {
          setGameState('waiting');
          setMessage("Your turn! Click and hold to power up the shot.");
        }
      } else {
        // Player gets to continue their turn
        if (playerTurn === 'player') {
          setGameState('waiting');
          setMessage("Your turn! Click and hold to power up the shot.");
        } else {
          setGameState('opponent-turn');
          setMessage("Opponent's turn");
          
          // Simulate opponent's turn after delay
          setTimeout(() => {
            simulateOpponentShot();
          }, 2000);
        }
      }
    }
  }, [isPracticeMode, legalBreak, playerTurn, simulateOpponentShot]);

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
        if (renderRef.current.canvas.parentNode) {
          renderRef.current.canvas.parentNode.removeChild(renderRef.current.canvas);
        }
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (shotTimerRef.current) {
        clearTimeout(shotTimerRef.current);
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
        color: BALL_COLORS[ballNumber as keyof typeof BALL_COLORS] || 'white',
        // Determine ball type
        type: ballNumber === 0 ? BallType.CUE : 
              ballNumber === 8 ? BallType.EIGHT : 
              ballNumber < 8 ? BallType.SOLID : BallType.STRIPE
      };
    });
    
    setBalls(ballsState);
    
    // Reset game state
    setPlayerType(null);
    setPlayerTurn('player');
    breakShotRef.current = true;
    setIsBreakShot(true);
    turnEndedRef.current = false;
    lastPocketedBallRef.current = null;
    setLegalBreak(false);
    cushionHitRef.current = false;
    firstBallHitRef.current = null;
    foulCommittedRef.current = false;
    setEightBallPocketable(false);
    
    // Track cushion hits for break shot
    Matter.Events.on(engine, 'collisionStart', (event) => {
      const pairs = event.pairs;
      
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        
        // Track when a ball hits a cushion
        if (pair.bodyA.label.includes('ball') && !pair.bodyB.label.includes('ball')) {
          cushionHitRef.current = true;
        } else if (pair.bodyB.label.includes('ball') && !pair.bodyA.label.includes('ball')) {
          cushionHitRef.current = true;
        }
        
        // Track ball-to-ball collisions
        if (pair.bodyA.label.includes('ball') && pair.bodyB.label.includes('ball')) {
          const ballA = parseInt(pair.bodyA.label.split('-')[1], 10);
          const ballB = parseInt(pair.bodyB.label.split('-')[1], 10);
          
          // If cue ball hits another ball, track which ball was hit first
          if (ballA === 0 && firstBallHitRef.current === null) {
            firstBallHitRef.current = ballB;
          } else if (ballB === 0 && firstBallHitRef.current === null) {
            firstBallHitRef.current = ballA;
          }
          
          // On break, if four balls hit cushions, it's a legal break
          if (breakShotRef.current && cushionHitRef.current) {
            setLegalBreak(true);
          }
        }
        
        // Check if a ball has collided with a pocket
        if (pair.bodyA.label.includes('pocket') && pair.bodyB.label.includes('ball')) {
          const ball = pair.bodyB;
          const ballNumber = parseInt(ball.label.split('-')[1], 10);
          
          // Track the last pocketed ball
          lastPocketedBallRef.current = ballNumber;
          
          // Make ball inactive and update state
          Matter.World.remove(world, ball);
          
          setBalls(prevBalls => 
            prevBalls.map(b => 
              b.number === ballNumber 
                ? { ...b, pocketed: true } 
                : b
            )
          );
          
          // Callback when a ball is pocketed
          if (props?.onBallPocketed && ballNumber > 0) {
            props.onBallPocketed(ballNumber);
          }
          
          // Ball pocketing logic
          handlePocketedBall(ballNumber);
        }
      }
    });
    
    // Inside the initPhysics function, modified update interval:
    const updateInterval = setInterval(() => {
      // Check if balls have stopped moving during shooting state
      if (gameState === 'shooting') {
        // Filter active balls (not pocketed)
        const activeBalls = ballBodiesRef.current.filter(ball => {
          return worldRef.current?.bodies.includes(ball);
        });
        
        // Check if all balls have stopped
        const allStopped = allBallsStopped(activeBalls);
        
        console.log("Checking if balls stopped:", { 
          allStopped, 
          ballCount: activeBalls.length,
          gameState 
        });
        
        // If all balls stopped, complete the shot
        if (allStopped) {
          console.log("All balls have stopped - completing shot");
          handleShotCompleted();
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
    }, 100); // Increased from 16ms to 100ms for better performance
    
    // Start the physics engine
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    runnerRef.current = runner;
    
    setGameState('waiting');
    setMessage("Your turn! Click and hold to power up the shot.");
    setGameInitialized(true);
    
    return () => {
      clearInterval(updateInterval);
      if (shotTimerRef.current) {
        clearTimeout(shotTimerRef.current);
      }
    };
  }, [gameState, handlePocketedBall, handleShotCompleted, props]);
  
  // Initialize game on component mount and when container size changes
  useEffect(() => {
    if (!gameInitialized) {
      initPhysics();
    }
    
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
      if (renderRef.current && renderRef.current.canvas) {
        Matter.Render.stop(renderRef.current);
        if (renderRef.current.canvas.parentNode) {
          renderRef.current.canvas.parentNode.removeChild(renderRef.current.canvas);
        }
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (shotTimerRef.current) {
        clearTimeout(shotTimerRef.current);
      }
    };
  }, [initPhysics, gameInitialized]);
  
  // Improved takeShot function for power issues
  const takeShot = useCallback((english: { x: number, y: number } = { x: 0, y: 0 }) => {
    console.log("TAKING POWERFUL SHOT - Current power:", power);
    
    // Always reset powering up state immediately
    setIsPoweringUp(false);
    setShowTrajectory(false);
    
    // Reset references
    initialMouseRef.current = null;
    currentMouseRef.current = null;
    
    // Force game state to shooting
    setGameState('shooting');
    
    // Create a function that will actually apply the shot with proper power
    const applyPowerfulShot = () => {
      // Find cue ball - must exist for a shot
      const cueBall = ballBodiesRef.current.find(ball => ball.label === 'ball-0');
      if (!cueBall) {
        console.error("NO CUE BALL FOUND FOR SHOT!");
        setGameState('waiting');
        return;
      }
      
      if (!worldRef.current) {
        console.error("NO WORLD FOUND FOR SHOT!");
        setGameState('waiting');
        return;
      }
      
      // CRITICAL FIX: Store the original power BEFORE resetting it
      const shotPower = power;
      
      // Amplify the power for more visible movement - this is critical!
      const amplifiedPower = Math.max(shotPower * 2, 40);
      
      console.log(`Taking shot with original power=${shotPower}, amplified power=${amplifiedPower}`);
      
      // Apply the shot with AMPLIFIED power
      simulateCueStrike(cueBall, aimAngle, amplifiedPower, english);
      
      // Update message
      setMessage(`Shot taken with ${shotPower}% power!`);
      
      // Reset power AFTER applying the shot
      setPower(0);
      
      // Clear trajectory
      setTrajectoryPoints([]);
      
      // Call event handlers
      if (props?.onShotTaken) {
        props.onShotTaken();
      }
      
      // Save if authenticated
      if (isAuthenticated && user) {
        saveShot(false);
      }
      
      // Backup timer to reset game state if physics detection fails
      if (shotTimerRef.current) {
        clearTimeout(shotTimerRef.current);
      }
      
      shotTimerRef.current = setTimeout(() => {
        if (gameState === 'shooting') {
          console.log("Shot timer expired - forcing completion");
          handleShotCompleted();
        }
      }, 5000); // 5 seconds max shot duration
    };
    
    // Run the shot application immediately to ensure power is captured
    applyPowerfulShot();
  }, [aimAngle, gameState, handleShotCompleted, isAuthenticated, power, props, user]);
  
  // Power up the shot
  const startPoweringUp = useCallback((x: number, y: number, english: { x: number, y: number } = { x: 0, y: 0 }) => {
    if (gameState !== 'waiting' || playerTurn !== 'player') return null;
    
    setGameState('aiming');
    setIsPoweringUp(true);
    setPower(0);
    
    // Get position of cue ball
    const cueBall = balls.find(ball => ball.number === 0 && !ball.pocketed);
    if (!cueBall) return null;
    
    // Calculate angle from cue ball to mouse point
    const dx = cueBall.position.x - x;
    const dy = cueBall.position.y - y;
    const angle = Math.atan2(dy, dx);
    
    setAimAngle(angle);
    initialMouseRef.current = { x, y };
    currentMouseRef.current = { x, y };
    setShowTrajectory(true);
    
    // Update trajectory
    updateTrajectory(cueBall.position.x, cueBall.position.y, x, y);
    
    // Start power increase interval
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
  }, [balls, gameState, playerTurn]);
  
  // Update the trajectory line based on aim
  const updateTrajectory = useCallback((startX: number, startY: number, targetX: number, targetY: number) => {
    // Find the cue ball
    const cueBall = ballBodiesRef.current.find(ball => ball.label === 'ball-0');
    if (!cueBall || !engineRef.current) return;
    
    // Calculate the angle from direction
    const dx = startX - targetX;
    const dy = startY - targetY;
    const angle = Math.atan2(dy, dx);
    
    // Get the trajectory points
    const points = [
      { x: cueBall.position.x, y: cueBall.position.y }
    ];
    
    // Calculate the endpoint along the angle
    const distance = 1000; // Long enough to extend beyond table
    const endPoint = {
      x: cueBall.position.x + Math.cos(angle) * distance,
      y: cueBall.position.y + Math.sin(angle) * distance
    };
    
    points.push(endPoint);
    
    // Find the first ball that would be hit
    const otherBalls = ballBodiesRef.current.filter(b => b.label !== 'ball-0');
    const targetBall = findFirstCollisionBall(cueBall, otherBalls, angle);
    
    if (targetBall) {
      // Calculate the point of collision
      const targetCenterToCue = {
        x: cueBall.position.x - targetBall.position.x,
        y: cueBall.position.y - targetBall.position.y
      };
      
      const dist = Math.sqrt(targetCenterToCue.x * targetCenterToCue.x + targetCenterToCue.y * targetCenterToCue.y);
      
      // Normalize direction
      const nx = targetCenterToCue.x / dist;
      const ny = targetCenterToCue.y / dist;
      
      // Calculate collision point
      const collisionPoint = {
        x: targetBall.position.x + nx * BALL_RADIUS * 2,
        y: targetBall.position.y + ny * BALL_RADIUS * 2
      };
      
      // Replace the second point with the collision point
      points[1] = collisionPoint;
      
      // Add a third point to show post-collision trajectory (simplified)
      // In a real physics sim, this would depend on angles and spin
      const postCollisionDist = 500;
      const postCollisionAngle = Math.atan2(
        targetBall.position.y - collisionPoint.y,
        targetBall.position.x - collisionPoint.x
      );
      
      const postCollisionPoint = {
        x: targetBall.position.x + Math.cos(postCollisionAngle) * postCollisionDist,
        y: targetBall.position.y + Math.sin(postCollisionAngle) * postCollisionDist
      };
      
      points.push(postCollisionPoint);
    }
    
    setTrajectoryPoints(points);
  }, []);
  
  // Handle mouse movement for aiming
  const handleMouseMove = useCallback((x: number, y: number, fineControl: boolean = false) => {
    if (gameState !== 'aiming' || !initialMouseRef.current) return;
    
    // Calculate the adjustment factor for fine control
    const adjustmentFactor = fineControl ? 0.3 : 1.0;
    
    // Calculate the new aim position with the adjustment
    const adjustedX = initialMouseRef.current.x - (initialMouseRef.current.x - x) * adjustmentFactor;
    const adjustedY = initialMouseRef.current.y - (initialMouseRef.current.y - y) * adjustmentFactor;
    
    currentMouseRef.current = { x: adjustedX, y: adjustedY };
    
    // Calculate angle for rendering cue stick
    const cueBall = balls.find(b => b.number === 0 && !b.pocketed);
    if (!cueBall) return;
    
    const dx = cueBall.position.x - adjustedX;
    const dy = cueBall.position.y - adjustedY;
    const angle = Math.atan2(dy, dx);
    
    setAimAngle(angle);
    
    // Update trajectory
    if (cueBall) {
      updateTrajectory(cueBall.position.x, cueBall.position.y, adjustedX, adjustedY);
    }
  }, [balls, gameState, updateTrajectory]);
  
  // Reset the game
  const resetGame = useCallback(() => {
    initPhysics();
  }, [initPhysics]);
  
  // Check game state
  useEffect(() => {
    const checkGameState = () => {
      // Only check in actual game mode (not practice)
      if (isPracticeMode || playerType === null) return;
      
      const solidsRemaining = balls.filter(b => b.number > 0 && b.number < 8 && !b.pocketed).length;
      const stripesRemaining = balls.filter(b => b.number > 8 && !b.pocketed).length;
      
      // Update 8-ball pocketable state
      if ((playerType === BallType.SOLID && solidsRemaining === 0) || 
          (playerType === BallType.STRIPE && stripesRemaining === 0)) {
        setEightBallPocketable(true);
        setMessage("You've pocketed all your balls! Now sink the 8-ball to win.");
      } else {
        setEightBallPocketable(false);
      }
    };
    
    checkGameState();
  }, [balls, isPracticeMode, playerType]);
  
  // Interface for controlling the game
  return {
    balls,
    power,
    isPoweringUp,
    setIsPoweringUp,
    gameState,
    message,
    aimAngle,
    trajectoryPoints,
    containerRef,
    canvasRef,
    startPoweringUp,
    takeShot,
    handleMouseMove,
    showTrajectory,
    playerType,
    playerTurn,
    resetGame,
    eightBallPocketable,
    isBreakShot
  };
};
