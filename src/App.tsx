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
      <div className="absolute top-8 left-8 z-30 font-serif text-4xl font-bold tracking-tighter text-black pointer-events-none">
        LANDO<br/>NORRIS
      </div>
      
      <div className="absolute top-8 right-8 z-30 flex gap-4 pointer-events-auto">
         <button className="bg-[#ccff00] px-6 py-2 font-bold text-black uppercase tracking-wider text-sm rounded hover:bg-[#b3e600] transition cursor-pointer border-none">
            Store
         </button>
      </div>

    </div>
  )
}

export default App