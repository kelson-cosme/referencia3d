/* eslint-disable react/no-unknown-property */
import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame, type ThreeEvent } from '@react-three/fiber';
import { shaderMaterial, useTrailTexture, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';

// --- Filtros ---
interface GooeyFilterProps {
  id?: string;
  strength?: number;
}

const GooeyFilter: React.FC<GooeyFilterProps> = ({ id = 'goo-filter', strength = 10 }) => {
  return (
    <svg className="absolute overflow-hidden z-1" style={{ width: 0, height: 0 }}>
      <defs>
        <filter id={id}>
          <feGaussianBlur in="SourceGraphic" stdDeviation={strength} result="blur" />
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
};

// --- Shader ---
const DotMaterial = shaderMaterial(
  {
    resolution: new THREE.Vector2(),
    imageResolution: new THREE.Vector2(),
    mouseTrail: new THREE.Texture(),
    imageTexture: new THREE.Texture(),
  },
  /* Vertex */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  /* Fragment */ `
    uniform vec2 resolution;
    uniform vec2 imageResolution;
    uniform sampler2D mouseTrail;
    uniform sampler2D imageTexture; 
    varying vec2 vUv;

    vec2 getCoverUv(vec2 uv, vec2 resolution, vec2 texResolution) {
      vec2 s = resolution; 
      vec2 i = texResolution; 
      float rs = s.x / s.y;
      float ri = i.x / i.y;
      vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
      vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
      return uv * s / new + offset;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution;
      float trail = texture2D(mouseTrail, uv).r;
      vec2 coverUv = getCoverUv(uv, resolution, imageResolution);
      vec4 imgColor = texture2D(imageTexture, coverUv);
      float alpha = trail * imgColor.a;
      gl_FragColor = vec4(imgColor.rgb, alpha);
    }
  `
);

extend({ DotMaterial });

// --- Cena com Animação Automática ---
interface SceneProps {
  trailSize: number;
  maxAge: number;
  interpolate: number;
  easingFunction: (x: number) => number;
  imageSrc: string;
}

function Scene({ trailSize, maxAge, interpolate, easingFunction, imageSrc }: SceneProps) {
  const { size, viewport } = useThree();
  const materialRef = useRef<any>(null);
  
  // Refs para controlar inatividade
  const lastInteraction = useRef(Date.now());
  const isAutoMoving = useRef(false);

  const imageTexture = useTexture(imageSrc);
  imageTexture.colorSpace = THREE.SRGBColorSpace;

  const [trail, onMove] = useTrailTexture({
    size: 1024, 
    radius: trailSize,
    maxAge: maxAge,
    interpolate: interpolate || 0.1,
    ease: easingFunction || ((x: number) => x)
  }) as [THREE.Texture, (e: ThreeEvent<PointerEvent>) => void];

  useMemo(() => {
    if (trail) {
      trail.minFilter = THREE.LinearFilter;
      trail.magFilter = THREE.LinearFilter;
    }
  }, [trail]);

  // Listener Global para resetar o timer de inatividade
  useEffect(() => {
    const resetTimer = () => {
      lastInteraction.current = Date.now();
      isAutoMoving.current = false;
    };
    window.addEventListener('mousemove', resetTimer);
    return () => window.removeEventListener('mousemove', resetTimer);
  }, []);

  useFrame((state) => {
    // Atualizar uniformes
    if (materialRef.current) {
      materialRef.current.resolution.set(size.width * viewport.dpr, size.height * viewport.dpr);
      // Cast seguro para HTMLImageElement conforme corrigido anteriormente
      materialRef.current.imageResolution.set(
        (imageTexture.image as HTMLImageElement).width, 
        (imageTexture.image as HTMLImageElement).height
      );
    }

    // --- LÓGICA DE MOVIMENTO AUTOMÁTICO (ZIG ZAG) ---
    const now = Date.now();
    const idleTime = now - lastInteraction.current;

    // Se estiver inativo por mais de 2 segundos
    if (idleTime > 2000) {
      isAutoMoving.current = true;
      const t = state.clock.elapsedTime;

      const autoX = 0.5 + Math.sin(t * 1.5) * 0.4; 
      const autoY = 0.5 + Math.sin(t * 3.0) * 0.15;

      onMove({ uv: new THREE.Vector2(autoX, autoY) } as any);
    }
  });

  // CORREÇÃO AQUI: Removemos o cálculo de scale baseado em Math.max
  // E usamos geometryargs com viewport.width e viewport.height diretos
  return (
    <mesh onPointerMove={onMove}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <dotMaterial
        ref={materialRef}
        mouseTrail={trail}
        imageTexture={imageTexture}
        transparent
      />
    </mesh>
  );
}

// --- Componente Principal ---
interface PixelTrailProps {
  trailSize?: number;
  maxAge?: number;
  interpolate?: number;
  easingFunction?: (x: number) => number;
  canvasProps?: Partial<React.ComponentProps<typeof Canvas>>;
  glProps?: WebGLContextAttributes & { powerPreference?: string };
  gooeyFilter?: { id: string; strength: number };
  className?: string;
  imageSrc: string; 
}

export default function PixelTrail({
  trailSize = 0.1,
  maxAge = 250,
  interpolate = 5,
  easingFunction = (x: number) => x,
  canvasProps = {},
  glProps = {
    antialias: true,
    powerPreference: 'high-performance',
    alpha: true
  },
  gooeyFilter,
  imageSrc,
  className = ''
}: PixelTrailProps) {
  return (
    <>
      {gooeyFilter && <GooeyFilter id={gooeyFilter.id} strength={gooeyFilter.strength} />}
      <Canvas
        {...canvasProps}
        gl={glProps}
        className={`absolute inset-0 w-full h-full ${className}`}
        style={gooeyFilter ? { filter: `url(#${gooeyFilter.id})` } : undefined}
      >
        <Scene
          trailSize={trailSize}
          maxAge={maxAge}
          interpolate={interpolate}
          easingFunction={easingFunction}
          imageSrc={imageSrc}
        />
      </Canvas>
    </>
  );
}