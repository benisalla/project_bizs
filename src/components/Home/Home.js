import React from 'react';
import './Home.css';

const video_path = process.env.PUBLIC_URL + "/assets/images/vis-project-video.gif";
const code_path = process.env.PUBLIC_URL + "/assets/images/code.png";
const target_website_path = process.env.PUBLIC_URL + "/assets/images/target-website.png";
const model_path = process.env.PUBLIC_URL + "/assets/images/lstm-image.png";
const prediction_path = process.env.PUBLIC_URL + "/assets/images/prediction.jpg";
const sheet_v4_path = process.env.PUBLIC_URL + "/assets/images/sheet-4.jpeg";
const sheet_v5_path = process.env.PUBLIC_URL + "/assets/images/sheet-5.jpg";

const Home = () => {
  return (
    <div className="home-container">
      {/* Section 1: Description of the Project */}
      <section className="project-description">
        <header className="hero">
          <img
            src={video_path}
            alt="Project preview"
            className="hero-video"
          />

          <div className="hero-content">
            <h1>
              <i className="fa fa-water" aria-hidden="true"></i>
              Water Usage and Resources
            </h1>
            <p>
              Explore global water consumption patterns, scarcity challenges, and innovative solutions for conservation.
            </p>
            <a
              href="https://www.fao.org/aquastat/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button"
            >
              <i className="fa fa-external-link" aria-hidden="true"></i>
              More About AQUASTAT
            </a>
          </div>
        </header>
      </section>



      {/* Section 2: Project Description & Story */}
      <section className="project-description-container">
        <div className="overview">
          <h2>Project Overview</h2>
          <p>
            This interactive web application is developed as part of our Data Visualization course at <strong>Ecole Centrale de Lyon</strong>. Our objective is to present a compelling narrative on global water usage and climate change through innovative visualizations. Using technologies such as JavaScript, D3, and HTML/CSS, we emphasize originality, interactivity, and rigorous data analysis. Special thanks to our course instructor, <em>Professor Romain Vuillemot</em>, for his invaluable guidance.
          </p>
        </div>

        <div className="project-story">
          <h2>Story of Our Project</h2>
          <p>
            In a world where water is becoming an increasingly precious resource, <strong>MyWater</strong> empowers you to understand water use and management like never before. Imagine an interactive platform where you can explore, analyze, and visualize how water is consumed, what resources are available, how population trends evolve, and how temperature influences these dynamics. Simply click on a country on the map to access a detailed view featuring dynamic charts that reveal key trends and hidden connections.
          </p>
          <p>
            Water, population, and climate are deeply interconnected. As populations grow, water demand skyrockets—for agriculture, industry, and daily consumption. Meanwhile, rising temperatures due to climate change accelerate evaporation and diminish water reserves. This potent combination can lead to water stress, resulting in reduced availability, increased conflicts, and a growing threat to the sustainability of natural resources. <strong>MyWater</strong> allows you to visualize these interactions in real time, helping you comprehend their impact on both local and global scales.
          </p>
          <p>
            Beyond providing a snapshot of the present, the application features an advanced prediction module that projects trends for the next 10 years. Leveraging models based on historical data and climate variations, you can anticipate future scenarios—discover which countries might face water shortages and explore solutions that can be implemented today. These forecasts are essential for decision-makers, researchers, and anyone committed to fostering a sustainable future.
          </p>
          <p>
            With <strong>MyWater</strong>, every data point tells a story, every trend curve serves as a wake-up call, and every interaction is an opportunity to learn and take action. Understanding water is the first step toward preserving it.
          </p>
        </div>
      </section>



      {/* Section 2: Data Resources */}
      <section className="page-resources">
        <h2>Data Resources</h2>
        <div className="resource-container">

          <div className="resource-card">
            <h3>
              <i className="fa fa-database" aria-hidden="true"></i> Dataset Source: AQUASTAT
            </h3>
            <p>
              <strong>Water and Population Data</strong>
            </p>
            <p>
              Sourced from <strong>AQUASTAT</strong>—FAO's Global Information System on Water and Agriculture—this comprehensive dataset offers free access to over 180 variables and indicators dating back to 1960. It includes key metrics such as water availability, water stress, and population data, presented with a user-friendly interface, advanced search features, and multiple visualization options.
            </p>
            <a href="https://data.apps.fao.org/aquastat/?lang=en" target="_blank" rel="noopener noreferrer" className="data-link">
              <i className="fa fa-database" aria-hidden="true"></i> More on AQUASTAT
            </a>
          </div>

          <div className="resource-card">
            <h3>
              <i className="fa fa-map" aria-hidden="true"></i> GeoJSON Boundaries
            </h3>
            <p>
              This open database provides standardized political administrative boundaries for every country. Built by the community at William &amp; Mary geoLab, the resource offers individual country files, global composite layers (with disputed areas noted), and simplified boundaries for efficient cartographic use—all under the CC BY 4.0 license.
            </p>
            <a href="https://www.geoboundaries.org/#main-wrapper" target="_blank" rel="noopener noreferrer" className="data-link">
              <i className="fa fa-map" aria-hidden="true"></i> Explore GeoBoundaries
            </a>
          </div>

          <div className="resource-card">
            <h3>
              <i className="fa fa-thermometer-half" aria-hidden="true"></i> Temperature Data Insights
            </h3>
            <p>
              Delve into global temperature trends with this dataset curated by the FAO. It provides historical insights on average temperatures, extreme weather events, and seasonal patterns—critical for understanding water resource management, agricultural planning, and climate change adaptation.
            </p>
            <a href="https://www.fao.org/faostat/en/#data/ET/metadata" target="_blank" rel="noopener noreferrer" className="data-link">
              <i className="fa fa-thermometer-half" aria-hidden="true"></i> Explore Temperature Data
            </a>
          </div>

        </div>
      </section>


      {/* Section 3: Web Scraping for GeoJSON Data  */}
      <section className="web-scraping">
        <h2>Web Scraping for GeoJSON Data</h2>
        <p>
          Our system employs robust web scraping techniques to automatically retrieve and process GeoJSON data from trusted sources. We download raw data, extract the latest boundaries, and simplify the files for efficient mapping and analysis.
        </p>
        <div className="scraping-images">
          <img src={code_path} alt="Code Snippet" className="scraping-image" />
          <img src={target_website_path} alt="Scraped Files" className="scraping-image" />
        </div>
      </section>


      {/* Section 4: Predictive Analysis */}
      <section className="predictions">
        <h2>Predictive Analysis</h2>
        <p>
          Our prediction module leverages advanced forecasting models such as LSTM and simple Linear Regression to forecast future trends in water usage and resource management. These insights support strategic planning and sustainable resource allocation.
        </p>
        <p>
          LSTM (Long Short-Term Memory) is a type of recurrent neural network capable of learning long-term dependencies. In our application, it analyzes historical water consumption, population growth, and climate variations to predict future water availability and potential scarcity.
        </p>
        <div className="prediction-images">
          <img src={prediction_path} alt="Example of water quantity prediction" className="prediction-image" />
          <img src={model_path} alt="Model visualization" className="prediction-image" />
        </div>
      </section>


      {/* Section 5: Design Sheets & Brainstorming */}
      <section className="sheet-design">
        <h2>Design Sheets & Brainstorming</h2>
        <p>
          In this section, we showcase the design sheets and brainstorming activities that guided our website creation. These were hand-drawn before we began implementing the graphs and data processing.
        </p>
        <p>
          The first image (Sheet 4) was created a few weeks ago, while the second image (Sheet 5) was developed more recently. Our “MyWater” application closely follows the design principles outlined in Sheet 5.
        </p>
        <div className="sheet-images">
          <img
            src={sheet_v4_path}
            alt="Design sheet version 4"
            className="sheet-image"
          />
          <img
            src={sheet_v5_path}
            alt="Design sheet version 5"
            className="sheet-image"
          />
        </div>
      </section>


      {/* Footer */}
      <footer>
        <p>
          This project is part of the Data Visualization course at <a href="https://www.ec-lyon.fr/" target="_blank" rel="noopener noreferrer">Ecole Centrale de Lyon</a>.
          Developed by <strong>Siham Zarmoum</strong> and <strong>Ben Alla Ismail</strong>.
        </p>
        <p>&copy; {new Date().getFullYear()} Water Explorer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
