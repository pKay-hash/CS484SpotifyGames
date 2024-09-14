import React, { useEffect, useState } from 'react';
import logo from '../assets/logo.png'; // Import the logo (nice)

const Header = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return(
        <div className="header flex flex-row w-screen bg-gradient-to-r from-cyan-500 to-blue-500 to-sky-500 to-indigo-500 to-violet-500 to-to-fuchsia-500 to-purple-500 to-pink-500">
            <div className="logoContent flex flex-row justify-left">
                <img src={logo} alt="Games On The Spot Logo" className="w-12 h-12 justify-self-start" />
                <h2 className='font-teko font-semibold text-3xl mt-1.5 ml-1.5 text-green-300 transition duration-300 transform hover:scale-105 '>Game.Spot</h2>
            </div>
        </div>
    );
};
export default Header;