import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ParallaxEffectProps {
  imageSrc: string;
  depthSrc: string;
  width?: string;
  height?: string;
  threshold?: number; // Intensidade do movimento
}

export function ParallaxEffect({ 
  imageSrc, 
  depthSrc, 
  width = "100%", 
  height = "600px", 
  threshold = 0.03 
}: ParallaxEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Configuração da Cena
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // 2. Carregar Texturas
    const loader = new THREE.TextureLoader();
    const textureOriginal = loader.load(imageSrc);
    const textureDepth = loader.load(depthSrc);

    // Ajustar para não distorcer a imagem (cover fit)
    textureOriginal.colorSpace = THREE.SRGBColorSpace;
    
    // 3. Criar o Shader (A mágica acontece aqui)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: textureOriginal },
        uDepthMap: { value: textureDepth },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uThreshold: { value: new THREE.Vector2(threshold, threshold) },
        uImageSize: { value: new THREE.Vector2(0, 0) },
        uContainerSize: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform sampler2D uDepthMap;
        uniform vec2 uMouse;
        uniform vec2 uThreshold;
        varying vec2 vUv;

        void main() {
          // Ler a profundidade (usamos o canal vermelho da imagem p&b)
          vec4 depthMap = texture2D(uDepthMap, vUv);
          
          // Calcular o deslocamento baseado no mouse e na profundidade
          // Quanto mais branco (perto), mais se move.
          vec2 displacement = uMouse * depthMap.r * uThreshold;

          // Buscar a cor original na nova posição deslocada
          gl_FragColor = texture2D(uTexture, vUv + displacement);
        }
      `
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // 4. Interatividade com Mouse
    const handleMouseMove = (e: MouseEvent) => {
      // Normalizar posição do mouse (-1 a 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      // Suavizar ou passar direto
      material.uniforms.uMouse.value.x = x;
      material.uniforms.uMouse.value.y = y;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 5. Redimensionamento
    const handleResize = () => {
        if (!containerRef.current) return;
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        // Aqui poderíamos adicionar lógica complexa para "background-size: cover" no shader
        // mas para simplicidade vamos manter o padrão.
    };
    window.addEventListener('resize', handleResize);

    // 6. Loop de Renderização
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Limpeza ao desmontar componente
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [imageSrc, depthSrc, threshold]);

  return (
    <div 
      ref={containerRef} 
      style={{ width, height }} 
      className="relative overflow-hidden rounded-xl shadow-2xl bg-gray-100"
    />
  );
}