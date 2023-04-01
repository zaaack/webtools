import React from 'react'
import ReactDOM from 'react-dom/client'
import ColorStrenth from './color-strenth'
import { Link, Router } from 'react-router-dom'
import './index.css'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Timer } from './timer'
import Memo from './memo'
import { NotePage } from './memo/note/index.quill'
import { NotePage as TNote } from './memo/note/index'
function Home() {
  return (
    <div>
      <Link to="/color-strenth">颜色强度计</Link><br/>
      <Link to="/timer">计时器</Link><br/>
      <Link to="/xykey">xykey</Link><br/>
      <Link to="/memo">memo</Link><br/>
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
          <Route path="/memo" element={<Memo />} />
          <Route path="/memo/note/:id" element={<NotePage />} />
          <Route path="/tmemo/note/:id" element={<TNote />} />
        </Routes>
      </HashRouter>
    </React.StrictMode>
  )
}
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Main />
)
