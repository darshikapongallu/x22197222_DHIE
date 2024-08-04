const MainnetDocumentOwnership = artifacts.require("MainnetDocumentOwnership");
const zkRollupDocumentAuxiliary = artifacts.require("zkRollupDocumentAuxiliary");

contract("Document Ownership and Auxiliary Functions", accounts => {
    let mainnetContract;
    let zkRollupContract;

    const uploader = accounts[0];
    const newOwner = accounts[1];
    const s3Url = "https://example-s3-url.com/document.pdf";
    const encryptionKey = "exampleEncryptionKey";
    const verificationStatus = "Verified";
    const additionalInfo = "Some additional metadata";
    const fee = web3.utils.toWei('0.01', 'ether');

    before(async () => {
        mainnetContract = await MainnetDocumentOwnership.new();
        zkRollupContract = await zkRollupDocumentAuxiliary.new();
    });

    it("should upload a document with a different owner to the Mainnet contract", async () => {
        const tx = await mainnetContract.uploadDocument(s3Url, encryptionKey, { from: uploader });
        const documentId = tx.logs[0].args.documentId.toNumber();
        console.log("Document ID: ", documentId);

        const document = await mainnetContract.getDocumentByS3Url(s3Url);
        assert.equal(document.owner, uploader, "Owner address is incorrect");
        assert.equal(document.s3Url, s3Url, "S3 URL is incorrect");
        assert.equal(document.encryptionKey, encryptionKey, "Encryption key is incorrect");
    });

    it("should transfer ownership of the document on the Mainnet contract with fee and send ETH to the new owner", async () => {
        const tx = await mainnetContract.uploadDocument(s3Url, encryptionKey, { from: uploader });
        const documentId = tx.logs[0].args.documentId.toNumber();
        console.log("Document ID: ", documentId);

        // Ensure uploader is the owner before transferring
        const documentBefore = await mainnetContract.getDocumentByS3Url(s3Url);
        console.log("Document before transfer: ", documentBefore);

        // Get the initial balance of the new owner
        const initialBalance = await web3.eth.getBalance(newOwner);

        // Transfer ownership and pay fee
        await mainnetContract.transferOwnership(s3Url, newOwner,newOwner, { from: uploader, value: fee });

        // Get the new balance of the new owner
        const finalBalance = await web3.eth.getBalance(newOwner);
        const balanceDifference = web3.utils.toBN(finalBalance).sub(web3.utils.toBN(initialBalance));
        console.log("Balance difference: ", balanceDifference.toString());

        // Check if the balance difference is approximately equal to the fee (accounting for gas costs)
        assert.isTrue(balanceDifference.gte(web3.utils.toBN(fee).sub(web3.utils.toBN('1000000000000000'))), "Fee not correctly transferred");

        // Check if the ownership has been transferred
        const documentAfter = await mainnetContract.getDocumentByS3Url(s3Url);
        console.log("Document after transfer: ", documentAfter);

        assert.equal(documentAfter.owner, newOwner, "New owner address is incorrect");
    });

    it("should verify the document on the zkRollup contract", async () => {
        const tx = await mainnetContract.uploadDocument(s3Url, encryptionKey, { from: uploader });
        const documentId = tx.logs[0].args.documentId.toNumber();
        console.log("Document ID: ", documentId);

        await zkRollupContract.verifyDocument(documentId, verificationStatus, { from: uploader });
        const metadata = await zkRollupContract.getDocumentMetadata(documentId);
        console.log("Metadata: ", metadata);

        assert.equal(metadata.verificationStatus, verificationStatus, "Verification status is incorrect");
    });

    it("should update document metadata on the zkRollup contract", async () => {
        const tx = await mainnetContract.uploadDocument(s3Url, encryptionKey, { from: uploader });
        const documentId = tx.logs[0].args.documentId.toNumber();
        console.log("Document ID: ", documentId);

        await zkRollupContract.updateDocumentMetadata(documentId, additionalInfo, { from: uploader });
        const metadata = await zkRollupContract.getDocumentMetadata(documentId);
        console.log("Metadata: ", metadata);

        assert.equal(metadata.additionalInfo, additionalInfo, "Additional info is incorrect");
    });
});
