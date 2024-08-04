import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { Link } from "react-router-dom";
import logo from "./assets/imgs/dhie_logo.jpg";
import { apiGet, apiPost, apiPut, apiDelete } from "./apiService";
import { Web3Provider } from "@ethersproject/providers";
import { Contract, parseEther, parseUnits } from "ethers";
import {
  Provider as ZkSyncProvider,
  Wallet as ZkSyncWallet,
} from "zksync-web3";

function BuyerDashboard({ user, darkMode, setDarkMode }) {
  const [totalReportsPurchased, setTotalReportsPurchased] = useState(0);
  const [reportsPurchased, setReportsPurchased] = useState([]);
  const [totalAvailableReports, setTotalAvailableReports] = useState(0);
  const [AvailableReports, setAvailableReports] = useState([]);
  const [pt, setPt] = useState([]);
  const [me, setMe] = useState([]);

  useEffect(() => {
    loadData();
    loadData1();
    loadPatients();
    myData();
  }, []);

  const handleLogout = () => {
    console.log("Logged out");
    logoutAction();
  };

  const loadData = async () => {
    try {
      const result = await apiGet(
        "/buyer/purchased-reports",
        localStorage.getItem("authToken")
      );
      console.log(result);
      setReportsPurchased(result);
      setTotalReportsPurchased(result.length);
    } catch (error) {
      console.log(error);
    }
  };

  const loadData1 = async () => {
    try {
      const result = await apiGet(
        "/buyer/available-reports",
        localStorage.getItem("authToken")
      );
      console.log(result);
      setAvailableReports(result);
      setTotalAvailableReports(result.length);
    } catch (error) {
      console.log(error);
    }
  };

  const handleViewReport = async (report) => {
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
  };
  const handleSideChainTx = async (path, from, to) => {
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
          .updateDocumentMetadata(path, "Owbership transfer" + from + "" + to)
          .send({ from: accounts[0] });
        alert("Side chain success");
      } catch (error) {
        console.log(error);
      }
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

  const loadPatients = async () => {
    try {
      const result = await apiGet(
        "/buyer/allpatients",
        localStorage.getItem("authToken")
      );
      console.log(result);
      setPt(result);
    } catch (error) {
      console.log(error);
    }
  };

  const myData = async () => {
    try {
      const result = await apiGet(
        "/buyer/me",
        localStorage.getItem("authToken")
      );
      console.log(result);
      setMe(result);
    } catch (error) {
      console.log(error);
    }
  };

  const handleBuyReport = async (report) => {
    const patient = pt.find((p) => p._id == report.patient);
    console.log(patient);
    if (typeof window.ethereum !== "undefined") {
      const web3 = new Web3(window.ethereum);
      const contractAddress = "0x9466f59019eDBC2F6D47844F3f2E1b7d11732614";
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
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        const priceInWei = web3.utils.toWei(Number(report.price), "ether");

        const recipient = pt.find((p) => p._id == report?.patient)[
          "otherFields"
        ]["address"];
        const gasEstimate = await contract.methods
          .transferOwnership(report.link, me?.otherFields?.address, recipient)
          .estimateGas({
            from: accounts[0],
            value: priceInWei,
          });
        console.log(
          "txdetails",
          report.link,
          me?.otherFields?.address,
          recipient
        );
        await contract.methods
          .transferOwnership(report.link, me?.otherFields?.address, recipient)
          .send({
            from: accounts[0],
            value: priceInWei,
            gas: Number(gasEstimate) + 10000,
          });

        console.log(`Report ${report.link} bought for ${report.price} ETH`);

        const res = await apiPost(`/buyer/purchase-report/${report._id}`, {});
        if (res) {
          await handleSideChainTx(
            report.link,
            me?.otherFields?.address,
            recipient
          );
          alert("Report Purchased Successfully");
          loadData();
          loadData1();
          loadPatients();
        }
      } catch (error) {
        console.error("Error buying report:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install it to proceed.");
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
        <div className="mb-4">
          <p className="text-2xl font-semibold">Buyer Dashboard</p>
          <div className="bg-blue-200 dark:bg-blue-700 p-4 rounded-md mt-2">
            <p className="text-lg font-semibold">Total Reports Purchased</p>
            <p className="text-3xl">{totalReportsPurchased}</p>
          </div>

          <div className="bg-blue-200 dark:bg-blue-700 p-4 rounded-md mt-2">
            <p className="text-lg font-semibold">
              Reports Available for Purchased
            </p>
            <p className="text-3xl">{totalAvailableReports}</p>
          </div>
        </div>

        <div>Purchased Reports</div>
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
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {reportsPurchased.map((report) => (
              <tr key={report._id}>
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
                    onClick={() => handleViewReport(report)}
                    className="text-green-500 hover:text-green-700"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {reportsPurchased?.length == 0 && (
              <tr key="empty1">No Records Found</tr>
            )}
          </tbody>
        </table>
        <br />
        <hr />
        <br />
        <div>Reports Available</div>
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
                Price (ETH)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {AvailableReports.map((report) => (
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
                    onClick={() => handleBuyReport(report)}
                    className="text-green-500 hover:text-green-700"
                  >
                    Buy
                  </button>
                </td>
              </tr>
            ))}

            {reportsPurchased?.length == 0 && (
              <tr key="empty1">No Records Found</tr>
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}

function logoutAction() {
  localStorage.clear();
  window.location.replace("/");
}

export default BuyerDashboard;
