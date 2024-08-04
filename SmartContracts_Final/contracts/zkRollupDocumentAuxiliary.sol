// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract zkRollupDocumentAuxiliary {
    event DocumentVerified(string docpath, string verificationStatus);
    event DocumentMetadataUpdated(string docpath, string additionalInfo);

    struct DocumentMetadata {
        string verificationStatus;
        string additionalInfo;
    }

    mapping(string => DocumentMetadata) public documentMetadata;

    // Function to save document metadata
    function saveDocument(string memory _docpath, string memory _verificationStatus, string memory _additionalInfo) public {
        documentMetadata[_docpath] = DocumentMetadata(_verificationStatus, _additionalInfo);
        emit DocumentVerified(_docpath, _verificationStatus);
        emit DocumentMetadataUpdated(_docpath, _additionalInfo);
    }

    // Function to verify a document
    function verifyDocument(string memory _docpath, string memory _verificationStatus) public {
        DocumentMetadata storage metadata = documentMetadata[_docpath];
        metadata.verificationStatus = _verificationStatus;
        emit DocumentVerified(_docpath, _verificationStatus);
    }

    // Function to update document metadata
    function updateDocumentMetadata(string memory _docpath, string memory _additionalInfo) public {
        DocumentMetadata storage metadata = documentMetadata[_docpath];
        metadata.additionalInfo = _additionalInfo;
        emit DocumentMetadataUpdated(_docpath, _additionalInfo);
    }

    // Function to get document metadata
    function getDocumentMetadata(string memory _docpath) public view returns (string memory verificationStatus, string memory additionalInfo) {
        DocumentMetadata memory metadata = documentMetadata[_docpath];
        return (metadata.verificationStatus, metadata.additionalInfo);
    }
}
