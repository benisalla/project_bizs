import React from 'react';
import Profile from './Profile';
import './AboutUs.css';

const AboutUs = () => {
    return (
        <section className="about-us">
            <header>
                <h1>About Us</h1>
                <p>Welcome to our company. We are dedicated to providing the best service possible.</p>
            </header>
            <div className="team">
                <Profile 
                    name="Ismail Ben Alla"
                    role="M2 Student at École Centrale de Lyon"
                    bio="Graduated in Computer Science Engineering and currently pursuing a Master's in AI. Passionate about NLP, computer vision, and solving complex AI challenges."
                    imageName="ben_alla_ismail.jpg"
                    githubLink="https://github.com/ismailbenalla"
                    linkedinLink="https://www.linkedin.com/in/ismail-ben-alla/"
                />
                <Profile 
                    name="Ismail Ben Alla"
                    role="M2 Student at École Centrale de Lyon"
                    bio="Graduated in Computer Science Engineering and currently pursuing a Master's in AI. Passionate about NLP, computer vision, and solving complex AI challenges."
                    imageName="ben_alla_ismail.jpg"
                    githubLink="https://github.com/ismailbenalla"
                    linkedinLink="https://www.linkedin.com/in/ismail-ben-alla/"
                />
            </div>
        </section>
    );
};

export default AboutUs;
