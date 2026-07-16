import React, { useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';

interface CityNode {
  name: string;
  lat: number;
  lon: number;
  color: string;
  pulseSize: number;
  pulseSpeed: number;
  active: boolean;
}

interface CyberGlobeProps {
  activeLoginEvent?: {
    fromCity: string;
    toCity?: string;
    isThreat: boolean;
  } | null;
}

const CITIES: Record<string, { lat: number; lon: number }> = {
  "Chennai, India": { lat: 13.0827, lon: 80.2707 },
  "Mumbai, India": { lat: 19.0760, lon: 72.8777 },
  "London, UK": { lat: 51.5074, lon: -0.1278 },
  "Moscow, Russia": { lat: 55.7558, lon: 37.6173 },
  "Beijing, China": { lat: 39.9042, lon: 116.4074 },
  "New York, USA": { lat: 40.7128, lon: -74.0060 }
};

export const CyberGlobe: React.FC<CyberGlobeProps> = ({ activeLoginEvent }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = 400;
    let height = canvas.height = 400;

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = rect.width * window.devicePixelRatio;
      height = canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    // Initial size configuration
    width = canvas.width = 450;
    height = canvas.height = 450;

    // Rotation angles
    let rotationY = 0;
    let rotationX = 0.2; // Slight tilt

    // Generate grid dots on sphere
    const dots: { x: number; y: number; z: number }[] = [];
    const DOTS_COUNT = 300;
    const radius = 140;

    // Fibonacci sphere distribution for uniform grid distribution
    for (let i = 0; i < DOTS_COUNT; i++) {
      const y = 1 - (i / (DOTS_COUNT - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y); // radius at y

      const goldenRatio = Math.PI * (3 - Math.sqrt(5));
      const theta = goldenRatio * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      dots.push({
        x: x * radius,
        y: y * radius,
        z: z * radius
      });
    }

    // Convert Lat/Lon to Cartesian 3D coordinates on sphere
    const latLonToVector3 = (lat: number, lon: number, r: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      return {
        x: -(r * Math.sin(phi) * Math.sin(theta)),
        y: r * Math.cos(phi),
        z: r * Math.sin(phi) * Math.cos(theta)
      };
    };

    // Active travel pulse animation variables
    let travelProgress = 0;
    let travelActive = false;
    let travelSource = { x: 0, y: 0, z: 0 };
    let travelDest = { x: 0, y: 0, z: 0 };
    let travelColor = '#ff0055';

    // Renders the animation loop
    const render = () => {
      // Clear Canvas with alpha for trace trails
      ctx.fillStyle = '#05080e';
      ctx.fillRect(0, 0, width, height);

      // Draw glowing background halo behind globe
      const haloGradient = ctx.createRadialGradient(
        width / 2, height / 2, radius * 0.8,
        width / 2, height / 2, radius * 1.3
      );
      haloGradient.addColorStop(0, 'rgba(161, 44, 255, 0.05)');
      haloGradient.addColorStop(0.5, 'rgba(0, 243, 255, 0.03)');
      haloGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = haloGradient;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Spin the globe slowly
      rotationY += 0.005;

      // Project and draw grid dots
      dots.forEach(dot => {
        // Rotate around Y-axis
        let x1 = dot.x * Math.cos(rotationY) - dot.z * Math.sin(rotationY);
        let z1 = dot.z * Math.cos(rotationY) + dot.x * Math.sin(rotationY);

        // Rotate around X-axis (tilt)
        let y2 = dot.y * Math.cos(rotationX) - z1 * Math.sin(rotationX);
        let z2 = z1 * Math.cos(rotationX) + dot.y * Math.sin(rotationX);

        // Map to 2D canvas coordinates (Perspective projection)
        const perspective = 350 / (350 + z2);
        const screenX = width / 2 + x1 * perspective;
        const screenY = height / 2 + y2 * perspective;

        // Depth sorting shader: dim and shrink points in background
        const alpha = Math.max(0.08, (z2 + radius) / (2 * radius)); // 0 to 1
        const size = Math.max(0.5, perspective * 1.5);

        ctx.fillStyle = z2 < 0 ? `rgba(0, 243, 255, ${alpha * 0.5})` : `rgba(161, 44, 255, ${alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw City Pins
      const projectedCities: Record<string, { x: number; y: number; z: number; name: string; color: string }> = {};

      Object.entries(CITIES).forEach(([cityName, coords]) => {
        const v = latLonToVector3(coords.lat, coords.lon, radius);

        // Rotate around Y
        let x1 = v.x * Math.cos(rotationY) - v.z * Math.sin(rotationY);
        let z1 = v.z * Math.cos(rotationY) + v.x * Math.sin(rotationY);

        // Rotate around X
        let y2 = v.y * Math.cos(rotationX) - z1 * Math.sin(rotationX);
        let z2 = z1 * Math.cos(rotationX) + v.y * Math.sin(rotationX);

        const perspective = 350 / (350 + z2);
        const screenX = width / 2 + x1 * perspective;
        const screenY = height / 2 + y2 * perspective;

        const isFront = z2 > -10;
        const alpha = isFront ? 1.0 : 0.25;

        // Establish pins color (Highlight alert cities)
        let pinColor = 'rgba(0, 243, 255, ' + alpha + ')'; // Cyan default
        let isIncidentNode = false;

        if (activeLoginEvent) {
          if (cityName === activeLoginEvent.fromCity || cityName === activeLoginEvent.toCity) {
            pinColor = activeLoginEvent.isThreat 
              ? `rgba(255, 0, 85, ${alpha})` 
              : `rgba(57, 255, 20, ${alpha})`;
            isIncidentNode = true;
          }
        }

        projectedCities[cityName] = { x: screenX, y: screenY, z: z2, name: cityName, color: pinColor };

        // Render point
        if (isFront) {
          // Glow pulse ring
          const time = Date.now() * 0.005;
          const pulseRadius = 4 + (isIncidentNode ? Math.sin(time * 2) * 5 + 6 : Math.sin(time) * 3 + 3);
          ctx.strokeStyle = pinColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(screenX, screenY, pulseRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Main dot
          ctx.fillStyle = pinColor;
          ctx.beginPath();
          ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
          ctx.fill();

          // Label
          ctx.fillStyle = 'rgba(226, 241, 255, 0.7)';
          ctx.font = '10px monospace';
          ctx.fillText(cityName.split(',')[0], screenX + 8, screenY + 3);
        } else {
          // Background dim dot
          ctx.fillStyle = `rgba(180, 180, 180, 0.15)`;
          ctx.beginPath();
          ctx.arc(screenX, screenY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Handle Impossible Travel animation link arc and moving pulse
      if (activeLoginEvent && activeLoginEvent.toCity) {
        const sourceNode = projectedCities[activeLoginEvent.fromCity];
        const destNode = projectedCities[activeLoginEvent.toCity];

        if (sourceNode && destNode) {
          const bothInFront = sourceNode.z > -40 && destNode.z > -40;

          if (bothInFront) {
            // Draw connection Bezier curve
            ctx.beginPath();
            ctx.moveTo(sourceNode.x, sourceNode.y);

            // Compute midpoint arc control point
            const midX = (sourceNode.x + destNode.x) / 2;
            const midY = (sourceNode.y + destNode.y) / 2 - 40; // Arc offset

            ctx.quadraticCurveTo(midX, midY, destNode.x, destNode.y);
            ctx.strokeStyle = activeLoginEvent.isThreat ? 'rgba(255, 0, 85, 0.6)' : 'rgba(57, 255, 20, 0.6)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Traveling signal pulse animation along curve
            travelProgress += 0.015;
            if (travelProgress > 1) travelProgress = 0;

            // Interpolate coordinates along Bezier curve
            // B(t) = (1-t)^2 * P0 + 2*(1-t)*t * P1 + t^2 * P2
            const t = travelProgress;
            const mt = 1 - t;
            const pulseX = mt * mt * sourceNode.x + 2 * mt * t * midX + t * t * destNode.x;
            const pulseY = mt * mt * sourceNode.y + 2 * mt * t * midY + t * t * destNode.y;

            // Draw glowing travel pulse
            const pulseGrad = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 6);
            pulseGrad.addColorStop(0, '#ffffff');
            pulseGrad.addColorStop(0.5, activeLoginEvent.isThreat ? '#ff0055' : '#39ff14');
            pulseGrad.addColorStop(1, 'transparent');

            ctx.fillStyle = pulseGrad;
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [activeLoginEvent]);

  return (
    <div className="cyber-panel flex flex-col items-center justify-center p-4 min-h-[350px]">
      <div className="cyber-panel-header w-full">
        <div className="cyber-panel-title">
          <Globe className="text-glow-cyan animate-spin-slow" />
          Access Telemetry Global Map
        </div>
        <span className="cyber-badge text-neon-cyan border-neon-cyan font-mono text-[9px] pulse-slow">
          Live feed tracking
        </span>
      </div>

      <div className="relative w-full flex justify-center items-center">
        <canvas 
          ref={canvasRef} 
          style={{ width: '100%', maxWidth: '350px', height: 'auto', aspectRatio: '1/1' }}
          className="cursor-pointer"
        />
        
        {/* Globe UI Details Overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] font-mono text-text-muted bg-bg-primary/70 p-2 rounded border border-border-glow/50">
          <div>LATENCY: <span className="text-neon-cyan">2.4ms</span></div>
          <div>CYBER_SPHERE: <span className="text-neon-purple">READY</span></div>
          <div>IPS TRACKED: <span className="text-neon-green">ACTIVE</span></div>
        </div>
      </div>
    </div>
  );
};
