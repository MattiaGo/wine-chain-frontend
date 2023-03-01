import React from "react";
import { Routes, Route } from "react-router-dom";
import logo from "./logo.svg";

import ChainDApp from "./components/ChainDApp";
import VerifyProduct from "./components/VerifyProduct";

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="logo" className="App-logo" />
        <h1 className="h1">Ethereum and IPFS for a Wine Blockchain</h1>
      </header>
      <Routes>
        <Route path="/" element={<ChainDApp />}></Route>
        <Route path="/verify" element={<VerifyProduct />}></Route>
      </Routes>
    </div>
  );
};

export default App;
