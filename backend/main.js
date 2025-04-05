const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = "AIzaSyCmzuYdL8nB-YhFzL-AJcFymtyIVfPExdw";
const genAI = new GoogleGenerativeAI(apiKey);

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

// Function to analyze the contract PDF using Gemini API
async function analyzeContractWithGemini(filePath) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Read the file and convert it to Base64
    const pdfBuffer = fs.readFileSync(filePath);
    const base64Pdf = pdfBuffer.toString("base64");

    console.log("🔹 Sending request to Gemini API...");

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64Pdf,
        },
      },
      "Analyze this contract for 3 high-risk clauses, 2-3 compliance issues, and suggest  2-3 alternatives,",
    ]);

    console.log("✅ Response received from Gemini API:", result);

    if (!result || !result.response || !result.response.text) {
      throw new Error("Invalid response from Gemini API");
    }

    let textResponse = result.response.text();
    
    // Remove asterisks from the response
    textResponse = textResponse.replace(/\*/g, "");