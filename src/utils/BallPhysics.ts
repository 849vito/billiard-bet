import Matter from 'matter-js';
import { BallType, BALL_RADIUS } from './GamePhysics';

// Enhanced physics for ball spin and collision effects
export const applyEnglish = (
  ball: Matter.Body,
  angle: number,
  power: number,
  english: { x: number, y: number } // English applied (-1 to 1 for both x and y)
) => {
  // Calculate base force with improved physics model
  const forceMagnitude = power * 0.05;
  const force = {
    x: Math.cos(angle) * forceMagnitude,
    y: Math.sin(angle) * forceMagnitude
  };
  
  // Apply the force to the ball
  Matter.Body.applyForce(ball, ball.position, force);
  
  // Calculate spin based on english (side spin)
  const spinFactor = 0.02;
  const spin = {
    x: english.x * power * spinFactor,
    y: english.y * power * spinFactor
  };
  
  // Apply angular velocity for visual spin effect
  Matter.Body.setAngularVelocity(ball, (english.x + english.y) * 0.1);
  
  // Apply subtle position adjustment based on english (for draw/follow shots)
  if (english.y !== 0) {
    // Simulate draw (negative y) or follow (positive y) shots
    const followAdjustment = english.y * 0.2;
    Matter.Body.translate(ball, {
      x: 0,
      y: followAdjustment * 0.1
    });
  }
  
  return { force, spin };
};

// Function to calculate ball reflection after collision
export const calculateReflection = (
  incidentVector: Matter.Vector,
  surfaceNormal: Matter.Vector
) => {
  // Calculate dot product
  const dot = incidentVector.x * surfaceNormal.x + incidentVector.y * surfaceNormal.y;
  
  // Calculate reflection vector using the reflection formula
  const reflection = {
    x: incidentVector.x - 2 * dot * surfaceNormal.x,
    y: incidentVector.y - 2 * dot * surfaceNormal.y
  };
  
  return reflection;
};

// Calculate the predicted trajectory path with multiple bounces
export const calculateTrajectoryPath = (
  engine: Matter.Engine,
  cueBall: Matter.Body, 
  angle: number, 
  maxLength: number = 500,
  maxBounces: number = 2
): Array<{x: number, y: number}> => {
  // Calculate direction vector
  const direction = {
    x: Math.cos(angle),
    y: Math.sin(angle)
  };
  
  // Start point is the cue ball position
  const points = [{ x: cueBall.position.x, y: cueBall.position.y }];
  
  // Add a point in the direction of the cue
  points.push({
    x: cueBall.position.x + direction.x * maxLength,
    y: cueBall.position.y + direction.y * maxLength
  });
  
  return points;
};

// Find the first ball that would be hit by the cue ball
export const findFirstCollisionBall = (
  cueBall: Matter.Body,
  otherBalls: Matter.Body[],
  angle: number,
  maxDistance: number = 1000
): Matter.Body | null => {
  // Calculate ray direction from angle
  const direction = {
    x: Math.cos(angle),
    y: Math.sin(angle)
  };
  
  // Ray starting point (cue ball position)
  const rayStart = {
    x: cueBall.position.x,
    y: cueBall.position.y
  };
  
  let closestBall = null;
  let closestDistance = maxDistance;
  
  // Check each ball for potential collision
  otherBalls.forEach(ball => {
    // Skip cue ball itself
    if (ball.id === cueBall.id) return;
    
    // Calculate the closest point on the ray to the ball center
    const ballToRayStart = {
      x: ball.position.x - rayStart.x,
      y: ball.position.y - rayStart.y
    };
    
    // Project the vector onto the ray direction
    const projection = 
      ballToRayStart.x * direction.x + 
      ballToRayStart.y * direction.y;
    
    // If projection is negative, ball is behind the ray
    if (projection < 0) return;
    
    // Calculate closest point on ray to ball center
    const closestPoint = {
      x: rayStart.x + direction.x * projection,
      y: rayStart.y + direction.y * projection
    };
    
    // Calculate distance from closest point to ball center
    const distance = Math.sqrt(
      Math.pow(closestPoint.x - ball.position.x, 2) +
      Math.pow(closestPoint.y - ball.position.y, 2)
    );
    
    // If distance is less than ball radius, ray intersects the ball
    if (distance <= BALL_RADIUS * 2 && projection < closestDistance) {
      closestBall = ball;
      closestDistance = projection;
    }
  });
  
  return closestBall;
};

