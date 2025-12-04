import './App.css'
import PixelTrail from '@/components/PixelTrail';

function App() {

  return (
    <>
     <PixelTrail
    gridSize={50}
    trailSize={0.1}
    maxAge={250}
    interpolate={5}
    color="#fff"
    gooeyFilter={{ id: "custom-goo-filter", strength: 2 }}
  />
    </>
  )
}

export default App
