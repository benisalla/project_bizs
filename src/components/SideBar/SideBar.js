import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SiTailwindcss} from 'react-icons/si';
import './SideBar.css';

const SideBar = () => {
    return (
        <div className="bg-slate-900 text-slate-100 flex">
            <SideNav />
            <div className="w-full">
                <div className="h-[35px] m-4 rounded border-2 border-dashed border-slate-600 bg-slate-800"></div>
                <div className="h-[400px] m-4 rounded border-2 border-dashed border-slate-600 bg-slate-800"></div>
            </div>
        </div>
    );
};

const SideNav = () => {
    const [selected, setSelected] = useState(0);
    const icons = [
        { icon: <span><SiTailwindcss /></span>, text: "Tailwind CSS" },
        { icon: <span><SiTailwindcss /></span>, text: "Tailwind CSS" },
        { icon: <span><SiTailwindcss /></span>, text: "Tailwind CSS" },
        { icon: <span><SiTailwindcss /></span>, text: "Tailwind CSS" },
        { icon: <span><SiTailwindcss /></span>, text: "Tailwind CSS" },
        { icon: <span><SiTailwindcss /></span>, text: "Tailwind CSS" },
        { icon: <span><SiTailwindcss /></span>, text: "Tailwind CSS" },
        { icon: <span><SiTailwindcss /></span>, text: "Tailwind CSS" },
        { icon: <span><SiTailwindcss /></span>, text: "Tailwind CSS" },
        { icon: <span><SiTailwindcss /></span>, text: "Tailwind CSS" },
        { icon: <span><SiTailwindcss /></span>, text: "Tailwind CSS" },
        { icon: <span><SiTailwindcss /></span>, text: "Tailwind CSS" },
        { icon: <span><SiTailwindcss /></span>, text: "Tailwind CSS" },
        { icon: <span><SiTailwindcss /></span>, text: "Tailwind CSS" },
    ];

    return (
        <nav className="sidebar" aria-label="Main Sidebar">
            {icons.map((item, index) => (
                <NavItem
                    key={index}
                    selected={selected === index}
                    onClick={() => setSelected(index)}
                    aria-label={item.text}
                >
                    {item.icon}
                    <span className="nav-text">{item.text}</span>
                </NavItem>
            ))}
        </nav>
    );
};

const NavItem = ({ children, selected, onClick, ...rest }) => {
    return (
        <motion.div
            className={`nav-item ${selected ? "selected" : ""}`}
            onClick={onClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            role="button"
            aria-pressed={selected ? "true" : "false"}
            {...rest}
        >
            {children}
        </motion.div>
    );
};

export default SideBar;