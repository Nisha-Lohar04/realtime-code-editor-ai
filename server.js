require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
const server = http.createServer(app);

/* =========================================
   GROQ CONFIGURATION
========================================= */

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* =========================================
   MIDDLEWARE
========================================= */

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

app.use(express.static(path.join(__dirname, "build")));

/* =========================================
   SOCKET.IO CONFIGURATION
========================================= */

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

/* =========================================
   SOCKET ACTIONS
========================================= */

const ACTIONS = {
  JOIN: "join",
  JOINED: "joined",
  DISCONNECTED: "disconnected",
  CODE_CHANGE: "code-change",
  SYNC_CODE: "sync-code",
  LEAVE: "leave",
  LANGUAGE_CHANGE: "language-change",
};

/* =========================================
   ROOM DATA
========================================= */

// Stores username against socket ID
const userSocketMap = {};

// Stores latest code for every room
const roomCodeMap = {};

// Stores selected language for every room
const roomLanguageMap = {};

/* =========================================
   GET CONNECTED CLIENTS
========================================= */

function getAllConnectedClients(roomId) {
  const room = io.sockets.adapter.rooms.get(roomId);

  if (!room) return [];

  return Array.from(room).map((socketId) => ({
    socketId,
    username: userSocketMap[socketId],
  }));
}

/* =========================================
   AI CODE ASSISTANT API
========================================= */

app.post("/api/ai", async (req, res) => {
  try {
    const { code, language, action, customQuestion } = req.body;

    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter some code before using the AI assistant.",
      });
    }

    if (!language) {
      return res.status(400).json({
        success: false,
        message: "Programming language is required.",
      });
    }

    if (!action) {
      return res.status(400).json({
        success: false,
        message: "AI action is required.",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is missing from .env file.");

      return res.status(500).json({
        success: false,
        message:
          "Server configuration error: GROQ_API_KEY is missing.",
      });
    }

    console.log("\n========== AI REQUEST ==========");
    console.log("Action:", action);
    console.log("Language:", language);
    console.log("Code length:", code.length);

    if (customQuestion) {
      console.log("Custom Question:", customQuestion);
    }

    console.log("================================\n");

    /* -----------------------------------------
       CREATE AI PROMPT
    ----------------------------------------- */

    let prompt = "";

    switch (action) {
      case "Explain Code":
        prompt = `
You are an expert software engineer.

Explain the following ${language} code clearly and professionally.

Use proper Markdown formatting.

Include:

## 1. What the code does

## 2. How the logic works

## 3. Important functions or components

## 4. Key concepts used

## 5. Simple developer-friendly explanation

Keep the explanation practical and easy to understand.

CODE:

\`\`\`${language}
${code}
\`\`\`
`;
        break;

      case "Find Bugs":
        prompt = `
You are an expert software engineer and code reviewer.

Analyze the following ${language} code carefully.

Look for:

## 1. Bugs

## 2. Runtime errors

## 3. Logical problems

## 4. Edge cases

## 5. Potential security concerns

## 6. Bad practices

For every issue found:

- Explain what the problem is
- Explain why it matters
- Show how to fix it

If there are no major bugs, clearly say so.

Use proper Markdown formatting.

CODE:

\`\`\`${language}
${code}
\`\`\`
`;
        break;

      case "Improve Code":
        prompt = `
You are an expert software engineer.

Review and improve the following ${language} code.

Focus on:

## 1. Readability

## 2. Performance

## 3. Maintainability

## 4. Best practices

## 5. Error handling

## 6. Code structure

First explain the recommended improvements.

Then provide a complete improved version of the code.

Use proper Markdown formatting.

CODE:

\`\`\`${language}
${code}
\`\`\`
`;
        break;

      case "Generate Docs":
        prompt = `
You are a professional technical documentation writer.

Generate clear and professional documentation for the following ${language} code.

Use proper Markdown formatting.

Include:

# Overview

# Purpose

# Functions and Components

# Parameters

# Return Values

# Usage Examples

# Important Notes

Keep the documentation useful for developers.

CODE:

\`\`\`${language}
${code}
\`\`\`
`;
        break;

      case "Ask AI":
        prompt = `
You are an expert AI coding assistant.

A developer has the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

The developer's question is:

"${customQuestion || "Analyze this code and provide helpful guidance."}"

Answer the question accurately and clearly.

Use Markdown formatting where useful.
`;
        break;

      default:
        prompt = `
You are an expert software engineer.

Analyze the following ${language} code and provide useful feedback.

CODE:

\`\`\`${language}
${code}
\`\`\`
`;
    }

    /* -----------------------------------------
       GROQ REQUEST
    ----------------------------------------- */

    console.log("Sending request to Groq...");

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI coding assistant. Provide accurate, practical, concise, and developer-friendly software engineering answers. Always use proper Markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      model: "openai/gpt-oss-20b",

      temperature: 0.3,

      max_tokens: 2000,
    });

    const aiResponse =
      completion.choices?.[0]?.message?.content ||
      "No response was generated.";

    console.log("Groq response received successfully.\n");

    return res.status(200).json({
      success: true,
      response: aiResponse,
    });
  } catch (error) {
    /* =========================================
       ERROR LOGGING
    ========================================= */

    console.error("\n========== GROQ AI ERROR ==========");

    console.error("Status:");
    console.error(error.status || 500);

    console.error("\nMessage:");
    console.error(error.message);

    console.error("\nFull Error:");
    console.error(error);

    console.error("\n====================================\n");

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message ||
        "Something went wrong while processing your AI request.",
    });
  }
});

