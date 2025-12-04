import { ParallaxEffect } from './components/ParallaxEffect'
import PixelTrail from './components/PixelTrail'
import './App.css'

function App() {
  return (
    // Container ocupa toda a tela, fundo preto para contraste
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      
      {/* CAMADA 1 (Fundo): O Rosto 3D 
          Z-Index 0. Ocupa tudo.
      */}
      <div className="absolute inset-0 z-0">
        <ParallaxEffect 
          imageSrc="/perfil.png" 
          depthSrc="/pretoebranco.png"
          threshold={0.03} // Intensidade do movimento
        />
      </div>

      {/* CAMADA 2 (Frente): O Rastro de Pixel 
          Z-Index 10. Ocupa tudo.
          IMPORTANTE: removemos pointer-events-none para ele capturar o rato
      */}
      <div className="absolute inset-0 z-10">
         <PixelTrail 
           gridSize={30}       // Tamanho do pixel
           trailSize={0.2}     // Tamanho do rastro
           color="#ccff00"     // Cor Neon Lando Norris (Importante para ver no fundo claro)
           maxAge={400}        // Quanto tempo o rastro dura
           className="w-full h-full"
         />
      </div>

    </div>
  )
}

export default App