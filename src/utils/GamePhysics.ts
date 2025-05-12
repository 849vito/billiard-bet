import Matter from 'matter-js';

// Constants for physics engine
export const BALL_RADIUS = 15;
export const TABLE_WIDTH = 850;
export const TABLE_HEIGHT = 450;
export const POCKET_RADIUS = 22;
export const CUSHION_THICKNESS = 30;
export const FRICTION = 0.005;
export const RESTITUTION = 0.7;

// Ball types
export enum BallType {
  CUE = 0,
  SOLID = 1,
  STRIPE = 2,
  EIGHT = 8
}

// Ball colors
export const BALL_COLORS = {
  0: 'white', // Cue ball
  1: 'gold',
  2: 'blue',
  3: 'red',
  4: 'purple',
  5: 'orange',
  6: 'green',
  7: 'brown',
  8: 'black', // Eight ball
  9: 'gold',
  10: 'blue',
  11: 'red',
  12: 'purple',
  13: 'orange',
  14: 'green',
  15: 'brown'
};

// Modified setupTable function with more aggressive physics settings
export const setupTable = () => {
  // Initialize Matter.js modules
  const Engine = Matter.Engine;
  const World = Matter.World;
  const Bodies = Matter.Bodies;
  
  // Create engine with aggressive settings for billiards
  const engine = Engine.create({
    enableSleeping: false, // CRUCIAL: Never allow balls to sleep
    positionIterations: 12, // Increase position iterations for better accuracy
    velocityIterations: 8,  // Increase velocity iterations for better accuracy
    timing: { 
      timeScale: 1.2,        // Slightly faster simulation
      delta: 1000/120,       // Higher framerate for physics
      correction: 1          // Full correction
    },
    constraintIterations: 4  // More constraint iterations for better contact resolution
  });
  
  // Zero gravity is essential for billiards
  engine.gravity.scale = 0;
  engine.gravity.x = 0;
  engine.gravity.y = 0;
  
  // Create table boundaries (cushions)
  const cushions = [
    // Top left cushion
    Bodies.rectangle(
      TABLE_WIDTH * 0.25, 
      CUSHION_THICKNESS / 2, 
      TABLE_WIDTH * 0.5 - POCKET_RADIUS * 2, 
      CUSHION_THICKNESS, 
      { isStatic: true, restitution: RESTITUTION, friction: FRICTION, chamfer: { radius: 5 } }
    ),
    // Top right cushion
    Bodies.rectangle(
      TABLE_WIDTH * 0.75, 
      CUSHION_THICKNESS / 2, 
      TABLE_WIDTH * 0.5 - POCKET_RADIUS * 2, 
      CUSHION_THICKNESS, 
      { isStatic: true, restitution: RESTITUTION, friction: FRICTION, chamfer: { radius: 5 } }
    ),
    // Bottom left cushion
    Bodies.rectangle(
      TABLE_WIDTH * 0.25, 
      TABLE_HEIGHT - CUSHION_THICKNESS / 2, 
      TABLE_WIDTH * 0.5 - POCKET_RADIUS * 2, 
      CUSHION_THICKNESS, 
      { isStatic: true, restitution: RESTITUTION, friction: FRICTION, chamfer: { radius: 5 } }
    ),
    // Bottom right cushion
    Bodies.rectangle(
      TABLE_WIDTH * 0.75, 
      TABLE_HEIGHT - CUSHION_THICKNESS / 2, 
      TABLE_WIDTH * 0.5 - POCKET_RADIUS * 2, 
      CUSHION_THICKNESS, 
      { isStatic: true, restitution: RESTITUTION, friction: FRICTION, chamfer: { radius: 5 } }
    ),
    // Left cushion
    Bodies.rectangle(
      CUSHION_THICKNESS / 2, 
      TABLE_HEIGHT * 0.5, 
      CUSHION_THICKNESS, 
      TABLE_HEIGHT - POCKET_RADIUS * 4, 
      { isStatic: true, restitution: RESTITUTION, friction: FRICTION, chamfer: { radius: 5 } }
    ),
    // Right cushion
    Bodies.rectangle(
      TABLE_WIDTH - CUSHION_THICKNESS / 2, 
      TABLE_HEIGHT * 0.5, 
      CUSHION_THICKNESS, 
      TABLE_HEIGHT - POCKET_RADIUS * 4, 
      { isStatic: true, restitution: RESTITUTION, friction: FRICTION, chamfer: { radius: 5 } }
    ),
  ];
  
  // Create pockets (sensors that detect when balls fall in)
  const pockets = [
    // Top left
    Bodies.circle(0, 0, POCKET_RADIUS, { 
      isStatic: true, 
      isSensor: true, 
      label: 'pocket-top-left' 
    }),
    // Top middle
    Bodies.circle(TABLE_WIDTH / 2, 0, POCKET_RADIUS, { 
      isStatic: true, 
      isSensor: true, 
      label: 'pocket-top-middle' 
    }),
    // Top right
    Bodies.circle(TABLE_WIDTH, 0, POCKET_RADIUS, { 
      isStatic: true, 
      isSensor: true, 
      label: 'pocket-top-right' 
    }),
    // Bottom left
    Bodies.circle(0, TABLE_HEIGHT, POCKET_RADIUS, { 
      isStatic: true, 
      isSensor: true, 
      label: 'pocket-bottom-left' 
    }),
    // Bottom middle
    Bodies.circle(TABLE_WIDTH / 2, TABLE_HEIGHT, POCKET_RADIUS, { 
      isStatic: true, 
      isSensor: true, 
      label: 'pocket-bottom-middle' 
    }),
    // Bottom right
    Bodies.circle(TABLE_WIDTH, TABLE_HEIGHT, POCKET_RADIUS, { 
      isStatic: true, 
      isSensor: true, 
      label: 'pocket-bottom-right' 
    }),
  ];

  // Add all bodies to world
  World.add(engine.world, [...cushions, ...pockets]);
  
  return { engine, world: engine.world, cushions, pockets };
};

