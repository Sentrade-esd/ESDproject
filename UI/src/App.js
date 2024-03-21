import logo from './logo.svg';
import './App.css';
import Navigation from './Components/Navigation.js'
import HomeBody from './Components/HomeBody.js'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Search from './Components/Search.js';
import Trade from './Components/Trade.js';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navigation></Navigation>
        {/* <HomeBody /> */}
        <Routes>
          <Route path="/" element={< HomeBody/>} />
          <Route path="/home" element={<HomeBody/>}></Route>
          <Route path="/search" element={<Search/>}></Route>
          <Route path="/trade" element={<Trade />} />
          {/* <Route path="/trade" element={<Trade/>}></Route> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
