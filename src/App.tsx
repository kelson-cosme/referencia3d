import { ParallaxEffect } from './components/ParallaxEffect'
import PixelTrail from './components/PixelTrail'
import TopographicBackground from './components/TopographicBackground'
import './App.css'

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white">
      
      {/* CAMADA 0: Fundo Animado */}
      <div className="absolute inset-0 z-0">
        <TopographicBackground />
      </div>

      {/* CONTAINER PRINCIPAL: Alinha o Rosto e o Rastro na mesma área */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        
        {/* Caixa restrita (AspectRatio + MaxWidth) */}
        {/* pointer-events-auto aqui permite interação dentro desta área */}
        <div className="w-full h-full max-w-[1200px] aspect-[4/5] md:aspect-square relative pointer-events-auto">
          
          {/* CAMADA 1: Rosto 3D (Fica no fundo da caixa) */}
          <div className="absolute inset-0 z-0">
            <ParallaxEffect 
              imageSrc="/perfil.png" 
              depthSrc="/pretoebranco.png"
              threshold={0.005} 
            />
          </div>

          {/* CAMADA 2: Rastro (Fica por cima do rosto, na mesma caixa) */}
          <div className="absolute inset-0 z-10">
            <PixelTrail 
              imageSrc="/perfilCapacete.png" 
              trailSize={0.2}
              maxAge={700}
              interpolate={8}
              className="w-full h-full"
            />
          </div>

        </div>
      </div>

      {/* CAMADA 3: UI (Texto e Botões) */}


    </div>
  )
}

export default App