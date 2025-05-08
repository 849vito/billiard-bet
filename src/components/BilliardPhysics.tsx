
import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

const BilliardPhysics = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef(Matter.Engine.create());

  useEffect(() => {
    if (!sceneRef.current) return;
    
    const engine = engineRef.current;
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: 'transparent'
      }
    });

    // Mondo fisico
    const { World, Bodies, Body, Mouse, MouseConstraint, Events } = Matter;

    // Bordo tavolo
    const wallOptions = { isStatic: true, render: { visible: false } };
    const walls = [
      Bodies.rectangle(400, 0, 800, 20, wallOptions), // cima
      Bodies.rectangle(400, 600, 800, 20, wallOptions), // fondo
      Bodies.rectangle(0, 300, 20, 600, wallOptions), // sinistra
      Bodies.rectangle(800, 300, 20, 600, wallOptions), // destra
    ];

    // Palle classiche da biliardo (1-15)
    const balls = [];
    for (let i = 0; i < 15; i++) {
      const ballType = i === 0 ? 'cue' : (i < 8 ? 'solid' : 'striped');
      const ball = Bodies.circle(400 + (i % 5) * 22, 300 + Math.floor(i / 5) * 22, 10, {
        restitution: 0.9,
        friction: 0.01,
        density: 0.04,
        label: `ball-${i + 1}`,
        render: { fillStyle: ballType === 'cue' ? '#ffffff' : ballType === 'solid' ? '#ff0000' : '#0000ff' }
      });
      balls.push(ball);
    }

    // Palla bianca (cue ball)
    const cueBall = balls[0]; // Palla bianca
    cueBall.label = 'cueBall';
    Body.setPosition(cueBall, { x: 200, y: 300 }); // Set the cue ball position to the left side

    // Buche (zone nei bordi del tavolo)
    const pockets = [
      { x: 40, y: 40 },
      { x: 760, y: 40 },
      { x: 40, y: 560 },
      { x: 760, y: 560 },
      { x: 400, y: 40 },
      { x: 400, y: 560 }
    ];

    // Mouse Constraint per la stecca
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });

    World.add(engine.world, [...walls, ...balls, mouseConstraint]);
    Matter.Render.run(render);
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Gestione della stecca (click-drag-release = colpo)
    let dragStart: { x: number, y: number } | null = null;
    Events.on(mouseConstraint, 'startdrag', (e: Matter.IEvent<Matter.MouseConstraint>) => {
      const mouseEvent = e as unknown as { body: Matter.Body, mouse: { position: { x: number, y: number } } };
      if (mouseEvent.body && mouseEvent.body.label === 'cueBall') {
        dragStart = { x: mouseEvent.mouse.position.x, y: mouseEvent.mouse.position.y };
      }
    });

    Events.on(mouseConstraint, 'enddrag', (e: Matter.IEvent<Matter.MouseConstraint>) => {
      const mouseEvent = e as unknown as { body: Matter.Body, mouse: { position: { x: number, y: number } } };
      if (dragStart && mouseEvent.body && mouseEvent.body.label === 'cueBall') {
        const dx = dragStart.x - mouseEvent.mouse.position.x;
        const dy = dragStart.y - mouseEvent.mouse.position.y;
        Body.setVelocity(cueBall, { x: dx * 0.3, y: dy * 0.3 });
        dragStart = null;
      }
    });

    // Rilevamento delle buche (rimossa la palla quando entra in una buca)
    const checkPockets = () => {
      const allBalls = [...balls];
      allBalls.forEach(ball => {
        pockets.forEach(pocket => {
          const distance = Math.sqrt(
            Math.pow(ball.position.x - pocket.x, 2) + Math.pow(ball.position.y - pocket.y, 2)
          );
          if (distance < 20) {
            // Se la palla entra in una buca, la rimuove dal gioco
            if (ball.label !== 'cueBall') {
              World.remove(engine.world, ball);
            }
            // Reset della palla bianca (cue ball)
            if (ball.label === 'cueBall') {
              Body.setPosition(cueBall, { x: 200, y: 300 });
              Body.setVelocity(cueBall, { x: 0, y: 0 });
            }
          }
        });
      });
    };

    // Chiamato ogni frame per controllare le buche
    const updateGame = () => {
      checkPockets();
    };

    // Aggiornamento a ogni ciclo di gioco
    const gameInterval = setInterval(updateGame, 100);

    // Better event handling for canvas
    render.canvas.addEventListener('mousemove', (event) => {
      Mouse.setOffset(mouse, {
        x: render.canvas.offsetLeft,
        y: render.canvas.offsetTop
      });
    });

    return () => {
      clearInterval(gameInterval);
      Matter.World.clear(engine.world);
      Matter.Engine.clear(engine);
      // Fix for Matter.Render.stop() - provide both render and timing arguments
      Matter.Render.stop(render);
      // Fix the canvas removal issue - check if parent exists before removing
      if (render.canvas.parentNode) {
        render.canvas.parentNode.removeChild(render.canvas);
      }
    };
  }, []);

  return (
    <div 
      ref={sceneRef} 
      className="billiard-table-container"
      style={{ 
        width: '800px', 
        height: '600px',
        margin: '0 auto',
        position: 'relative',
        background: 'radial-gradient(circle at center, #0691d9 0%, #054663 100%)',
        borderRadius: '8px',
        border: '16px solid #6b4226',
        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }} 
    >
      {/* Pockets */}
      <div style={{ position: 'absolute', top: '0', left: '0', width: '30px', height: '30px', borderRadius: '50%', background: 'black', transform: 'translate(-50%, -50%)' }}></div>
      <div style={{ position: 'absolute', top: '0', left: '50%', width: '30px', height: '30px', borderRadius: '50%', background: 'black', transform: 'translateX(-50%)' }}></div>
      <div style={{ position: 'absolute', top: '0', right: '0', width: '30px', height: '30px', borderRadius: '50%', background: 'black', transform: 'translate(50%, -50%)' }}></div>
      <div style={{ position: 'absolute', bottom: '0', left: '0', width: '30px', height: '30px', borderRadius: '50%', background: 'black', transform: 'translate(-50%, 50%)' }}></div>
      <div style={{ position: 'absolute', bottom: '0', left: '50%', width: '30px', height: '30px', borderRadius: '50%', background: 'black', transform: 'translateX(-50%)' }}></div>
      <div style={{ position: 'absolute', bottom: '0', right: '0', width: '30px', height: '30px', borderRadius: '50%', background: 'black', transform: 'translate(50%, 50%)' }}></div>
    </div>
  );
};

export default BilliardPhysics;
