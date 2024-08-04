import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "./assets/imgs/dhie_logo.jpg";
import { apiGet, apiPut, apiDelete, apiPost } from "./apiService";
import { useNavigate } from "react-router-dom";
import PdfViewer from "./PdfViewer";
import Web3 from "web3";

function DoctorDashboard({ user, darkMode, setDarkMode }) {
  const [reports, setReports] = useState([]);
  const [pt, setPt] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    reportName: "",
    disease: "",
    date: "",
    criticality: "",
  });
  const [pdfb64, setPdfb64] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadReports();
    loadPatients();
  }, []);

  const handleLogout = () => {
    console.log("Logged out");
    logoutAction();
  };

  const handleChange = (event) => {
    if (event.target.value !== "Select Patient")
      setSelectedOption(event.target.value);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPdfb64(reader.result.split(",")[1]);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select a PDF file.");
    }
  };

  const loadReports = async () => {
    try {
      const result = await apiGet(
        "/doctor/reports",
        localStorage.getItem("authToken")
      );
      setReports(result);
    } catch (error) {
      console.log(error);
    }
  };

  const loadPatients = async () => {
    try {
      const result = await apiGet(
        "/doctor/allpatients",
        localStorage.getItem("authToken")
      );
      setPt(result);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUploadReport = () => {
    setIsModalOpen(true);
  };

  const handleSaveReport = async () => {
    if (pdfb64?.length > 0) {
      const resp = await apiPost(`/file/encrypt-pdf`, { pdf_data: pdfb64 });

      const { encrypted_data, encrypted_key } = resp;
      const resp1 = await apiPost(`/file/upload`, {
        encryptedData: encrypted_data,
      });
      console.log(resp1?.key);

      if (
        newReport.reportName &&
        newReport.criticality &&
        newReport.date &&
        newReport.disease &&
        selectedOption
      ) {
        try {
          await apiPut(
            `/doctor/report`,
            {
              ...newReport,
              patientId: selectedOption,
              link: resp1?.key,
              enkey: encrypted_key,
            },
            localStorage.getItem("authToken")
          );
          loadReports();
          setIsModalOpen(false);
          setNewReport({
            reportName: "",
            disease: "",
            date: "",
            criticality: "",
            price: "",
          });
          setSelectedOption("");
          setPdfb64("");
          setIsModalOpen(false);

          if (typeof window.ethereum !== "undefined") {
            const web3 = new Web3(window.ethereum);
            const contractAddress =
              "0x9466f59019eDBC2F6D47844F3f2E1b7d11732614";
            const contractABI = [
              {
                anonymous: false,
                inputs: [
                  {
                    indexed: false,
                    internalType: "uint256",
                    name: "documentId",
                    type: "uint256",
                  },
                  {
                    indexed: false,
                    internalType: "string",
                    name: "ownerId",
                    type: "string",
                  },
                  {
                    indexed: false,
                    internalType: "string",
                    name: "s3Url",
                    type: "string",
                  },
                  {
                    indexed: false,
                    internalType: "string",
                    name: "encryptionKey",
                    type: "string",
                  },
                ],
                name: "DocumentUploaded",
                type: "event",
              },
              {
                inputs: [],
                name: "documentCount",
                outputs: [
                  {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                  },
                ],
                stateMutability: "view",
                type: "function",
                constant: true,
              },
              {
                inputs: [
                  {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                  },
                ],
                name: "documentIds",
                outputs: [
                  {
                    internalType: "string",
                    name: "",
                    type: "string",
                  },
                ],
                stateMutability: "view",
                type: "function",
                constant: true,
              },
              {
                inputs: [
                  {
                    internalType: "string",
                    name: "",
                    type: "string",
                  },
                ],
                name: "documents",
                outputs: [
                  {
                    internalType: "address",
                    name: "owner",
                    type: "address",
                  },
                  {
                    internalType: "string",
                    name: "s3Url",
                    type: "string",
                  },
                  {
                    internalType: "string",
                    name: "encryptionKey",
                    type: "string",
                  },
                ],
                stateMutability: "view",
                type: "function",
                constant: true,
              },
              {
                inputs: [
                  {
                    internalType: "string",
                    name: "_s3Url",
                    type: "string",
                  },
                  {
                    internalType: "string",
                    name: "_encryptionKey",
                    type: "string",
                  },
                ],
                name: "uploadDocument",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
              {
                inputs: [
                  {
                    internalType: "string",
                    name: "s3Url",
                    type: "string",
                  },
                  {
                    internalType: "address",
                    name: "_newOwner",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "_feeRecipient",
                    type: "address",
                  },
                ],
                name: "transferOwnership",
                outputs: [],
                stateMutability: "payable",
                type: "function",
                payable: true,
              },
              {
                inputs: [
                  {
                    internalType: "string",
                    name: "_s3Url",
                    type: "string",
                  },
                ],
                name: "getDocumentByS3Url",
                outputs: [
                  {
                    internalType: "address",
                    name: "owner",
                    type: "address",
                  },
                  {
                    internalType: "string",
                    name: "s3Url",
                    type: "string",
                  },
                  {
                    internalType: "string",
                    name: "encryptionKey",
                    type: "string",
                  },
                ],
                stateMutability: "view",
                type: "function",
                constant: true,
              },
            ];

            const contract = new web3.eth.Contract(
              contractABI,
              contractAddress
            );

            try {
              await window.ethereum.request({ method: "eth_requestAccounts" });
              const accounts = await web3.eth.getAccounts();
              const priceInWei = web3.utils.toWei(0, "ether");

              const gasEstimate = await contract.methods
                .uploadDocument(resp1?.key, encrypted_key)
                .estimateGas({
                  from: accounts[0],
                  value: priceInWei,
                });

              const tx = await contract.methods
                .uploadDocument(resp1?.key, encrypted_key)
                .send({
                  from: accounts[0],
                  value: priceInWei,
                  gas: Number(gasEstimate) + 10000,
                });
              console.log("Document ID: ", tx);
            } catch (error) {
              console.error("Error buying report:", error);
            }
          } else {
            alert("MetaMask is not installed. Please install it to proceed.");
          }

          alert("Report Uploaded");
        } catch (error) {
          console.log(error);
          alert("Failed to upload report. Please try again.");
        }
      } else {
        alert("Fill all fields");
      }
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await apiDelete(
        `/doctor/report/${reportId}`,
        localStorage.getItem("authToken")
      );
      loadReports();
    } catch (error) {
      console.log(error);
      alert("Failed to delete report. Please try again.");
    }
  };

  const viewReport = async (report) => {
    if (report?.allowUploaderToView) {
      console.log(report);

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
    } else {
      alert("Viewing blocked by Report Owner");
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
                Actions
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="text-red-500 hover:text-red-700 mr-2"
                  >
                    Delete
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => viewReport(report)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg relative z-10">
              <h2 className="text-xl font-semibold mb-4">Upload Report</h2>

              <select
                className="ptselect"
                id="dropdown"
                value={selectedOption}
                onChange={handleChange}
              >
                <option key={null} value={null}>
                  Select Patient
                </option>
                {pt.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.otherFields.firstName} {p.otherFields.lastName}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Report Name"
                value={newReport.reportName}
                onChange={(e) =>
                  setNewReport({ ...newReport, reportName: e.target.value })
                }
                className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="Disease"
                value={newReport.disease}
                onChange={(e) =>
                  setNewReport({ ...newReport, disease: e.target.value })
                }
                className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
              />
              <input
                type="date"
                value={newReport.date}
                onChange={(e) =>
                  setNewReport({ ...newReport, date: e.target.value })
                }
                className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="Criticality"
                value={newReport.criticality}
                onChange={(e) =>
                  setNewReport({ ...newReport, criticality: e.target.value })
                }
                className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
              />
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
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
                  onClick={handleSaveReport}
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

export default DoctorDashboard;
