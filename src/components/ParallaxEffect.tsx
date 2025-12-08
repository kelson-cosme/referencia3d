import { useRef, useEffect, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { useTexture, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. Definição do Shader ---
const ParallaxMaterial = shaderMaterial(
  {
    uTexture: new THREE.Texture(),
    uDepthMap: new THREE.Texture(),
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
      // 1. Calcular UV base
      vec2 uv = getCoverUv(vUv, uResolution, uImageResolution);

      // 2. Ler Profundidade
      vec4 depthMap = texture2D(uDepthMap, uv);
      
      // 3. Calcular Deslocamento
      vec2 displacement = uMouse * depthMap.r * uThreshold;
      vec2 displacedUv = uv + displacement;

      // --- CORREÇÃO DE BORDAS (A Mágica) ---
      // Verificamos se o UV deslocado saiu da área da imagem (0 a 1)
      // Se saiu, descartamos o pixel (fica transparente/preto) em vez de esticar
      if (displacedUv.x < 0.0 || displacedUv.x > 1.0 || displacedUv.y < 0.0 || displacedUv.y > 1.0) {
         // Retorna totalmente transparente
         gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
         return;
      }

      // 4. Ler textura original (apenas se estiver dentro dos limites)
      vec4 color = texture2D(uTexture, displacedUv);

      gl_FragColor = color;
    }
  `
);

extend({ ParallaxMaterial });

// --- 2. Cena ---
interface SceneProps {
  imageSrc: string;
  depthSrc: string;
  threshold: number;
}

function Scene({ imageSrc, depthSrc, threshold }: SceneProps) {
  const { viewport, size } = useThree();
  const materialRef = useRef<any>(null);
  const mouseRef = useRef(new THREE.Vector2(0, 0));

  const [texture, depth] = useTexture([imageSrc, depthSrc]);

  useLayoutEffect(() => {
    // Manter ClampToEdgeWrapping
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    depth.wrapS = depth.wrapT = THREE.ClampToEdgeWrapping;
    
    texture.colorSpace = THREE.SRGBColorSpace;
    depth.colorSpace = THREE.NoColorSpace; 
    
    texture.needsUpdate = true;
  }, [texture, depth]);

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
      // CORREÇÃO AQUI: Cast para HTMLImageElement
      materialRef.current.uImageResolution.set(
        (texture.image as HTMLImageElement).width, 
        (texture.image as HTMLImageElement).height
      ); 
    }
  });

  return (
    // position z=0 para o fundo
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <parallaxMaterial
        ref={materialRef}
        uTexture={texture}
        uDepthMap={depth}
        uThreshold={[threshold, threshold]}
        toneMapped={false}
        transparent={true} // Importante para permitir transparência nas bordas
      />
    </mesh>
  );
}

// --- 3. Componente Principal ---
export function ParallaxEffect({ 
  imageSrc, 
  depthSrc,
  threshold = 0.015,
  className
}: { 
  imageSrc: string; 
  depthSrc: string; 
  threshold?: number; 
  className?: string; 
}) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas style={{ width: '100%', height: '100%' }} gl={{ alpha: true }}>
        <Scene 
          imageSrc={imageSrc} 
          depthSrc={depthSrc} 
          threshold={threshold} 
        />
      </Canvas>
    </div>
  );
}