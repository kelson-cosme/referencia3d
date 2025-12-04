import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { useTexture, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. Definição do Shader (Igual ao anterior) ---
const ParallaxMaterial = shaderMaterial(
  {
    uTexture: new THREE.Texture(),
    uDepthMap: new THREE.Texture(),
    uMouse: new THREE.Vector2(0, 0),
    uThreshold: new THREE.Vector2(0, 0),
    uResolution: new THREE.Vector2(1, 1), // Para corrigir aspect ratio
    uImageResolution: new THREE.Vector2(1, 1), // Tamanho da imagem original
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader com suporte a "Cover" (para não esticar)
  `
    uniform sampler2D uTexture;
    uniform sampler2D uDepthMap;
    uniform vec2 uMouse;
    uniform vec2 uThreshold;
    uniform vec2 uResolution;
    uniform vec2 uImageResolution;
    varying vec2 vUv;

    // Função para simular background-size: cover
    vec2 getCoverUv(vec2 uv, vec2 resolution, vec2 texResolution) {
      vec2 s = resolution; // Screen
      vec2 i = texResolution; // Image
      float rs = s.x / s.y;
      float ri = i.x / i.y;
      vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
      vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
      vec2 uvCover = uv * s / new + offset;
      return uvCover;
    }

    void main() {
      // Calcular UV ajustado para "Cover"
      vec2 uv = getCoverUv(vUv, uResolution, uImageResolution);

      // Ler profundidade
      vec4 depthMap = texture2D(uDepthMap, uv);
      
      // Calcular deslocamento
      vec2 displacement = uMouse * depthMap.r * uThreshold;

      // Cor final
      gl_FragColor = texture2D(uTexture, uv + displacement);
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
  
  // Mouse global ref
  const mouseRef = useRef(new THREE.Vector2(0, 0));

  const [texture, depth] = useTexture([imageSrc, depthSrc]);
  texture.colorSpace = THREE.SRGBColorSpace;

  // Ouvir mouse globalmente (ignora bloqueios de div)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalizar de -1 a 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.set(x, y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    if (materialRef.current) {
      // Suavizar movimento (Lerp)
      materialRef.current.uMouse.lerp(mouseRef.current, 0.05);
      
      // Atualizar resoluções para o efeito "Cover"
      materialRef.current.uResolution.set(size.width, size.height);
      // Assumindo que a imagem é a do Lando (aprox quadrada/retrato), ajuste se souber o tamanho exato
      // Valores arbitrários altos para garantir qualidade
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
        uThreshold={[threshold, threshold]}
        toneMapped={false}
      />
    </mesh>
  );
}

// --- 3. Componente Principal ---
interface ParallaxEffectProps {
  imageSrc: string;
  depthSrc: string;
  threshold?: number;
  className?: string;
}

export function ParallaxEffect({ 
  imageSrc, 
  depthSrc, 
  threshold = 0.05,
  className
}: ParallaxEffectProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas style={{ width: '100%', height: '100%' }}>
        <Scene imageSrc={imageSrc} depthSrc={depthSrc} threshold={threshold} />
      </Canvas>
    </div>
  );
}