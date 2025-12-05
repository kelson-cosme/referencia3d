import { ParallaxEffect } from './components/ParallaxEffect'
import PixelTrail from './components/PixelTrail'
import TopographicBackground from './components/TopographicBackground'
import './App.css'

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white">
      
      {/* CAMADA 0: Fundo Animado (Agora com z-0 para garantir visibilidade) */}
      <div className="absolute inset-0 z-0">
        <TopographicBackground />
      </div>

      {/* CAMADA 1: Rosto 3D (Subimos o z-index para 10 para ficar sobre o fundo) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        {/* pointer-events-auto na div interna para permitir a interação do mouse apenas na área da imagem */}
        <div className="w-full h-full max-w-[1200px] aspect-[4/5] md:aspect-square relative pointer-events-auto">
          <ParallaxEffect 
            imageSrc="/perfil.png" 
            depthSrc="/pretoebranco.png"
            threshold={0.005} 
          />
        </div>
      </div>

      {/* CAMADA 2: Rastro (z-20) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
         {/* O PixelTrail precisa receber eventos, mas a div pai não deve bloquear */}
         <div className="w-full h-full pointer-events-auto">
           <PixelTrail 
             imageSrc="/perfilCapacete.png" 
             trailSize={0.2}
             maxAge={700}
             interpolate={8}
             className="w-full h-full"
           />
         </div>
      </div>

      {/* CAMADA 3: UI (z-30) */}
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