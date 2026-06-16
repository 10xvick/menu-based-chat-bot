# 🤖 BotTree (formerly react-menu-based-chatbot)

> **A Next-Gen, Interactive 3D WebGL Conversation Flow Designer and Simulator.**

BotTree is a visual chatbot editing and prototyping environment. It allows developers and designers to build complex, conditional conversation graphs using a live Monaco-powered JavaScript code editor, simulate them in real-time with a human-like messaging client, and visualize the entire path structure inside a **3D WebGL branching tree layout**.

---

## ✨ Features

### 🎮 3D WebGL Graph Visualizer
- **Native 3D Branching Spine**: Decoupled graph view powered by React Three Fiber and Three.js, rendering physical 3D connecting lines between dialogue nodes.
- **Orbital Camera Controls**: Double-click, drag, pan, or orbit to inspect node clusters and conversational branches from any angle.
- **Semicircle Branching**: Automatically organizes option nodes symmetrically along the X/Y plane below their parents, dynamically resizing edges.
- **Interactive Highlighting**: Active paths, visited nodes, and currently focused steps transition smoothly in scale and opacity, while unused branches are dynamically dimmed.

### ✍️ Monaco Live Code Editor
- **Hot-Reload Scripting**: Build custom dialogues directly in JavaScript with instant rendering in both the 3D visualization canvas and simulated chat.
- **Dynamic Action Methods**: Support for custom `.action(updateQuestion)` functions inside dialogue nodes to fetch external APIs, run calculations, or mutate the visual flow.
- **Automatic State Migration**: Automatically checks and migrates outdated cached script states in local storage on page load.

### 🎭 Human-Like Conversational Simulator
- **Dynamic Typing Capping**: Implements typing speed simulations proportional to the length of the prompt (capped between 700ms and 1500ms).
- **Synchronized UI Hiding**: Disables option clicks and input fields during typing states to prevent premature submission.
- **Dynamic Action Promises**: Forces async fetch steps to hold the typing indicator until responses are resolved, ensuring zero visual content pop-ins or flashing.
- **Smart Back-Navigation**: Popping stack logic scans user-history back to the parent categories, cleanly slicing looped nodes (e.g. clicking "Show me another joke" repeatedly) and returning you safely to the original options menu.
- **Field Type Validation**: Integrated client-side validations for text input fields (e.g. email patterns, 4-digit card inputs, 6-digit order numbers, and positive numeric incomes) with custom bot-typed retry responses.

### 🎨 Premium UI & Styling
- **Mac-Style Header Indicators**: Features glowing, colored macOS circular window status-light controls (green representing expanded chat, red representing collapsed chat).
- **Progressive Blur-Up Image Loading**: Dynamic attachments (such as random cat pictures) load progressively using asynchronous decoding and a customized shimmering skeleton background (`.blur-up-container`), smoothly transitioning to full sharpness upon browser load.
- **High Contrast Links**: Parses raw http/https strings and generates clickable anchor links (`.chat-link`) styled in brand accent colors on bot messages and white on user bubbles for optimal readability.
- **Double Scroll Protection**: Coordinates scroll updates instantly and 50ms later to account for loading layouts and dynamic assets.

---

## 🛠️ Tech Stack
- **Frontend Core**: React 18 (TypeScript), HTML5, Vanilla CSS
- **3D Engine**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **APIs**: TheCatAPI, Open-Meteo, Dev.to, icanhazdadjoke

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/branchbot-studio.git
   cd branchbot-studio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server locally:
   ```bash
   npm start
   ```

The application will launch on `http://localhost:3000`.

---

## 📝 Script Configuration Structure

Conversational scripts are structured as dynamic JSON-compatible JavaScript modules. You can edit them directly in the Monaco editor. Below is a sample schema:

```javascript
const botData = {
  startNode: 'start',
  nodes: {
    start: {
      q: "Hello! How can I assist you today?",
      options: [
        { label: "Check order status", next: 'check_order' },
        { label: "Tell me a joke!", next: 'dad_joke' }
      ]
    },
    check_order: {
      q: "Sure! What is your 6-digit order number?",
      type: 'input',
      field: 'orderNumber',
      next: 'order_success'
    },
    dad_joke: {
      q: "Let me find a good joke...",
      action: (updateQuestion) => {
        return new Promise((resolve) => {
          fetch('https://icanhazdadjoke.com/', { headers: { 'Accept': 'application/json' } })
            .then(res => res.json())
            .then(data => {
              updateQuestion(data.joke || "Failed to load joke!");
              resolve();
            });
        });
      },
      options: [
        { label: "Another one!", next: 'dad_joke' },
        { label: "Back", next: 'start' }
      ]
    }
  }
};

return botData;
```