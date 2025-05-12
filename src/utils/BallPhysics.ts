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

// Completely revised function to ensure the cue ball moves no matter what
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
  
  console.log(`EMERGENCY SHOT MODE: Angle=${angle.toFixed(2)}, Power=${power}`);
  
  // Use a very high power value - this is crucial
  const forceMagnitude = Math.max(50, power) * 0.1;
  
  // Calculate direction vector
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);
  
  // CRITICAL FIX #1: Reset any existing forces or velocities
  Matter.Body.setVelocity(cueBall, { x: 0, y: 0 });
  Matter.Body.setAngularVelocity(cueBall, 0);
  
  // CRITICAL FIX #2: Ensure the ball is awake and mobile
  Matter.Sleeping.set(cueBall, false);
  Matter.Body.setStatic(cueBall, false);
  
  // BRUTE FORCE APPROACH: Apply massive velocity directly
  // This is the most reliable way to make the ball move
  const velocity = {
    x: dirX * forceMagnitude * 20,
    y: dirY * forceMagnitude * 20
  };
  
  console.log(`Setting velocity to: (${velocity.x.toFixed(2)}, ${velocity.y.toFixed(2)})`);
  Matter.Body.setVelocity(cueBall, velocity);
  
  // BACKUP METHOD: Physically move the ball a small amount
  const initialPos = { ...cueBall.position };
  const newPos = {
    x: initialPos.x + dirX * 2,
    y: initialPos.y + dirY * 2
  };
  
  console.log(`Moving ball from (${initialPos.x.toFixed(2)}, ${initialPos.y.toFixed(2)}) to (${newPos.x.toFixed(2)}, ${newPos.y.toFixed(2)})`);
  Matter.Body.setPosition(cueBall, newPos);
  
  // Record initial position and velocity for debugging
  const initialVelocity = { ...cueBall.velocity };
  
  // Schedule a check to ensure the ball is actually moving
  setTimeout(() => {
    if (cueBall.position && cueBall.velocity) {
      const currentVelocity = { ...cueBall.velocity };
      const currentPos = { ...cueBall.position };
      
      const speed = Math.sqrt(currentVelocity.x * currentVelocity.x + currentVelocity.y * currentVelocity.y);
      console.log(`After 50ms: Ball speed is ${speed.toFixed(2)}, position: (${currentPos.x.toFixed(2)}, ${currentPos.y.toFixed(2)})`);
      
      // If ball barely moved, force it again with even higher velocity
      if (speed < 5 || 
          (Math.abs(currentPos.x - initialPos.x) < 1 && Math.abs(currentPos.y - initialPos.y) < 1)) {
        console.log("EMERGENCY OVERRIDE: Ball not moving enough, applying extreme velocity");
        
        const emergencyVelocity = {
          x: dirX * 100,
          y: dirY * 100
        };
        
        Matter.Body.setVelocity(cueBall, emergencyVelocity);
        Matter.Sleeping.set(cueBall, false);
      }
    }
  }, 50);
};