import logo from './logo.svg';
import './App.css';
import Navigation from './components/Navigation.js'
import NavBar from './components/NavBar.js'
import HomeBody from './pages/HomeBody.js'
import Home from './pages/Home.js'
import { BrowserRouter, Routes, Route, useLocation} from "react-router-dom";
import Search from './pages/Search.js';
import Trade from './pages/Trade.js';
import TradeHistory from './pages/TradeHistory.js';
import React, {useState, useEffect} from 'react';


function Main() {
  const location = useLocation();

  return (
    <div className="App">
      {location.pathname !== '/landing' && <NavBar transparent={false} />}
      <Routes>
        <Route path="/landing" element={<Home />} />
        <Route path="/" element={<HomeBody />} />
        <Route path="/home" element={<HomeBody />} />
        <Route path="/search" element={<Search />} />
        <Route path="/trade" element={<Trade />} />
        <Route path="/TradeHistory" element={<TradeHistory />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Main />
    </BrowserRouter>
  );
}


export default App;
