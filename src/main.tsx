import React from 'react'
import ReactDOM from 'react-dom/client'
import ColorStrenth from './color-strenth'
import { Link, Router } from 'react-router-dom'
import './index.css'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Timer } from './timer'
function Home() {
  return (
    <div>
      <Link to="/color-strenth">颜色强度计</Link><br/>
      <Link to="/timer">计时器</Link>
    </div>
  )
}
function Main() {
  return (
    <React.StrictMode>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/color-strenth" element={<ColorStrenth />} />
          <Route path="/timer" element={<Timer />} />
        </Routes>
      </HashRouter>
    </React.StrictMode>
  )
}
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Main />
)
