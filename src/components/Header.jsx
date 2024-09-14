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
            <div className="info flex flex-row align-center justify-items-center justify-center justify-self-center">
                <button className="font-oswald text-white">
                    Docs
                </button>
                <div className="relative">
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                >
                    <span>Authors</span>
                    <svg className="fill-current w-4 h-4 ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                </button>
                
                {/* Dropdown Menu */}
                {dropdownOpen && (
                    <ul className="dropdown-menu absolute right-0 mt-2 bg-white border rounded shadow-md text-gray-700 pt-1">
                        <li>
                            <a
                                className="bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap"
                                href="https://linkedin.com/in/author1"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Author 1
                            </a>
                        </li>
                        <li>
                            <a
                                className="bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap"
                                href="https://linkedin.com/in/author2"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Author 2
                            </a>
                        </li>
                    </ul>
                )}
            </div>
            </div>
            
        </div>
    );
};
export default Header;