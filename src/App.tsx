import { ParallaxEffect } from './components/ParallaxEffect'
import PixelTrail from './components/PixelTrail'
import './App.css'

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      
      {/* CAMADA 1: Fundo 3D */}
      <div className="absolute inset-0 z-0">
        <ParallaxEffect 
          imageSrc="/perfil.png" 
          depthSrc="/pretoebranco.png"
          helmetSrc="/perfilCapacete.png"
          // Diminuir threshold para 0.02 ou 0.015 evita que a imagem saia da borda
          threshold={0.015} 
        />
      </div>

      {/* CAMADA 2: Rastro de Pixels (Mostra Capacete) */}
      <div className="absolute inset-0 z-10">
         <PixelTrail 
           imageSrc="/perfilCapacete.png" // Imagem que aparece nos "pixels"
           gridSize={40}       
           trailSize={0.25}     
           maxAge={500}        
           className="w-full h-full"
         />
      </div>

    </div>
  )
}

export default App