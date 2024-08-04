// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MainnetDocumentOwnership {
    event DocumentUploaded(uint256 documentId, string ownerId, string s3Url, string encryptionKey);

    struct Document {
        address owner;
        string s3Url;
        string encryptionKey;
    }

    mapping(string => Document) public documents; // Mapping from s3Url to Document
    mapping(uint256 => string) public documentIds; // Mapping from documentId to s3Url
    uint256 public documentCount;

    function uploadDocument(string memory _s3Url, string memory _encryptionKey) public {
        documentCount++;
        documents[_s3Url] = Document(msg.sender, _s3Url, _encryptionKey);
        documentIds[documentCount] = _s3Url;
        emit DocumentUploaded(documentCount, addressToString(msg.sender), _s3Url, _encryptionKey);
    }

function transferOwnership(string memory s3Url, address _newOwner, address _feeRecipient) public payable {
    Document storage document = documents[s3Url];
    require(document.owner == msg.sender, "Not the owner");

    uint256 fee = msg.value;
    require(fee > 0, "No fee sent");

    payable(_feeRecipient).transfer(msg.value);

    document.owner = _newOwner;
}

    function getDocumentByS3Url(string memory _s3Url) public view returns (address owner, string memory s3Url, string memory encryptionKey) {
        Document storage document = documents[_s3Url];
        return (document.owner, document.s3Url, document.encryptionKey);
    }

    function addressToString(address _addr) internal pure returns (string memory) {
        bytes memory addressBytes = abi.encodePacked(_addr);
        bytes memory hexBytes = new bytes(2 + 20 * 2);
        hexBytes[0] = "0";
        hexBytes[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            hexBytes[2 + i * 2] = bytes1(uint8(48 + uint8(addressBytes[i] >> 4)));
            hexBytes[3 + i * 2] = bytes1(uint8(48 + uint8(addressBytes[i] & 0x0f)));
        }
        return string(hexBytes);
    }
}
