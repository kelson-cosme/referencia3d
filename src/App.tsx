import './App.css'
import { ParallaxEffect } from './components/ParallaxEffect'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 uppercase tracking-tighter">
          Lando Norris
        </h1>
        <p className="text-gray-500">Depth Map Parallax Effect</p>
      </div>

      <div className="flex gap-8 items-center justify-center">
        {/* Renderiza o Efeito 3D */}
        <ParallaxEffect 
          imageSrc="/perfil.png" 
          depthSrc="/pretoebranco.png"
          width="400px"  // Ajuste o tamanho conforme necessário
          height="500px" // Ajuste o tamanho conforme necessário
          threshold={0.05} // Aumente para exagerar o movimento, diminua para suavizar
        />
        
        {/* Exemplo de dados ao lado, estilo o site dele */}
        <div className="hidden md:block space-y-4 text-left">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 w-48">
            <span className="text-xs font-bold text-gray-400 block mb-1">TEAM</span>
            <span className="text-lg font-bold">MCLAREN</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 w-48">
            <span className="text-xs font-bold text-gray-400 block mb-1">COUNTRY</span>
            <span className="text-lg font-bold">UK</span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default App