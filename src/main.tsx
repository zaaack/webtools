import React from "react";
import ReactDOM from "react-dom/client";
import ColorStrenth from "./color-strenth";
import { Link, Router } from "react-router-dom";
import "./index.css";
import { List } from "antd-mobile";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Timer } from "./timer";
function Home() {
  return (
    <List>
      <Link to="/color-strenth">
        <List.Item>颜色强度计</List.Item>
      </Link>

      <Link to="/timer">
        <List.Item>计时器</List.Item>
      </Link>
      <Link to="/xykey">
        <List.Item>xykey</List.Item>
      </Link>
    </List>
  );
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
  );
}
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Main />
);
