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
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

    let textResponse = await result.response.text();

    
    // Remove asterisks from the response
    textResponse = textResponse.replace(/\*/g, "");

    // Check if the text is a valid JSON string
    try {
      const parsedResponse = textResponse;
      return parsedResponse;
    } catch (jsonError) {
      throw new Error("Error parsing Gemini API response: " + jsonError.message);
    }
  } catch (error) {
    console.error("❌ Error analyzing contract:", error);
    throw new Error("Failed to analyze contract. Details: " + error.message);
  }
}

// API Route for contract analysis
app.post("/analyze", upload.single("contract"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(__dirname, req.file.path);
    const analysis = await analyzeContractWithGemini(filePath);

    // Try parsing the response and return a structured response
    let parsedAnalysis;
    try {
      parsedAnalysis = analysis;
    } catch (parseError) {
      console.error("Error parsing analysis response:", parseError);
      parsedAnalysis = { error: "Failed to parse analysis result" };
    }

    res.json({ analysis: parsedAnalysis });

    // Delete the uploaded file after processing
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start Express Server
const PORT = 5001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));




