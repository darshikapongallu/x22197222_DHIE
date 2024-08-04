import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiGet, apiPost, apiPut, apiDelete } from "./apiService";
import { useNavigate } from "react-router-dom";

function Signup() {
  const { userType } = useParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [governmentId, setGovernmentId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const getMetaMaskAddress = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        setAddress(accounts[0]);
      } catch (error) {
        console.error(
          "User denied account access or there was an error:",
          error
        );
        setError("User denied Metamask access or there was an error.");
      }
    } else {
      console.error("MetaMask is not installed. Please install MetaMask.");
      setError("MetaMask is not installed. Please install MetaMask.");
    }
  };

  useEffect(() => {
    getMetaMaskAddress();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (address?.length > 0) {
      try {
        const result = await apiPost("/auth/signup", {
          email,
          password,
          role: String(userType).toLowerCase(),
          otherFields: {
            firstName,
            lastName,
            governmentId,
            phone,
            age,
            address: address,
          },
        });
        if (result && result?.token) {
          alert("Signed up successfully. Pls proceed to login");
          navigate("/login");
        }
      } catch (error) {
        console.log(error);
        alert("User exists or credential error");
      }
    } else {
      alert("Allow Metamask address first !");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Signup as {userType}
        </h2>
        <form onSubmit={handleSignup}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-2">
                Government ID
              </label>
              <input
                type="text"
                value={governmentId}
                onChange={(e) => setGovernmentId(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-2">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-gray-200"
                required
              />
            </div>
          </div>

          <div>
            {address ? (
              <p>MetaMask account address: {address}</p>
            ) : (
              <p>{error || "Requesting MetaMask account address..."}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded mt-4 hover:bg-green-700"
          >
            Signup
          </button>
        </form>
        <br />
        <button onClick={getMetaMaskAddress}>Reconnect MetaMask</button>
      </div>
    </div>
  );
}

export default Signup;
