import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SpeachToText from './components/SpeachToText'
import ReactSpeechRecognition from './components/ReactSpeechRecognition'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        {/* <SpeachToText/> */}
        <ReactSpeechRecognition/>
       </div>
    </>
  )
}

export default App
