import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FileImportComponent, MainComponent } from "./components";
import ServiceComponent from "components/Service/ServiceComponent";

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<div />} />
        <Route path='/main' element={<MainComponent />} />
        <Route path='/file' element={<FileImportComponent />} />
        <Route path='/service' element={<ServiceComponent />} />
      </Routes>
    </Router>
  );
}

export default App;
