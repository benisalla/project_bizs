import React from 'react';
import Profile from './Profile';
import './AboutUs.css';

const AboutUs = () => {
    return (
        <section className="about-us">
            <header>
                <h1>Who We Are ?</h1>
                <p>
                Welcome, everyone! We are the <strong>'MyWater'</strong> team, dedicated to solving the 
                <strong>'Water Usage and Resources'</strong> data visualization challenge.
                </p>
            </header>

            <div className="team">
                <Profile
                    name="Ismail Ben Alla"
                    role="M2 Student at École Centrale de Lyon"
                    bio="Graduated in Computer Science Engineering in 2024 from ENSAF and currently pursuing a Master 2 in AI. Passionate about NLP, computer vision, and solving complex AI challenges."
                    imageName="ben_alla_ismail.jpg"
                    githubLink="https://github.com/ismailbenalla"
                    linkedinLink="https://www.linkedin.com/in/ismail-ben-alla/"
                />
                <Profile
                    name="Siham Zarmoum"
                    role="M2 Student at École Centrale de Lyon"
                    bio="Graduated with a Master's degree in Data Science and has three years of experience as a Full-Stack Development instructor. Passionate about AI, Machine Learning, and Data Analysis."
                    imageName="siham_zarmoum.jpg"
                    githubLink="https://github.com/SihamZR"
                    linkedinLink="https://www.linkedin.com/in/siham-zarmoum/"
                />
            </div>
        </section>
    );
};

export default AboutUs;
