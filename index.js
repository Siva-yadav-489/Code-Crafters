const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");
const proposalPrompts = require("./main-prompt");

const PDFDocument = require("pdfkit");
const fs = require("fs");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));

const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

//function making req to Gemini
async function callGemini(question) {
  const prompt = proposalPrompts.context + question + proposalPrompts.additions;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are a Software Proposal Generator. Your name is Proposal AI by CodeCrafters.",
      },
    });
    const result = response.text;
    // console.log(result);
    return result;
  } catch (error) {
    console.error("An error occurred:", error);
    return "Error generating proposal";
  }
}

//Email configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//function for pdf generation
function generatePDF(data) {
  try {
    const doc = new PDFDocument();
    const filepath = path.join(__dirname, "proposal.pdf");
    doc.pipe(fs.createWriteStream(filepath));
    doc.font("Times-Roman").fontSize(12).text(data);
    doc.end();
  } catch (error) {
    console.log("Error generating PDF: " + error);
  }
}

//function for chatting with gemini
const chatHistory = [
  {
    role: "user",
    parts: [{ text: "Hello" }],
  },
  {
    role: "model",
    parts: [{ text: "Great to meet you. What would you like to know?" }],
  },
];
async function chatWithGemini(question) {
  try {
    chat = ai.chats.create({
      model: "gemini-2.0-flash",
      history: chatHistory,
      config: {
        maxOutputTokens: 350,
      },
    });

    const response = await chat.sendMessage({
      message: question,
    });

    return response.text;
  } catch (error) {
    console.error("An error occurred:", error);
    return "Error in chatbot.";
  }
}

//home route
app.get("/", (req, res) => {
  //   res.send("home route is working");
  res.redirect("/query");
});

//get proposal
app.get("/query", (req, res) => {
  res.render("proposal.ejs");
});

//post proposal
app.post("/query", async (req, res) => {
  try {
    const request = req.body.requirements;
    if (
      typeof request !== "string" ||
      request.trim() === "" ||
      !isNaN(Number(request)) ||
      !/[a-zA-Z0-9]/.test(request)
    ) {
      return res
        .status(400)
        .json({ message: "Requirements must be a non-empty string." });
    }
    const response = await callGemini(request);
    // console.log(response);
    if (response) {
      generatePDF(response);
    }
    res.json(response);
  } catch (error) {
    console.log("Error generating proposal: " + error);
    res.status(500).json("Error generating proposal");
  }
});

//download pdf
app.get("/download", (req, res) => {
  const file = path.join(__dirname, "proposal.pdf");
  res.download(file, "proposal.pdf", (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).send("Error downloading file");
    }
  });
});

//get chatbot
app.get("/chatbot", async (req, res) => {
  res.render("chatbot.ejs");
});

//post chatbot
app.post("/chatbot", async (req, res) => {
  try {
    const request = req.body.question;
    if (
      typeof request !== "string" ||
      request.trim() === "" ||
      !isNaN(Number(request)) ||
      !/[a-zA-Z0-9]/.test(request)
    ) {
      return res
        .status(400)
        .json({ message: "question must be a non-empty string." });
    }
    const response = await chatWithGemini(request);
    // console.log(request);
    // console.log(response);
    res.json(response);
  } catch (err) {
    console.log("error: " + err);
  }
});

//send mail
app.post("/mail", async (req, res) => {
  try {
    const receiver = req.body.mailid;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: receiver,
      subject: "Your Project Proposal",
      text: "Please find attached the project proposal generated by Code Crafters.",
      attachments: [
        {
          filename: "proposal.pdf",
          path: path.join(__dirname, "proposal.pdf"),
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      error: "Failed to send email",
      details: error.message,
    });
  }
});

//listener
app.listen(3000, () => {
  console.log("server running");
});
