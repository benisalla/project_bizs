import React, { useRef, useState } from 'react';
import './WaterRippleBtn.css';

const WaterRippleBtn = ({ children, onClick }) => {
  const buttonRef = useRef(null);
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRipples([...ripples, { x, y, id: Date.now() }]);

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button ref={buttonRef} className="water-ripple-button" onClick={handleClick}>
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple"
          style={{ left: ripple.x, top: ripple.y }}
          onAnimationEnd={() => setRipples(ripples.filter((r) => r.id !== ripple.id))}
        />
      ))}
    </button>
  );
};

export default WaterRippleBtn;
