import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const navRef = useRef();
    const buttonRefs = useRef([]);
    buttonRefs.current = [];

    // Set initial selectedIndex based on the current route
    const routes = ['/', '/about-us', '/data-visualization', '/test-page'];
    const initialIndex = routes.findIndex(route => route === location.pathname);
    const [selectedIndex, setSelectedIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

    const addToRefs = (el) => {
        if (el && !buttonRefs.current.includes(el)) {
            buttonRefs.current.push(el);
        }
    };

    const navigateTo = (index, path) => {
        setSelectedIndex(index);
        navigate(path);
    };

    useEffect(() => {
        const selectedBtn = buttonRefs.current[selectedIndex];
        if (selectedBtn) {
            const { offsetLeft, clientWidth } = selectedBtn;
            const dropIndicator = document.querySelector('.drop-indicator');
            dropIndicator.style.width = `${clientWidth}px`;
            dropIndicator.style.transform = `translateX(${offsetLeft}px)`;
        }
    }, [selectedIndex]);

    return (
        <nav ref={navRef}>
            <div className="drop-indicator" />

            <button
                className={`nav-button ${selectedIndex === 0 ? 'active' : ''}`}
                ref={addToRefs}
                onClick={() => navigateTo(0, '/')}
            >
                Home
            </button>

            <button
                className={`nav-button ${selectedIndex === 1 ? 'active' : ''}`}
                ref={addToRefs}
                onClick={() => navigateTo(1, '/about-us')}
            >
                About Us
            </button>

            <button
                className={`nav-button ${selectedIndex === 2 ? 'active' : ''}`}
                ref={addToRefs}
                onClick={() => navigateTo(2, '/data-visualization')}
            >
                Data Visualization
            </button>

            <button
                className={`nav-button ${selectedIndex === 3 ? 'active' : ''}`}
                ref={addToRefs}
                onClick={() => navigateTo(3, '/test-page')}
            >
                Test Page
            </button>
        </nav>
    );
};

export default NavBar;
