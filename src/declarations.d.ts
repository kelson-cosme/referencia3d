import { ShaderMaterialProps, Object3DNode } from '@react-three/fiber';
import { ShaderMaterial } from 'three';
import * as THREE from 'three';

declare module '@react-three/fiber' {
  interface ThreeElements {
    // ParallaxMaterial
    parallaxMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial> & 
      ShaderMaterialProps & {
        uTexture?: THREE.Texture;
        uDepthMap?: THREE.Texture;
        uHelmet?: THREE.Texture;
        uThreshold?: number[] | number; // Aceita array ou número
        uMouse?: THREE.Vector2;
        uMix?: number;
      };
      
    // TopoMaterial (Adicionado)
    topoMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial> & 
      ShaderMaterialProps & {
        uTime?: number;
        uColor?: THREE.Color;
        uBgColor?: THREE.Color;
      };

    // DotMaterial (Adicionado)
    dotMaterial: Object3DNode<ShaderMaterial, typeof ShaderMaterial> & 
      ShaderMaterialProps & {
        resolution?: THREE.Vector2;
        imageResolution?: THREE.Vector2;
        mouseTrail?: THREE.Texture;
        imageTexture?: THREE.Texture;
      };
  }
}