/* =========================================
   SOCKET.IO EVENTS
========================================= */

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  /* -----------------------------------------
     USER JOINS ROOM
  ----------------------------------------- */

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    console.log("JOIN received:", {
      socketId: socket.id,
      roomId,
      username,
    });

    userSocketMap[socket.id] = username;

    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);

    console.log("Clients in room:", clients);

    // Notify everyone in the room
    io.to(roomId).emit(ACTIONS.JOINED, {
      clients,
      username,
      socketId: socket.id,
    });

    /* -----------------------------------------
       SYNC EXISTING CODE
    ----------------------------------------- */

    if (roomCodeMap[roomId] !== undefined) {
      socket.emit(ACTIONS.SYNC_CODE, {
        code: roomCodeMap[roomId],
      });
    }

    /* -----------------------------------------
       SYNC EXISTING LANGUAGE
    ----------------------------------------- */

    if (roomLanguageMap[roomId] !== undefined) {
      socket.emit(ACTIONS.LANGUAGE_CHANGE, {
        language: roomLanguageMap[roomId],
      });
    }
  });

  /* -----------------------------------------
     CODE CHANGES
  ----------------------------------------- */

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    roomCodeMap[roomId] = code;

    socket.to(roomId).emit(ACTIONS.CODE_CHANGE, {
      code,
    });
  });

  /* -----------------------------------------
     LANGUAGE CHANGES
  ----------------------------------------- */

  socket.on(ACTIONS.LANGUAGE_CHANGE, ({ roomId, language }) => {
    roomLanguageMap[roomId] = language;

    socket.to(roomId).emit(ACTIONS.LANGUAGE_CHANGE, {
      language,
    });

    console.log(
      `Language changed in room ${roomId}: ${language}`
    );
  });

  /* -----------------------------------------
     USER LEAVES
  ----------------------------------------- */

  socket.on(ACTIONS.LEAVE, ({ roomId, username }) => {
    console.log(`${username} is leaving room ${roomId}`);

    socket.leave(roomId);

    delete userSocketMap[socket.id];

    socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
      socketId: socket.id,
      username,
    });

    const clients = getAllConnectedClients(roomId);

    // Clean room data if nobody remains
    if (clients.length === 0) {
      delete roomCodeMap[roomId];
      delete roomLanguageMap[roomId];
    }
  });

  /* -----------------------------------------
     HANDLE BROWSER DISCONNECT
  ----------------------------------------- */

  socket.on("disconnecting", () => {
    const username = userSocketMap[socket.id];

    const rooms = Array.from(socket.rooms).filter(
      (roomId) => roomId !== socket.id
    );

    rooms.forEach((roomId) => {
      socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username,
      });

      const room = io.sockets.adapter.rooms.get(roomId);

      // If this is the last user, clean room data
      if (room && room.size === 1) {
        delete roomCodeMap[roomId];
        delete roomLanguageMap[roomId];
      }
    });

    delete userSocketMap[socket.id];
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

/* =========================================
   REACT PRODUCTION BUILD
========================================= */

// Express 5 compatible fallback
app.get("/{*path}", (req, res) => {
  res.sendFile(
    path.join(__dirname, "build", "index.html")
  );
});

/* =========================================
   START SERVER
========================================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\nServer running on port ${PORT}`);
  console.log(`AI API: http://localhost:${PORT}/api/ai\n`);
});