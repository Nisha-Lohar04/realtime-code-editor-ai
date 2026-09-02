# 🚀 CodeSync AI

### Real-Time Collaborative Code Editor with AI-Powered Assistance

<p align="left">
  A modern real-time collaborative coding platform where developers can work together in shared coding rooms and use an integrated AI assistant to understand, debug, improve, and document code.
</p>

---

## 📌 Overview

**CodeSync AI** is a full-stack collaborative code editor that combines **real-time code synchronization** with **AI-powered developer assistance**.

Multiple developers can join the same coding room and work together simultaneously. Code changes are synchronized across connected users in real time using **Socket.IO**.

The integrated **AI Code Assistant** helps developers understand their code, identify potential bugs, improve code quality, generate documentation, and ask custom technical questions.

The project brings together **real-time communication**, **collaborative programming**, and **AI-assisted development** into a single modern developer workspace.

---

## ✨ Features

### 🤝 Real-Time Collaboration

- Multiple users can join the same coding room
- Code changes synchronize instantly across connected clients
- Room-based collaborative sessions
- Connected collaborators are visible in the workspace
- Online indicators show active users
- Initial code synchronization for newly connected users

### 🧠 AI Code Assistant

The integrated AI assistant provides intelligent assistance based on the code currently available in the editor.

**Available actions:**

- **Explain Code** — Understand code logic and functionality
- **Find Bugs** — Identify syntax, runtime, and logical issues
- **Improve Code** — Receive suggestions for readability and maintainability
- **Generate Documentation** — Create developer-friendly documentation
- **Ask AI** — Ask custom questions about the current code

### 💬 Rich Markdown Responses

AI responses support structured Markdown content, including:

- Headings
- Lists
- Code blocks
- Bold text
- Tables
- Technical explanations

This makes AI-generated responses easier to read and understand.

### 📋 Copy Functionality

Users can copy AI-generated responses and Room IDs directly using the integrated copy functionality.

### 🌗 Light & Dark Mode

The application supports both **Light Mode** and **Dark Mode**.

The selected theme is stored locally so the user's preference persists across sessions.

### 💻 Language Selection

Users can select different programming languages while working inside the collaborative editor.

### 🏠 Create and Join Coding Rooms

Users can:

- Create a new collaborative room
- Join an existing room using a Room ID
- Enter a username before joining
- Collaborate with other developers in real time

---

## 🏗️ System Architecture

### Real-Time Collaboration Architecture

```text
                    ┌─────────────────────┐
                    │       User A        │
                    │   React Frontend    │
                    └──────────┬──────────┘
                               │
                            Socket.IO
                               │
                    ┌──────────▼──────────┐
                    │                     │
                    │   Node.js Server    │
                    │                     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Socket.IO Server  │
                    └───────┬───────┬─────┘
                            │       │
                 ┌──────────▼─┐   ┌─▼───────────┐
                 │   User B   │   │   User C    │
                 │React Client│   │React Client │
                 └────────────┘   └─────────────┘
```

### AI Request Flow

```text
                ┌──────────────────┐
                │   Code Editor    │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ AI Code Assistant│
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │  Node.js API     │
                │    /api/ai       │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │   AI Processing  │
                └──────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

- **React.js**
- **React Router**
- **CodeMirror**
- **Socket.IO Client**
- **React Markdown**
- **Lucide React**
- **React Hot Toast**

### Backend

- **Node.js**
- **Express.js**
- **Socket.IO**

### Real-Time Communication

- **WebSockets**
- **Socket.IO**

### AI Integration

The AI backend processes:

- Source code
- Selected programming language
- AI action
- Custom developer questions

The generated response is returned to the frontend and rendered using **Markdown**.

---

## 📂 Project Structure

```text
realtime-code-editor-ai
│
├── public
│   ├── code-sync.png
│   └── ...
│
├── src
│   │
│   ├── components
│   │   ├── AIAssistant.js
│   │   ├── Client.js
│   │   └── Editor.js
│   │
│   ├── pages
│   │   ├── EditorPage.js
│   │   └── Home.js
│   │
│   ├── Actions.js
│   ├── App.css
│   ├── App.js
│   ├── index.css
│   ├── index.js
│   └── socket.js
│
├── server.js
├── package.json
├── package-lock.json
├── yarn.lock
└── README.md
```

---

## 🔄 Real-Time Collaboration Flow

```text
User joins a room
        │
        ▼
Socket connection established
        │
        ▼
User information shared with room
        │
        ▼
Connected users updated
        │
        ▼
User modifies code
        │
        ▼
CODE_CHANGE event emitted
        │
        ▼
Server broadcasts update
        │
        ▼
Other users receive updated code
        │
        ▼
Editors synchronize in real time
```

---

## 🧠 AI Assistant Workflow

```text
Developer writes code
        │
        ▼
Select AI Action
        │
        ├── Explain Code
        ├── Find Bugs
        ├── Improve Code
        ├── Generate Documentation
        └── Ask AI
        │
        ▼
