require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk");

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors({ origin: "http://localhost:5173", methods: ["POST"] }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Function to get response from Groq API
const getGroqChatCompletion = async (pdfContent) => {
  const prompt = `${pdfContent}\n\nCompare it with new Indian laws and highlight what are added or removed (changes).`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    return chatCompletion.choices[0]?.message?.content || "No response from Groq.";
  } catch (error) {
    console.error("❌ Groq API error:", error);
    return "Error processing text with Groq.";
  }
};

// POST route to extract text from PDF and send it to Groq
app.post("/analyze", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "PDF file is required." });
  }

  try {
    // Parse the PDF text
    const pdfText = await pdfParse(req.file.buffer);

    // Send the extracted text to Groq API with comparison prompt
    const groqResponse = await getGroqChatCompletion(pdfText.text);

    res.json({ pdfContent: pdfText.text, groqResponse });
  } catch (error) {
    console.error("❌ Error processing PDF:", error);
    res.status(500).json({ error: "Error analyzing the PDF." });
  }
});

// Start server
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});








// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const multer = require('multer');
// const pdfParse = require('pdf-parse');

// // Set up storage for the uploaded file
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// const app = express();

// // Enable CORS for your front-end
// app.use(cors({
//   origin: 'http://localhost:5173',  // Allow only requests from the front-end
//   methods: ['GET', 'POST'],
// }));

// // Middleware to parse JSON bodies
// app.use(bodyParser.json());

// // POST route for /analyze to handle file uploads and analyze the old PDF
// app.post('/analyze', upload.single('pdf1'), async (req, res) => {
//   const pdf1 = req.file;

//   // Validate that the PDF is uploaded
//   if (!pdf1) {
//     return res.status(400).json({ error: 'The old PDF file is required' });
//   }

//   try {
//     // Parse the PDF and extract text
//     const pdfText = await pdfParse(pdf1.buffer);

//     // Return the extracted text as JSON
//     res.json({ analysis: { pdfContent: pdfText.text } });
//   } catch (error) {
//     console.error("Error processing PDF:", error);
//     res.status(500).json({ error: 'Error analyzing the PDF. Please try again.' });
//   }
// });

// // Start the server
// const PORT = 5002;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
