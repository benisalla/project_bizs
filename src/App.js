import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import Home from './components/Home/Home';
import AboutUs from './components/AboutUs/AboutUs';
import DataVisualization from './components/DataVisualization/DataVisualization';
import './App.css';

const App = () => {

  return (
    <Router>
      <div>
        <NavBar />
        <div id="main-content">  
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/data-visualization" element={<DataVisualization />} />
            <Route path="*" element={<h1>Page not found</h1>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
