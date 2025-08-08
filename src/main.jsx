import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// import audioEle from './canvastest.jsx'

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