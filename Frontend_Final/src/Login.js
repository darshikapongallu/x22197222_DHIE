import React, { useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "./apiService";
import { useNavigate } from "react-router-dom";

function Login() {
  const [userType, setUserType] = useState("Patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await apiPost("/auth/login", {
        email,
        password,
      });
      console.log(result);
      if (result && result?.token) {
        localStorage.setItem("authToken", result?.token);
        localStorage.setItem("userType", result?.userType);
        if (result?.userType == "patient") {
          navigate("/patient-dashboard");
        } else if (result?.userType == "buyer") {
          navigate("/buyer-dashboard");
        } else if (result?.userType == "doctor") {
          navigate("/doctor-dashboard");
        } else {
          alert("Invalid Creds");
        }
      }
    } catch (error) {
      console.log(error);
      alert("Invalid Creds");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-2">
              Select User Type
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="Patient">Patient</option>
              <option value="Buyer">Buyer</option>
              <option value="Doctor">Doctor</option>
            </select>
          </div>
          <div className="mb-4">
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
          <div className="mb-4">
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
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
