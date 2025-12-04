import { ShaderMaterialProps, Object3DNode } from '@react-three/fiber';
import { ShaderMaterial } from 'three';

declare module '@react-three/fiber' {
  interface ThreeElements {
    parallaxMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial> & 
      ShaderMaterialProps & {
        uTexture?: THREE.Texture;
        uDepthMap?: THREE.Texture;
        uHelmet?: THREE.Texture; // NOVA PROPRIEDADE
        uThreshold?: number[];
        uMouse?: THREE.Vector2;
        uMix?: number; // NOVA PROPRIEDADE PARA CONTROLAR A INTENSIDADE
      };
  }
}