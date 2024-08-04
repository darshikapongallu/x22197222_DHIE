import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import PatientDashboard from "./PatientDashboard";
import BuyerDashboard from "./BuyerDashboard";
import UploadReport from "./UploadReport";
import DoctorDashboard from "./DoctorDashboard";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const user = {
    firstName: "",
    lastName: "",
    id: "",
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup/:userType" element={<Signup />} />
        <Route
          path="/patient-dashboard"
          element={
            <PatientDashboard
              user={user}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          }
        />
        <Route
          path="/buyer-dashboard"
          element={
            <BuyerDashboard
              user={{ firstName: "Alice" }}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          }
        />
        <Route
          path="/upload-report"
          element={
            <UploadReport
              user={{ firstName: "Alice" }}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          }
        />
        <Route
          path="/doctor-dashboard"
          element={
            <DoctorDashboard
              user={{ firstName: "Alice" }}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
