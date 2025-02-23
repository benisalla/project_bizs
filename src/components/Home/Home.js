import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <>
      <header className="hero">
        <div className="hero-content">
          <h1>Water Usage and Resources</h1>
          <p>
            Explore global water consumption patterns, scarcity challenges, and innovative solutions for conservation.
          </p>
          <a
            href="https://www.fao.org/aquastat/en/"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-button"
          >
            More About AQUASTAT
          </a>
        </div>
      </header>

      {/* Info Section */}
      <section className="info-section">
        <h2>Discover Our Data & Project</h2>
        <div className="info-container">
          <div className="info-card">
            <h3>Dataset Source: AQUASTAT</h3>
            <p>
              Our dataset is sourced from <strong>AQUASTAT</strong>, the FAO's global information system on water resources and agricultural water management.
              It offers comprehensive data on water resources, including variables such as water availability, pressure on water resources, and dam capacity per capita.
              Covering records from 1967 to the present across numerous countries—including Afghanistan—the data is expressed in cubic meters per inhabitant (m³/inhab).
            </p>
          </div>
          <div className="info-card">
            <h3>Project Overview</h3>
            <p>
              This interactive web application is developed as part of our Data Visualization course at <strong>Ecole Centrale de Lyon</strong>.
              Our objective is to present a compelling narrative on global water usage and climate change through innovative visualizations.
              Using technologies like JavaScript, D3, and HTML/CSS, we focus on originality, interactivity, and rigorous data analysis.
              Special thanks to our course instructor, <em>Professor Romain Vuillemot</em>, for his invaluable guidance.
              Developed by <strong>Siham Zarmoum</strong> and <strong>Ben Alla Ismail</strong>.
            </p>
          </div>
        </div>
      </section>


      {/* Temperature Data Section */}
      <section className="temperature-section">
        <h2>Temperature Data Insights</h2>
        <div className="temperature-container">
          <div className="temperature-card">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/FAO_logo.svg/1200px-FAO_logo.svg.png"
              alt="FAO Logo"
              className="temp-icon"
            />
            <h3>Global Temperature Trends</h3>
            <p>
              Delve into the dynamic world of temperature fluctuations with our comprehensive dataset. Curated by the FAO, this collection provides historical insights on average temperatures, extreme events, and seasonal patterns across the globe.
            </p>
            <p>
              Temperature variations play a critical role in water resource management, agricultural planning, and climate change adaptation. The dataset is meticulously collected using standardized measurement techniques, ensuring consistency and reliability.
            </p>
            <a
              href="https://www.fao.org/faostat/en/#data/ET/metadata"
              target="_blank"
              rel="noopener noreferrer"
              className="data-link"
            >
              <i className="fa fa-database"></i> Explore Temperature Data
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>
          This project is part of the Data Visualization course at
          <a href="https://www.ec-lyon.fr/" target="_blank" rel="noopener noreferrer"> Ecole Centrale de Lyon</a>.
        </p>
        <p>&copy; {new Date().getFullYear()} Water Explorer. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Home;
