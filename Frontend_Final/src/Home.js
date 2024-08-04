import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "./assets/imgs/dhie_logo.jpg";
import backgroundImage from "./assets/imgs/hlthbg1.jpg";

function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [showSignupOptions, setShowSignupOptions] = useState(false);
  const navigate = useNavigate();

  const handleSignup = (userType) => {
    navigate(`/signup/${userType}`);
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div
        className="min-h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div
          className={`min-h-screen bg-overlay-light dark:bg-overlay-dark flex flex-col`}
        >
          <header className="flex justify-between items-center p-4 bg-gray-200 dark:bg-gray-800">
            <div className="flex items-center">
              <img src={logo} alt="DHIE Logo" className="h-10 w-10" />
              <h1 className="ml-2 text-2xl font-bold text-black dark:text-white">
                DHIE
              </h1>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-gray-300 dark:bg-gray-700 p-2 rounded"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </header>
          <main className="flex-grow flex flex-col justify-center items-center p-4">
            <h2 className="text-4xl font-semibold mb-4 text-black dark:text-white">
              Welcome to the Decentralized Health Information Exchange (DHIE)
            </h2>
            <p className="text-lg text-center text-black dark:text-white">
              DHIE aims to provide a secure and efficient way to exchange health
              information.
            </p>
            <div className="text-center max-w-2xl text-black dark:text-white">
              <p className="mb-4">
                DHIE leverages blockchain technology to ensure the privacy,
                security, and interoperability of health data, empowering
                patients with control over their data.
              </p>
              <p className="mb-4">
                Seamlessly share medical records with multiple healthcare
                providers, streamlining the process of receiving care and
                ensuring up-to-date information.
              </p>
              <p className="mb-4">
                Improve decision-making and reduce administrative burdens for
                healthcare providers, enhancing patient care.
              </p>
              <p className="mb-4">
                Advanced encryption and decentralized storage protect health
                information, with patients able to grant or revoke access at any
                time.
              </p>
              <p className="mb-4">
                Join us in revolutionizing healthcare with a secure, efficient,
                and patient-centered approach to health information exchange.
              </p>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <Link
                to="/login"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Login
              </Link>
              <div className="relative">
                <button
                  onClick={() => setShowSignupOptions(!showSignupOptions)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Signup
                </button>
                {showSignupOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
                    <button
                      onClick={() => handleSignup("Patient")}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Patient
                    </button>
                    <button
                      onClick={() => handleSignup("Buyer")}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Buyer
                    </button>
                    <button
                      onClick={() => handleSignup("Doctor")}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Doctor
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Home;