// Function for perfect triangular rack formation
const createRackFormation = (startX: number, startY: number) => {
  const positions = [];
  const spacing = BALL_RADIUS * 2.1; // Slightly larger than diameter for proper spacing
  const rows = 5;
  
  // Ball placement order for 8-ball (4 alternating stripes/solids, 8-ball in center, rest alternating)
  const ballOrder = [1, 9, 2, 10, 8, 11, 3, 13, 4, 15, 5, 14, 6, 12, 7];
  let ballIndex = 0;
  
  for (let row = 0; row < rows; row++) {
    for (let pos = 0; pos <= row; pos++) {
      const x = startX + row * spacing * Math.cos(Math.PI / 6);
      const y = startY + (pos - row / 2) * spacing;
      
      if (ballIndex < ballOrder.length) {
        positions.push({
          number: ballOrder[ballIndex],
          x,
          y
        });
        ballIndex++;
      }
    }
  }
  
  return positions;
};

// Modified createBalls function with better physics properties
export const createBalls = () => {
  const balls = [];
  const Bodies = Matter.Bodies;

  // Create cue ball with enhanced physics properties
  const cueBall = Bodies.circle(
    TABLE_WIDTH * 0.25, // Position on the left side of the table
    TABLE_HEIGHT / 2,
    BALL_RADIUS,
    {
      restitution: 0.8,     // More bounce
      friction: 0.1,        // Less friction for better rolling
      frictionAir: 0.002,   // Much less air friction
      density: 0.5,         // Lower density for better momentum transfer
      frictionStatic: 0.1,  // Lower static friction
      label: 'ball-0',
      render: { fillStyle: BALL_COLORS[0] },
      collisionFilter: {    // Ensure it can collide with everything
        group: 0,
        category: 0xFFFF,
        mask: 0xFFFF
      }
    }
  );
  
  // Set initial velocity to zero explicitly
  Matter.Body.setVelocity(cueBall, { x: 0, y: 0 });
  Matter.Body.setAngularVelocity(cueBall, 0);
  
  balls.push(cueBall);
  
  // Create rack formation for the other 15 balls
  // Starting position for the rack
  const rackX = TABLE_WIDTH * 0.75;
  const rackY = TABLE_HEIGHT / 2;
  
  // Get optimal rack positions
  const rackPositions = createRackFormation(rackX, rackY);
  
  // Create balls in rack formation with improved physics properties
  rackPositions.forEach(position => {
    const ball = Bodies.circle(
      position.x,
      position.y,
      BALL_RADIUS,
      {
        restitution: 0.8,       // More bounce
        friction: 0.1,          // Less friction for better rolling
        frictionAir: 0.002,     // Much less air friction
        density: 0.5,           // Lower density for better momentum transfer
        frictionStatic: 0.1,    // Lower static friction
        label: `ball-${position.number}`,
        render: { fillStyle: BALL_COLORS[position.number] },
        collisionFilter: {      // Ensure it can collide with everything
          group: 0,
          category: 0xFFFF,
          mask: 0xFFFF
        }
      }
    );
    balls.push(ball);
  });
  
  return balls;
};

// Function to calculate shot power and direction
export const calculateShotVector = (
  startX: number, 
  startY: number, 
  endX: number, 
  endY: number, 
  power: number
): { x: number; y: number } => {
  // Calculate direction vector
  const dirX = startX - endX;
  const dirY = startY - endY;
  
  // Normalize vector
  const length = Math.sqrt(dirX * dirX + dirY * dirY);
  
  // Apply power (0-100) scaled to a reasonable force
  const scaledPower = power * 0.05;
  
  return {
    x: (dirX / length) * scaledPower,
    y: (dirY / length) * scaledPower
  };
};

// Function to check if all balls have stopped moving
export const allBallsStopped = (balls: Matter.Body[]): boolean => {
  // If no balls, consider them stopped
  if (balls.length === 0) return true;
  
  // Check each ball's velocity
  return balls.every(ball => {
    const velocity = ball.velocity;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    // Use a higher threshold (1.0 instead of 0.1) to consider balls stopped sooner
    return speed < 1.0;
  });
};

// Function to calculate ball statistics
export const calculateBallStats = (balls: Array<{number: number, pocketed: boolean}>) => {
  const solidsPocketed = balls.filter(b => b.number > 0 && b.number < 8 && b.pocketed).length;
  const stripesPocketed = balls.filter(b => b.number > 8 && b.pocketed).length;
  const solidsRemaining = 7 - solidsPocketed;
  const stripesRemaining = 7 - stripesPocketed;
  const eightBallPocketed = balls.find(b => b.number === 8)?.pocketed || false;
  
  return {
    solidsPocketed,
    stripesPocketed,
    solidsRemaining,
    stripesRemaining,
    eightBallPocketed
  };
};

// Function to create collision filtering for balls
export const setupCollisionFilter = () => {
  return {
    group: -1,
    category: 0x0002,
    mask: 0x0001
  };
};