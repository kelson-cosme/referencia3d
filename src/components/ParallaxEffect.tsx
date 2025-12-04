import { useRef, useEffect, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { useTexture, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. Definição do Shader ---
const ParallaxMaterial = shaderMaterial(
  {
    uTexture: new THREE.Texture(),
    uDepthMap: new THREE.Texture(),
    uHelmet: new THREE.Texture(),
    uMouse: new THREE.Vector2(0, 0),
    uThreshold: new THREE.Vector2(0, 0),
    uResolution: new THREE.Vector2(1, 1),
    uImageResolution: new THREE.Vector2(1, 1),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform sampler2D uTexture;
    uniform sampler2D uDepthMap;
    uniform sampler2D uHelmet;
    uniform vec2 uMouse;
    uniform vec2 uThreshold;
    uniform vec2 uResolution;
    uniform vec2 uImageResolution;
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
      // Calcula UV para cobrir a tela (cover)
      vec2 uv = getCoverUv(vUv, uResolution, uImageResolution);

      // --- SEM ZOOM (Tamanho Original) ---
      
      // Ler Profundidade
      vec4 depthMap = texture2D(uDepthMap, uv);
      
      // Calcular Deslocamento
      vec2 displacement = uMouse * depthMap.r * uThreshold;
      vec2 displacedUv = uv + displacement;

      // --- TRAVAR BORDAS (Clamp) ---
      // Impede que a imagem repita ou mostre o fundo se sair do lugar
      displacedUv = clamp(displacedUv, 0.0, 1.0);

      // Ler texturas
      vec4 originalColor = texture2D(uTexture, displacedUv);
      vec4 helmetColor = texture2D(uHelmet, displacedUv);

      // Lógica do Holofote (Spotlight)
      vec2 mouseUv = uMouse * 0.5 + 0.5;
      float aspect = uResolution.x / uResolution.y;
      vec2 aspectCorrectedUv = vec2(vUv.x * aspect, vUv.y);
      vec2 aspectCorrectedMouse = vec2(mouseUv.x * aspect, mouseUv.y);

      float dist = distance(aspectCorrectedUv, aspectCorrectedMouse);
      float spotlight = 1.0 - smoothstep(0.15, 0.35, dist); 

      // Mistura final
      gl_FragColor = mix(originalColor, helmetColor, spotlight);
    }
  `
);

extend({ ParallaxMaterial });

// --- 2. Cena ---
interface SceneProps {
  imageSrc: string;
  depthSrc: string;
  helmetSrc: string;
  threshold: number;
}

function Scene({ imageSrc, depthSrc, helmetSrc, threshold }: SceneProps) {
  const { viewport, size } = useThree();
  const materialRef = useRef<any>(null);
  const mouseRef = useRef(new THREE.Vector2(0, 0));

  const [texture, depth, helmet] = useTexture([imageSrc, depthSrc, helmetSrc]);

  useLayoutEffect(() => {
    // Configura texturas para não repetir
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    depth.wrapS = depth.wrapT = THREE.ClampToEdgeWrapping;
    helmet.wrapS = helmet.wrapT = THREE.ClampToEdgeWrapping;
    
    texture.colorSpace = THREE.SRGBColorSpace;
    helmet.colorSpace = THREE.SRGBColorSpace;
    depth.colorSpace = THREE.NoColorSpace; 
    
    texture.needsUpdate = true;
  }, [texture, depth, helmet]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.set(x, y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uMouse.lerp(mouseRef.current, 0.08);
      materialRef.current.uResolution.set(size.width, size.height);
      materialRef.current.uImageResolution.set(texture.image.width, texture.image.height); 
    }
  });

  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <parallaxMaterial
        ref={materialRef}
        uTexture={texture}
        uDepthMap={depth}
        uHelmet={helmet}
        uThreshold={[threshold, threshold]}
        toneMapped={false}
      />
    </mesh>
  );
}

// --- 3. Componente Principal Exportado ---
interface ParallaxEffectProps {
  imageSrc: string;
  depthSrc: string;
  helmetSrc: string;
  threshold?: number;
  className?: string;
}

// CERTIFIQUE-SE QUE ESTA LINHA TEM A PALAVRA "export"
export function ParallaxEffect({ 
  imageSrc, 
  depthSrc,
  helmetSrc,
  threshold = 0.015,
  className
}: ParallaxEffectProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas style={{ width: '100%', height: '100%' }}>
        <Scene 
          imageSrc={imageSrc} 
          depthSrc={depthSrc} 
          helmetSrc={helmetSrc} 
          threshold={threshold} 
        />
      </Canvas>
    </div>
  );
}