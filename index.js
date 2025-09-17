import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import express from "express";
import multer from "multer";
import fs from "fs/promises";
import cors from "cors";

const app = express();
const upload = multer();
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

//inisialisasi model AI
const GEMINI_MODEL = "gemini-2.5-flash";
const geminiModels ={
  text: "gemini-2.5-flash-lite",
  image: "gemini-2.5-flash",
  audio: "gemini-2.5-flash",
  document: "gemini-2.5-flash-lite"
};

function extractText(resp) {
  try {
    const text =
      resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
      resp?.candidates?.[0]?.content?.parts?.[0]?.text ??
      resp?.response?.candidates?.[0]?.content?.text;

    return text ?? JSON.stringify(resp, null, 2);
  } catch (err) {
    console.error("Error extracting text:", err);
    return JSON.stringify(resp, null, 2);
  }
}

//inisialisasi aplikasi back-end
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post('/generate-text', async (req, res) => {
  const { message } = req.body || {};
  if(!message || typeof message !== 'string'){
    res.status(400).json({message: "Pesan tidak ada atau format-nya tidak sesuai."});
    return;
  }

  //logic dimulai di sini
  const response = await  ai.models.generateContent({
    model: geminiModels.text,
    contents: message,
  });

  res.status(200).json({
    reply: response.text
  })
});

// 2. Generate From Image
app.post("/generate-from-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    console.log("File:", req.file);
    console.log("Body:", req.body);

    const prompt = req.body?.prompt || "Deskripsikan gambar berikut:";
    const imageBase64 = req.file.buffer.toString("base64");

    const resp = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        { text: prompt },
        { inlineData: { mimeType: req.file.mimetype, data: imageBase64 } },
      ],
    });

    res.json({ result: extractText(resp) });
  } catch (err) {
    console.error("Error generate from image:", err);
    res.status(500).json({ error: err.message });
  }
});



// 4. Generate From Document
app.post('/generate-from-document', upload.single('document'), async (req, res) => {
  try {
    const { prompt } = req.body;
    const docBase64 = req.file.buffer.toString('base64');
    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: prompt || "Ringkas dokumen berikut:" },
        { inlineData: { mimeType: req.file.mimetype, data: docBase64 } }
      ]
    });

    res.json({ result: extractText(resp) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File audio tidak ditemukan" });
    }

    const { prompt } = req.body;
    const audioBase64 = req.file.buffer.toString('base64');

    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: prompt || "Transkrip audio berikut:" },
        { inlineData: { mimeType: req.file.mimetype, data: audioBase64 } }
      ]
    });

    res.json({ result: extractText(resp) });
  } catch (err) {
    console.error("Error generate-from-audio:", err);
    res.status(500).json({ error: err.message });
  }
});




// 3. Generate From Audio
/*app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
  try {
    const { prompt } = req.body;
    const audioBase64 = req.file.buffer.toString('base64');
    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: prompt || "Transkrip audio berikut:" },
        { inlineData: { mimeType: req.file.mimetype, data: audioBase64 } }
      ]
    });

    res.json({ result: extractText(resp) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});*/


/*async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Halo boleh minta tolong buatkan website landing page dengan basis HTML, CSS, dan JavaScript, di mana CSS-nya menggunakan Tailwind CSS untuk framework styling-nya?",
  });
  console.log(response.text);
}

await main();*/

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});