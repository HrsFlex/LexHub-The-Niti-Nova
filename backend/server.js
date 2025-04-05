const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const Groq = require("groq-sdk");


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqChatCompletion(query) {
  return groq.chat.completions.create({
    messages: [{ role: "user", content: query }],
    model: "llama-3.3-70b-versatile",
  });
}

app.post("/analyze", async (req, res) => {
  try {
    const { query } = req.body;
    const response = await getGroqChatCompletion(query);
    res.json({ analysis: response.choices[0]?.message?.content || "No response" });
  } catch (error) {
    console.error("Error fetching AI analysis:", error);
    res.status(500).json({ error: "Failed to fetch AI insights" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
