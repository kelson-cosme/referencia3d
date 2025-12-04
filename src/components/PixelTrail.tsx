/* eslint-disable react/no-unknown-property */
import React, { useMemo } from 'react';
import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber';
// ADICIONADO: useTexture para carregar a imagem
import { shaderMaterial, useTrailTexture, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';

// --- CONFIGURAÇÃO DOS FILTROS E SHADERS ---

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

// --- MUDANÇA PRINCIPAL AQUI NO SHADER ---
const DotMaterial = shaderMaterial(
  {
    resolution: new THREE.Vector2(),
    mouseTrail: new THREE.Texture(),
    // REMOVIDO: pixelColor
    // ADICIONADO: imageTexture para receber a imagem do capacete
    imageTexture: new THREE.Texture(), 
    gridSize: 100,
  },
  /* glsl vertex shader (Padrão) */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  /* glsl fragment shader (Alterado) */ `
    uniform vec2 resolution;
    uniform sampler2D mouseTrail;
    // ADICIONADO: uniform para a imagem
    uniform sampler2D imageTexture; 
    uniform float gridSize;
    varying vec2 vUv;

    vec2 coverUv(vec2 uv) {
      vec2 s = resolution.xy / max(resolution.x, resolution.y);
      vec2 newUv = (uv - 0.5) * s + 0.5;
      return clamp(newUv, 0.0, 1.0);
    }

    void main() {
      vec2 screenUv = gl_FragCoord.xy / resolution;
      vec2 uv = coverUv(screenUv);

      // Calcula o centro do "pixel" da grade
      vec2 gridUvCenter = (floor(uv * gridSize) + 0.5) / gridSize;

      // 1. Lê a intensidade do rastro do mouse (0.0 a 1.0)
      float trailValue = texture2D(mouseTrail, gridUvCenter).r;

      // 2. MUDANÇA: Lê a cor da IMAGEM na posição desse pixel, em vez de uma cor sólida
      vec4 imgColor = texture2D(imageTexture, gridUvCenter);

      // 3. Calcula a transparência final baseada no rastro E na transparência da própria imagem
      float finalAlpha = trailValue * imgColor.a;

      // Define a cor final do pixel usando a cor da imagem
      gl_FragColor = vec4(imgColor.rgb, finalAlpha);
    }
  `
);

extend({ DotMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      dotMaterial: any;
    }
  }
}

// --- CENA ---

interface SceneProps {
  gridSize: number;
  trailSize: number;
  maxAge: number;
  interpolate: number;
  easingFunction: (x: number) => number;
  imageSrc: string; // Nova prop obrigatória
}

function Scene({ gridSize, trailSize, maxAge, interpolate, easingFunction, imageSrc }: SceneProps) {
  const size = useThree(s => s.size);
  const viewport = useThree(s => s.viewport);

  // ADICIONADO: Carregar a textura da imagem passada via prop
  const imageTexture = useTexture(imageSrc);
  // Configurar espaço de cor para imagens visíveis
  imageTexture.colorSpace = THREE.SRGBColorSpace; 

  const [trail, onMove] = useTrailTexture({
    size: 512,
    radius: trailSize,
    maxAge: maxAge,
    interpolate: interpolate || 0.1,
    ease: easingFunction || ((x: number) => x)
  }) as [THREE.Texture, (e: ThreeEvent<PointerEvent>) => void];

  useMemo(() => {
    if (trail) {
      trail.minFilter = THREE.NearestFilter;
      trail.magFilter = THREE.NearestFilter;
      trail.wrapS = THREE.ClampToEdgeWrapping;
      trail.wrapT = THREE.ClampToEdgeWrapping;
    }
  }, [trail]);

  const scale = Math.max(viewport.width, viewport.height) / 2;

  return (
    <mesh scale={[scale, scale, 1]} onPointerMove={onMove}>
      <planeGeometry args={[2, 2]} />
      {/* Passamos a textura da imagem para o material */}
      <dotMaterial
        gridSize={gridSize}
        resolution={[size.width * viewport.dpr, size.height * viewport.dpr]}
        mouseTrail={trail}
        imageTexture={imageTexture}
        transparent
      />
    </mesh>
  );
}

// --- COMPONENTE PRINCIPAL ---

interface PixelTrailProps {
  gridSize?: number;
  trailSize?: number;
  maxAge?: number;
  interpolate?: number;
  easingFunction?: (x: number) => number;
  canvasProps?: Partial<React.ComponentProps<typeof Canvas>>;
  glProps?: WebGLContextAttributes & { powerPreference?: string };
  gooeyFilter?: { id: string; strength: number };
  className?: string;
  // ADICIONADO: imageSrc é agora obrigatório, removemos 'color'
  imageSrc: string; 
}

export default function PixelTrail({
  gridSize = 40,
  trailSize = 0.1,
  maxAge = 250,
  interpolate = 5,
  easingFunction = (x: number) => x,
  canvasProps = {},
  glProps = {
    antialias: false,
    powerPreference: 'high-performance',
    alpha: true
  },
  gooeyFilter,
  imageSrc, // Recebe a imagem
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
          gridSize={gridSize}
          trailSize={trailSize}
          maxAge={maxAge}
          interpolate={interpolate}
          easingFunction={easingFunction}
          imageSrc={imageSrc} // Passa para a cena
        />
      </Canvas>
    </>
  );
}