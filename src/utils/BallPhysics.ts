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
    const adjustedPosition = {
      x: ball.position.x,
      y: ball.position.y + followAdjustment
    };
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

// Improved function to simulate the physics of a cue stick striking the cue ball
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
  
  // Debug logs to track function execution
  console.log(`SHOOTING: simulateCueStrike called with angle=${angle.toFixed(2)}, power=${power}`);
  
  // Ensure we have some minimum power to prevent "no movement" bugs
  const minPower = 20; // Increased minimum power even more
  const adjustedPower = Math.max(power, minPower);
  
  // IMPORTANT: Force factor is now MUCH higher to ensure ball moves
  const forceFactor = Math.pow(adjustedPower / 100, 1.0) * 5.0; // Increased by 5x
  
  // Calculate force direction based on angle
  const forceDirection = {
    x: Math.cos(angle),
    y: Math.sin(angle)
  };
  
  console.log(`SHOOTING: Force direction (${forceDirection.x.toFixed(2)}, ${forceDirection.y.toFixed(2)}), magnitude=${forceFactor.toFixed(2)}`);
  
  // CRITICAL FIX: Use setPosition to bump the ball slightly in the direction of the shot
  // This ensures the ball starts moving even if physics engine is sleeping it
  const initialBump = 0.1; // Small bump to ensure physics engine recognizes movement
  Matter.Body.setPosition(cueBall, {
    x: cueBall.position.x + forceDirection.x * initialBump,
    y: cueBall.position.y + forceDirection.y * initialBump
  });
  
  // Apply main force to the cue ball with GREATLY increased magnitude
  const forcePoint = { 
    x: cueBall.position.x, 
    y: cueBall.position.y 
  };
  
  const force = {
    x: forceDirection.x * forceFactor,
    y: forceDirection.y * forceFactor
  };
  
  // Directly set velocity first - this is the most reliable way to ensure movement
  const velocityMultiplier = 500; // Massively increased velocity
  const velocity = {
    x: forceDirection.x * forceFactor * velocityMultiplier,
    y: forceDirection.y * forceFactor * velocityMultiplier
  };
  
  console.log(`SHOOTING: Setting velocity to (${velocity.x.toFixed(2)}, ${velocity.y.toFixed(2)})`);
  Matter.Body.setVelocity(cueBall, velocity);
  
  // THEN apply force - belt and suspenders approach
  console.log(`SHOOTING: Applying force (${force.x.toFixed(2)}, ${force.y.toFixed(2)}) at point (${forcePoint.x.toFixed(2)}, ${forcePoint.y.toFixed(2)})`);
  Matter.Body.applyForce(cueBall, forcePoint, force);
  
  // Third method - use setVelocity again after a short delay
  setTimeout(() => {
    if (cueBall && cueBall.position) {
      console.log(`SHOOTING: Checking velocity after 10ms: (${cueBall.velocity.x.toFixed(2)}, ${cueBall.velocity.y.toFixed(2)})`);
      
      // If velocity is very low, force it again
      if (Math.abs(cueBall.velocity.x) < 1 && Math.abs(cueBall.velocity.y) < 1) {
        console.log(`SHOOTING: Ball not moving, forcing velocity again`);
        Matter.Body.setVelocity(cueBall, velocity);
      }
    }
  }, 10);
  
  // Apply spin/english effects
  if (english.x !== 0 || english.y !== 0) {
    // Side spin (english.x) affects the ball's path slightly
    const sideSpin = english.x * 0.001 * adjustedPower;
    Matter.Body.applyForce(cueBall, cueBall.position, {
      x: -forceDirection.y * sideSpin,
      y: forceDirection.x * sideSpin
    });
    
    // Top/bottom spin (english.y) affects roll and eventual speed
    const topSpin = english.y * 0.01;
    Matter.Body.setAngularVelocity(cueBall, topSpin);
  }
  
  // Wake up the ball if it's sleeping (critical for Physics engines)
  Matter.Sleeping.set(cueBall, false);
  
  // Print ball properties to check for issues
  console.log(`SHOOTING: Cue ball properties after strike:
    position: (${cueBall.position.x.toFixed(2)}, ${cueBall.position.y.toFixed(2)})
    velocity: (${cueBall.velocity.x.toFixed(2)}, ${cueBall.velocity.y.toFixed(2)})
    speed: ${Math.sqrt(cueBall.velocity.x * cueBall.velocity.x + cueBall.velocity.y * cueBall.velocity.y).toFixed(2)}
    angle: ${Math.atan2(cueBall.velocity.y, cueBall.velocity.x).toFixed(2)}
    isStatic: ${cueBall.isStatic}
    isSleeping: ${cueBall.isSleeping}
  `);
};