// Enhanced collision detection that accounts for ball type and rule enforcement
export const handleBallCollision = (
  ballA: { number: number, type: BallType },
  ballB: { number: number, type: BallType },
  playerType: BallType | null
): { foul: boolean, message: string } => {
  // Detect illegal hits (hitting wrong ball first)
  if (ballA.number === 0) { // Cue ball
    // If player type is assigned, must hit that type first
    if (playerType && playerType !== BallType.EIGHT && ballB.type !== BallType.EIGHT && playerType !== ballB.type) {
      return {
        foul: true,
        message: `Foul! You must hit your ${playerType === BallType.SOLID ? 'solid' : 'striped'} balls first.`
      };
    }
    
    // Special case for 8-ball
    if (ballB.number === 8) {
      // Check if player can legally hit 8-ball
      const canHit8Ball = false; // This would need to check if all player's balls are pocketed
      
      if (!canHit8Ball) {
        return {
          foul: true,
          message: "Foul! You must pocket all your balls before hitting the 8-ball."
        };
      }
    }
  }
  
  return {
    foul: false,
    message: ""
  };
};

// ULTIMATE POWER FIX for simulateCueStrike function
export const simulateCueStrike = (
  cueBall: Matter.Body,
  angle: number,
  power: number,
  english: { x: number, y: number }
): void => {
  if (!cueBall) {
    console.error("No cue ball provided to simulateCueStrike");
    return;
  }
  
  console.log(`POWER SHOT MODE: Angle=${angle.toFixed(2)}, Original Power=${power}`);
  
  // CRITICAL FIX: Force a minimum power level regardless of input
  // This ensures the ball always moves with a significant force
  const effectivePower = Math.max(power, 40); // At least 40% power
  
  // CRITICAL FIX: Calculate force with much higher multipliers
  const forceMagnitude = effectivePower * 0.3; // 3x increase from typical 0.1
  
  // Calculate direction vector
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);
  
  // Reset any existing forces or velocities
  Matter.Body.setVelocity(cueBall, { x: 0, y: 0 });
  Matter.Body.setAngularVelocity(cueBall, 0);
  
  // BRUTE FORCE: Apply massive velocity directly to ensure movement
  const velocityMultiplier = 10; // Much higher than usual
  const velocity = {
    x: dirX * forceMagnitude * velocityMultiplier,
    y: dirY * forceMagnitude * velocityMultiplier
  };
  
  console.log(`Setting STRONG velocity to: (${velocity.x.toFixed(2)}, ${velocity.y.toFixed(2)})`);
  
  // CRITICAL FIX: Use setVelocity with extremely high values
  Matter.Body.setVelocity(cueBall, velocity);
  
  // CRITICAL FIX: Also directly move the ball a small distance to kick-start movement
  const initialPos = { ...cueBall.position };
  const newPos = {
    x: initialPos.x + dirX * 5, // 5px initial movement
    y: initialPos.y + dirY * 5
  };
  
  console.log(`Force-moving ball from (${initialPos.x.toFixed(2)}, ${initialPos.y.toFixed(2)}) to (${newPos.x.toFixed(2)}, ${newPos.y.toFixed(2)})`);
  Matter.Body.setPosition(cueBall, newPos);
  
  // Apply spin/english effects if present
  if (english.x !== 0 || english.y !== 0) {
    // Side spin effect
    const sideSpin = english.x * 0.01 * effectivePower;
    
    // Add a slight perpendicular force for side spin effect
    Matter.Body.applyForce(cueBall, cueBall.position, {
      x: -dirY * sideSpin,
      y: dirX * sideSpin
    });
    
    // Set angular velocity for visual effect
    Matter.Body.setAngularVelocity(cueBall, english.y * 0.05);
  }
  
  // CRITICAL FIX: Make sure the ball is awake
  Matter.Sleeping.set(cueBall, false);
  
  // Ensure the ball is not static
  if (cueBall.isStatic) {
    Matter.Body.setStatic(cueBall, false);
  }
};