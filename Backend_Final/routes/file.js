const AWS = require("aws-sdk");
require("dotenv").config();
const express = require("express");
const router = express.Router();
const config = require("../config");
const authMiddleware = require("../middleware/auth");
const { generateKeypair, encrypt, decrypt } = require("../helper/ntru");
const axios = require("axios");

AWS.config.update({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  region: config.AWS_REGION,
});

const s3 = new AWS.S3();

const { f, g, h } = generateKeypair();

router.post("/upload", authMiddleware, async (req, res) => {
  const { encryptedData } = req.body;
  const ntruEncryptedMessage = encrypt(encryptedData, h, 3);
  if (!ntruEncryptedMessage) {
    return res.status(400).json({ error: "No encrypted data provided" });
  }

  try {
    const timestamp = Date.now();
    const keyName = `${timestamp}.txt`;

    const params = {
      Bucket: config.S3_BUCKET_NAME,
      Key: keyName,
      Body: Buffer.from(ntruEncryptedMessage),
      ContentType: "text/plain",
    };

    await s3.upload(params).promise();

    res
      .status(200)
      .json({ message: "File uploaded successfully", key: keyName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

router.post("/readfile", authMiddleware, async (req, res) => {
  try {
    const { filename } = req.body;
    const bucketName = config.S3_BUCKET_NAME;
    const params = {
      Bucket: bucketName,
      Key: filename,
    };
    const data = await s3.getObject(params).promise();
    const decryptedMessage = decrypt(data.Body.toString("utf-8"), f, 3);
    res.status(200).json({ text: decryptedMessage });
  } catch (error) {
    console.error("Error fetching file from S3:", error);
    res.status(500).json({ error: "error" });
  }
});

router.post("/encrypt-pdf", authMiddleware, async (req, res) => {
  try {
    const { pdf_data } = req.body;
    const inpBody = {
      pdf_data,
      kms_key_id:
        "arn:aws:kms:eu-west-1:905418205110:key/50f66988-3b16-4e2e-8085-90d6987a4d6f",
    };
    const response = await axios.post(
      "https://okwvvbz54b.execute-api.eu-west-1.amazonaws.com/dev/encrypt-pdf",
      inpBody
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "error" });
  }
});

router.post("/decrypt-pdf", authMiddleware, async (req, res) => {
  try {
    const { encrypted_data, encrypted_key } = req.body;
    const inpBody = {
      encrypted_data,
      encrypted_key,
    };
    const response = await axios.post(
      "https://z0xvvkb0lg.execute-api.eu-west-1.amazonaws.com/dev/decrypt-pdf",
      inpBody
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "error" });
  }
});

module.exports = router;
