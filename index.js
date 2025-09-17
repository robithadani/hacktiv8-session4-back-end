import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import express from "express";
import multer from "multer";
import fs from "fs/promises";
import cors from "cors";

const app = express();
const upload = multer();
const ai = new GoogleGenAI({});

//inisialisasi model AI
const geminiModels ={
  text: "gemini-2.5-flash-lite",
  image: "gemini-2.5-flash",
  audio: "gemini-2.5-flash",
  document: "gemini-2.5-flash-lite"
};

//inisialisasi aplikasi back-end
app.use(cors());
app.use(express.json());
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

/*async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Halo boleh minta tolong buatkan website landing page dengan basis HTML, CSS, dan JavaScript, di mana CSS-nya menggunakan Tailwind CSS untuk framework styling-nya?",
  });
  console.log(response.text);
}

await main();*/


const port =  3000;
app.listen(port, () => {
  console.log("Oke Boss", port);
});