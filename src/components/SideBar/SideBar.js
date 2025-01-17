import React, { useState } from 'react'; // Correct import statement
import { motion } from 'framer-motion';
import { SiTailwindcss, SiReact, SiJavascript, SiFramer, SiCss3 } from 'react-icons/si';
import './SideBar.css';

const SideBar = () => {
    return (
        <div className="bg-slate-900 text-slate-100 flex">
            <SideNav />
            <div className="w-full">
                {/* Placeholder for other content */}
                <div className="h-[35px] m-4 rounded border-2 border-dashed border-slate-600 bg-slate-800"></div>
                <div className="h-[400px] m-4 rounded border-2 border-dashed border-slate-600 bg-slate-800"></div>
            </div>
        </div>
    );
};

const SideNav = () => {
    const [selected, setSelected] = useState(0);
    const icons = [
        { icon: <SiTailwindcss />, text: "Tailwind CSS" },
        { icon: <SiReact />, text: "React" },
        { icon: <SiJavascript />, text: "JavaScript" },
        { icon: <SiFramer />, text: "Framer Motion" },
        { icon: <SiCss3 />, text: "CSS3" },
    ];

    return (
        <nav className="sidebar">
            {icons.map((item, index) => (
                <NavItem key={index} selected={selected === index} onClick={() => setSelected(index)}>
                    {item.icon}
                    <span className="nav-text">{item.text}</span>
                </NavItem>
            ))}
        </nav>
    );
};

const NavItem = ({ children, selected, onClick }) => {
    return (
        <motion.div
            className={`nav-item ${selected ? "selected" : ""}`}
            onClick={onClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            {children}
        </motion.div>
    );
};

export default SideBar;
