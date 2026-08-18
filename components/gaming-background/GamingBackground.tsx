'use client';

import React, { useEffect, useRef } from 'react';

export default function GamingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let particles: Particle[] = [];
    const isMobile = window.innerWidth <= 768;
    const numParticles = isMobile 
      ? Math.min(25, Math.floor((width * height) / 40000)) 
      : Math.min(60, Math.floor((width * height) / 20000));
    
    let autoMouse = true;
    let time = 0;
    const mouse = { x: width / 2, y: height / 2 }; 
    
    const handleMouseMove = (e: MouseEvent) => {
      autoMouse = false;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      // Disabled on mobile for performance and standard scrolling experience
      if (window.innerWidth <= 768) return;
      autoMouse = false;
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };
    
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('resize', handleResize);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;
        this.color = `rgba(255, ${Math.floor(83 + Math.random() * 100)}, 3, ${Math.random() * 0.4 + 0.1})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Mouse interaction (parallax / push)
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          // smooth repulsion
          this.x -= dx * force * 0.03;
          this.y -= dy * force * 0.03;
        }

        // Bounce off edges (after interaction to prevent getting stuck out of bounds)
        if (this.x > width) { this.x = width; this.speedX *= -1; }
        else if (this.x < 0) { this.x = 0; this.speedX *= -1; }
        
        if (this.y > height) { this.y = height; this.speedY *= -1; }
        else if (this.y < 0) { this.y = 0; this.speedY *= -1; }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    }

    function connectParticles() {
      if (!ctx) return;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity = 1 - (distance / 120);
            ctx.strokeStyle = `rgba(255, 83, 3, ${opacity * 0.15})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    let animationFrameId: number;
    
    function animate() {
      if (!ctx) return;
      
      if (autoMouse) {
        time += 0.003;
        mouse.x = width / 2 + Math.cos(time) * (width / 3);
        mouse.y = height / 2 + Math.sin(time * 0.8) * (height / 3);
      }

      // Soft trail effect
      ctx.fillStyle = 'rgba(10, 10, 10, 0.2)'; // Dark bg with low opacity for trails
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      connectParticles();
      
      // Draw mouse glow — desktop only
      if (!isMobile && mouse.x > 0 && mouse.y > 0) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 150);
        gradient.addColorStop(0, 'rgba(255, 83, 3, 0.08)');
        gradient.addColorStop(1, 'rgba(255, 83, 3, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    initParticles();
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      id="gaming-bg"
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: '#0a0a0a', // var(--dark-bg)
      }}
    />
  );
}
