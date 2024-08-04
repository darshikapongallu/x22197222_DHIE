import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/imgs/dhie_logo.jpg";
import { apiGet, apiPut, apiDelete, apiPost } from "./apiService";
import Web3 from "web3";

function UploadReport({ darkMode, setDarkMode }) {
  const [newReport, setNewReport] = useState({
    reportName: "",
    disease: "",
    date: "",
    criticality: "",
  });
  const [pt, setPt] = useState([]);
  const [pdfb64, setPdfb64] = useState("");
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("");
  const [me, setMe] = useState([]);

  const handleLogout = () => {
    console.log("Logged out");
    logoutAction();
  };

  const myData = async () => {
    try {
      const result = await apiGet(
        "/buyer/me",
        localStorage.getItem("authToken")
      );
      console.log(result);
      setMe(result);
      setSelectedOption(result._id);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    myData();
  }, []);

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
          setNewReport({
            reportName: "",
            disease: "",
            date: "",
            criticality: "",
            price: "",
          });
          setPdfb64("");

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
              handleSideChainTx(resp1?.key);
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

  const handleSideChainTx = async (path) => {
    if (typeof window.ethereum !== "undefined") {
      const web3 = new Web3(window.ethereum);
      const contractAddress = "0x1cdC7F6e1D77cE2606FcE6D93fA36597600da85a";
      const contractABI = [
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "string",
              name: "docpath",
              type: "string",
            },
            {
              indexed: false,
              internalType: "string",
              name: "additionalInfo",
              type: "string",
            },
          ],
          name: "DocumentMetadataUpdated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "string",
              name: "docpath",
              type: "string",
            },
            {
              indexed: false,
              internalType: "string",
              name: "verificationStatus",
              type: "string",
            },
          ],
          name: "DocumentVerified",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          name: "documentMetadata",
          outputs: [
            {
              internalType: "string",
              name: "verificationStatus",
              type: "string",
            },
            {
              internalType: "string",
              name: "additionalInfo",
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
              name: "_docpath",
              type: "string",
            },
            {
              internalType: "string",
              name: "_verificationStatus",
              type: "string",
            },
            {
              internalType: "string",
              name: "_additionalInfo",
              type: "string",
            },
          ],
          name: "saveDocument",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "string",
              name: "_docpath",
              type: "string",
            },
            {
              internalType: "string",
              name: "_verificationStatus",
              type: "string",
            },
          ],
          name: "verifyDocument",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "string",
              name: "_docpath",
              type: "string",
            },
            {
              internalType: "string",
              name: "_additionalInfo",
              type: "string",
            },
          ],
          name: "updateDocumentMetadata",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "string",
              name: "_docpath",
              type: "string",
            },
          ],
          name: "getDocumentMetadata",
          outputs: [
            {
              internalType: "string",
              name: "verificationStatus",
              type: "string",
            },
            {
              internalType: "string",
              name: "additionalInfo",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
          constant: true,
        },
      ];
      const accounts = await web3.eth.getAccounts();
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      try {
        console.log("SideChain exe");
        await contract.methods
          .saveDocument(path, "unverified", "")
          .send({ from: accounts[0] });
        alert("Side chain success");
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg relative z-10">
        <h2 className="text-xl font-semibold mb-4">Upload Report</h2>

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
          onChange={(e) => setNewReport({ ...newReport, date: e.target.value })}
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
            onClick={handleSaveReport}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
      <div className="fixed inset-0 bg-black opacity-50 z-0"></div>
    </div>
  );
}

function logoutAction() {
  localStorage.clear();
  window.location.replace("/");
}

export default UploadReport;
