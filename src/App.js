import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FileImportComponent, MainComponent } from "./components";

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<div />} />
        <Route path='/main' element={<MainComponent />} />
        <Route path='/file' element={<FileImportComponent />} />
      </Routes>
    </Router>
  );
}

export default App;