Frontend sends request
        │
        ▼
POST /api/ai
        │
        ▼
Backend processes request
        │
        ▼
AI generates response
        │
        ▼
Response returned to frontend
        │
        ▼
Markdown rendered in AI panel
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js**
- **npm** or **Yarn**
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/Nisha-Lohar04/realtime-code-editor-ai.git
```

### 2. Navigate to the Project Directory

```bash
cd realtime-code-editor-ai
```

### 3. Install Dependencies

Using npm:

```bash
npm install
```

Or using Yarn:

```bash
yarn install
```

---

## ▶️ Running the Application

The application requires both the **backend server** and **frontend application** to run.

### Start the Backend Server

```bash
npm run server:dev
```

The backend runs on:

```text
http://localhost:5000
```

### Start the React Frontend

Open another terminal and run:

```bash
npm run start:front
```

The frontend typically runs on:

```text
http://localhost:3000
```

---

## 🖥️ How to Use CodeSync AI

### Step 1 — Open the Application

Launch the frontend application in your browser.

### Step 2 — Create or Join a Room

You can either:

- Enter an existing **Room ID**
- Create a new collaborative room

Enter your username and join the workspace.

### Step 3 — Start Collaborating

Once inside the room:

- Write code in the editor
- Share the Room ID with collaborators
- See connected users
- Collaborate on the same code in real time

### Step 4 — Use the AI Assistant

Select one of the available AI actions:

- **Explain Code**
- **Find Bugs**
- **Improve Code**
- **Generate Documentation**

You can also ask a custom question about the code currently available in the editor.

---

## 🎨 User Interface

CodeSync AI focuses on providing a **clean, modern, and developer-focused workspace**.

### Interface Highlights

- Modern collaborative workspace
- Compact developer-focused layout
- Resizable workspace panels
- Integrated AI assistant
- Connected users sidebar
- Online status indicators
- Light and dark themes
- Responsive design
- Scrollable AI responses
- Markdown rendering
- Table rendering
- Copy functionality

---

## 📸 Screenshots

> Add screenshots of the application here to showcase the main features and user interface.

### 🏠 Home Page

```text
screenshots/home-page.png
```

### 💻 Collaborative Editor

```text
screenshots/editor-workspace.png
```

### 🧠 AI Code Assistant

```text
screenshots/ai-assistant.png
```

### 🤝 Real-Time Collaboration

```text
screenshots/realtime-collaboration.png
```

Once the screenshots are added, they can be displayed like this:

```markdown
![Home Page](screenshots/home-page.png)

![Collaborative Editor](screenshots/editor-workspace.png)

![AI Code Assistant](screenshots/ai-assistant.png)

![Real-Time Collaboration](screenshots/realtime-collaboration.png)
```

---

## 🔑 Core Functionality

### Room-Based Collaboration

Each collaborative session operates inside a unique room.

Users connected to the same room can:

- View connected collaborators
- Edit shared code
- Receive real-time updates
- Synchronize code with newly joined users

### Socket Events

The application uses Socket.IO events to manage collaboration.

```text
JOIN
JOINED
DISCONNECTED
CODE_CHANGE
SYNC_CODE
LEAVE
```

These events handle:

- User connections
- User disconnections
- Room management
- Code synchronization
- Initial editor synchronization

---

## 🌟 Key Highlights

- ⚡ **Real-Time Code Collaboration**
- 🤝 **Multi-User Coding Rooms**
- 🧠 **AI-Powered Code Assistance**
- 🐛 **Automated Bug Analysis**
- ✨ **Code Improvement Suggestions**
- 📄 **Documentation Generation**
- 💬 **Custom AI Questions**
- 📝 **Markdown & Table Rendering**
- 🌗 **Light / Dark Theme**
- 📋 **Copy Functionality**
- 🟢 **Online User Indicators**
- 💻 **Modern Developer Workspace**

---

## 🔮 Future Improvements

Potential enhancements for future versions include:

- [ ] Integrated code execution terminal
- [ ] Support for additional programming languages
- [ ] User authentication
- [ ] Persistent rooms
- [ ] Database integration
- [ ] Code version history
- [ ] Collaborative chat
- [ ] File explorer
- [ ] Multiple file support
- [ ] AI code generation
- [ ] AI-powered code review
- [ ] Cloud deployment
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Role-based collaboration

---

## 🎯 Project Goals

The goal of **CodeSync AI** is to explore and combine modern software engineering technologies to build an intelligent collaborative development environment.

The project demonstrates practical concepts including:

- **Real-time systems**
- **WebSockets**
- **Collaborative applications**
- **Modern React development**
- **Backend API development**
- **AI-assisted developer tools**
- **Interactive developer experiences**

By combining these technologies, CodeSync AI demonstrates how **AI capabilities can be integrated into traditional software applications to create smarter and more productive developer workflows**.

---

<p align="center">
  Built with ❤️ using React, Node.js, Socket.IO, CodeMirror, and AI-powered developer tools.
</p>
