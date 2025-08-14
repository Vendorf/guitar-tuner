import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import useIsWindows from './hooks/useIsWindows.jsx'

// import audioEle from './canvastest.jsx'

const isWindows = useIsWindows()
if (isWindows) {
  document.documentElement.classList.add("on-windows")
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


// //// TEST: ClampTest //////////////////////////////////////////////////////////
// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import ClampTest from './tests/ClampTest/ClampTest'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <ClampTest />
//   </StrictMode>,
// )
// ///////////////////////////////////////////////////////////////////////////////