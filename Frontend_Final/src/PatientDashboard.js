import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "./assets/imgs/dhie_logo.jpg";
import { apiGet, apiPut, apiDelete, apiPost } from "./apiService";
import { useNavigate } from "react-router-dom";

function PatientDashboard({ user, darkMode, setDarkMode }) {
  const [availableReports, setAvailableReports] = useState(0);
  const [totalReportsForSale, setTotalReportsForSale] = useState(0);
  const [totalReportsSold, setTotalReportsSold] = useState(0);
  const [reports, setReports] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    loadData1();
  }, []);

  const handleLogout = () => {
    console.log("Logged out");
    logoutAction();
  };

  const loadData = async () => {
    try {
      const result = await apiGet(
        "/patient/summary",
        localStorage.getItem("authToken")
      );
      setAvailableReports(result.availableReports);
      setTotalReportsForSale(result.totalReportsForSale);
      setTotalReportsSold(result.totalReportsSold);
      setTotalRevenue(result.totalRevenue);
    } catch (error) {
      console.log(error);
    }
  };

  const loadData1 = async () => {
    try {
      const result = await apiGet(
        "/patient/reports",
        localStorage.getItem("authToken")
      );
      setReports(result);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUploadReport = () => {
    console.log("Upload report");
    navigate("/upload-report");
  };

  const handleUpdatePrice = (report) => {
    setSelectedReport(report);
    setNewPrice(report.price);
    setIsModalOpen(true);
  };

  const handleSavePrice = async () => {
    console.log(selectedReport, "selectedReport");
    try {
      await apiPut(
        `/patient/report/${selectedReport._id}/price`,
        { price: newPrice },
        localStorage.getItem("authToken")
      );
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === selectedReport._id
            ? { ...report, price: newPrice }
            : report
        )
      );
      setIsModalOpen(false);
      setSelectedReport(null);
      setNewPrice("");
      loadData();
      loadData1();
    } catch (error) {
      console.log(error);
      alert("Failed to update price. Please try again.");
    }
  };

  const handleDeleteReport = async (report) => {
    if (report.status != "sold") {
      try {
        await apiDelete(
          `/patient/report/${report._id}`,
          localStorage.getItem("authToken")
        );
        loadData();
        loadData1();
      } catch (error) {
        console.log(error);
        alert("Failed to delete report. Please try again.");
      }
    } else {
      alert("No action on sold reports");
    }
  };

  const base64toBlob = (data) => {
    const pdfContentType = "application/pdf";
    const bytes = atob(data);
    let length = bytes.length;
    let out = new Uint8Array(length);

    while (length--) {
      out[length] = bytes.charCodeAt(length);
    }

    return new Blob([out], { type: pdfContentType });
  };

  const handleViewReport = async (report) => {
    const decyptFile = await apiPost(`/file/readfile`, {
      filename: report?.link,
    });

    const result = await apiPost(`/file/decrypt-pdf`, {
      encrypted_data: decyptFile?.text,
      encrypted_key: report?.enkey,
    });

    console.log(result);

    const url = URL.createObjectURL(base64toBlob(result?.decrypted_data));

    var link = document.createElement("a");
    link.href = url;
    link.download = `${(report?.link).split(".")[0]}.pdf`;
    link.click();
  };

  const handleDocView = async (report) => {
    const res = await apiPost(`/patient/toggledocview`, {
      report,
    });
    if (res) {
      alert("Preference Updated");
      loadData1();
    }
  };

  const handleSellView = async (report) => {
    const res = await apiPost(`/patient/togglesell`, {
      report,
    });
    if (res) {
      alert("Preference Updated");
      loadData1();
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <header className="flex justify-between items-center p-4 bg-gray-200 dark:bg-gray-800">
        <div className="flex items-center">
          <img src={logo} alt="DHIE Logo" className={`h-10 w-10`} />
          <h1
            className={`ml-2 text-2xl font-bold ${
              darkMode ? "text-white" : "text-black"
            }`}
          >
            DHIE
          </h1>
        </div>
        <div className="flex items-center">
          <p className="mr-4 text-black dark:text-white">Welcome</p>
          <button
            onClick={handleUploadReport}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
          >
            Upload Report
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 mr-2"
          >
            Logout
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-300 dark:bg-gray-700 p-2 rounded"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </header>
      <main
        className={`p-4 ${
          darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-200 dark:bg-blue-700 p-4 rounded-md">
            <p className="text-lg font-semibold">Available Reports</p>
            <p className="text-3xl">{availableReports}</p>
          </div>
          <div className="bg-green-200 dark:bg-green-700 p-4 rounded-md">
            <p className="text-lg font-semibold">Total Reports for Sale</p>
            <p className="text-3xl">{totalReportsForSale}</p>
          </div>
          <div className="bg-yellow-200 dark:bg-yellow-700 p-4 rounded-md">
            <p className="text-lg font-semibold">Total Reports Sold</p>
            <p className="text-3xl">{totalReportsSold}</p>
          </div>
          <div className="bg-purple-200 dark:bg-purple-700 p-4 rounded-md">
            <p className="text-lg font-semibold">Total Revenue (ETH)</p>
            <p className="text-3xl">{totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-200 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                Report Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                Disease
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                Criticality
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {report.reportName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {report.disease}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{report.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {report.criticality}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{report.price}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    disabled={report.status == "sold"}
                    onClick={() => handleUpdatePrice(report)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    Update Price
                  </button>
                  <button
                    disabled={report.status == "sold"}
                    onClick={() => handleDeleteReport(report)}
                    className="text-red-500 hover:text-red-700 mr-2"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleViewReport(report)}
                    className="text-green-500 hover:text-green-700 mr-2"
                  >
                    View
                  </button>
                  {report?.patient != report?.uploadedBy && (
                    <button
                      disabled={report.status == "sold"}
                      onClick={() => handleDocView(report)}
                      className="text-green-500 hover:text-green-700 mr-2"
                    >
                      {" "}
                      {report?.allowUploaderToView ? "Disallow" : "Allow"}{" "}
                      Doctor to View
                    </button>
                  )}
                  <button
                    disabled={report.status == "sold"}
                    onClick={() => handleSellView(report)}
                    className="text-green-500 hover:text-green-700 mr-2"
                  >
                    {" "}
                    {report?.status == "unavailable"
                      ? "Allow Purchase"
                      : "Mark not for Purchase"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg relative z-10">
              <h2 className="text-xl font-semibold mb-4">Update Price</h2>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePrice}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
            <div className="fixed inset-0 bg-black opacity-50 z-0"></div>
          </div>
        )}
      </main>
    </div>
  );
}

function logoutAction() {
  localStorage.clear();
  window.location.replace("/");
}

export default PatientDashboard;
