import logo from "./logo.svg";
import "./App.css";
// import Navigation from "./Components/Navigation.js";
import NavBar from "./Components/NavBar.js";
// import HomeBody from "./Pages/HomeBody.js";
import Home from "./Pages/Home.js";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Search from "./Pages/Search.js";
import Trade from "./Pages/Trade.js";
import TradeHistory from "./Pages/TradeHistory.js";
import React, { useState, useEffect } from "react";
import { AlertProvider } from "./Components/Alert.js";
import { LoadingProvider } from "./Components/Loading.js";

function Main() {
  const location = useLocation();


  return (
    <div className="App">
      {(location.pathname !== "/landing" && location.pathname !== "/" && location.pathname !== '/home') && <NavBar transparent={false} />}
      <Routes>
        <Route path="/landing" element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/trade" element={<Trade />} />
        <Route path="/TradeHistory" element={<TradeHistory />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AlertProvider>
      <LoadingProvider>
      <BrowserRouter>
        <Main />
      </BrowserRouter>
      </LoadingProvider>
    </AlertProvider>
  );
}

export default App;
