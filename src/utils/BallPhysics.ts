
import Matter from 'matter-js';
import { BallType, BALL_RADIUS } from './GamePhysics';

// Enhanced physics for ball spin and collision effects
export const applyEnglish = (
  ball: Matter.Body,
  angle: number,
  power: number,
  english: { x: number, y: number } // English applied (-1 to 1 for both x and y)
) => {
  // Calculate base force
  const force = {
    x: Math.cos(angle) * power,
    y: Math.sin(angle) * power
  };
  
  // Apply the force to the ball
  Matter.Body.applyForce(ball, ball.position, force);
  
  // Calculate spin based on english
  // This is simplified; real spin would affect trajectory over time
  const spin = {
    x: english.x * power * 0.02,
    y: english.y * power * 0.02
  };
  
  // Apply angular velocity for visual spin effect
  Matter.Body.setAngularVelocity(ball, (english.x + english.y) * 0.1);
  
  return { force, spin };
};

// Function to calculate ball reflection after collision
export const calculateReflection = (
  incidentVector: Matter.Vector,
  surfaceNormal: Matter.Vector
) => {
  // Calculate dot product
  const dot = incidentVector.x * surfaceNormal.x + incidentVector.y * surfaceNormal.y;
  
  // Calculate reflection vector
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
  // Clone the world to simulate without affecting the actual game
  const tempWorld = Matter.World.create({ 
    gravity: { x: 0, y: 0, scale: 0 } 
  });
  
  // Clone the cue ball for simulation
  const tempBall = Matter.Bodies.circle(
    cueBall.position.x, 
    cueBall.position.y, 
    BALL_RADIUS, 
    { restitution: 0.9, friction: 0.005 }
  );
  
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
    if (playerType && playerType !== BallType.CUE && playerType !== ballB.type) {
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
