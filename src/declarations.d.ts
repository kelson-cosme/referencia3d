import { ShaderMaterialProps, Object3DNode } from '@react-three/fiber';
import { ShaderMaterial } from 'three';

// Estende a tipagem do React Three Fiber para incluir o nosso material personalizado
declare module '@react-three/fiber' {
  interface ThreeElements {
    parallaxMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial> & 
      ShaderMaterialProps & {
        uTexture?: THREE.Texture;
        uDepthMap?: THREE.Texture;
        uThreshold?: number[];
        uMouse?: THREE.Vector2;
      };
  }
}