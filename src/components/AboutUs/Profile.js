import React from 'react';
import './Profile.css';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const img_dir = process.env.PUBLIC_URL + '/assets/images/';

const Profile = ({ name, role, bio, imageName, githubLink, linkedinLink }) => {
    const imageUrl = img_dir + imageName;
    return (
        <div className="profile-card">
            <div className="profile-image">
                <img src={imageUrl} alt={name} />
            </div>
            <div className="profile-content">
                <h2>{name}</h2>
                <h3>{role}</h3>
                <p>{bio}</p>
                <div className="profile-icons">
                    <a href={githubLink} target="_blank" rel="noopener noreferrer" className="icon github">
                        <FaGithub />
                        <span>GitHub</span>
                    </a>
                    <a href={linkedinLink} target="_blank" rel="noopener noreferrer" className="icon linkedin">
                        <FaLinkedin />
                        <span>LinkedIn</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Profile;
