import React from 'react'
import ReactDOM from 'react-dom/client'
import ColorStrenth from './color-strenth'
import { Router } from 'react-router-dom'
import './index.css'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Timer } from './timer'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/color-strenth" element={<ColorStrenth />} />
        <Route path="/timer" element={<Timer />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
)
