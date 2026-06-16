
# BotTree – Visual Conversation Flow Editor

**Design, test, and visualize chatbot conversation trees** – a playground for building scripts you can later embed anywhere.

---

## What It Does

- **Live Code Editor** – Write dialogue logic in JavaScript (Monaco) with instant preview.
- **3D Graph View** – See your conversation structure as an interactive branching tree (orbit/pan).
- **Chat Simulator** – Test your bot in a realistic messaging interface with typing indicators.
- **Dynamic Actions** – Nodes can call APIs, run custom logic, and update messages on the fly.
- **Input Validation** – Supports typed fields (email, numbers, etc.) with client‑side checks.
- **State Persistence** – Auto‑saves your script locally; migrates on changes.

---

## Tech Stack

- **React** (TypeScript) · **Three.js** · **Monaco Editor**  
- APIs: TheCatAPI, Open‑Meteo, Dev.to, icanhazdadjoke

---

## Getting Started

```bash
git clone https://github.com/10xvick/bottree.git
cd bottree
npm install
npm start
```

Open `http://localhost:3000`.

---

## Script Structure (example)

```javascript
const botData = {
  startNode: 'start',
  nodes: {
    start: {
      q: "Hello! How can I help?",
      options: [
        { label: "Order status", next: 'order' },
        { label: "Tell a joke", next: 'joke' }
      ]
    },
    order: {
      q: "Enter your 6‑digit order number:",
      type: 'input',
      field: 'orderNumber',
      next: 'order_success'
    },
    joke: {
      q: "Fetching a joke...",
      action: (update) => fetch('https://icanhazdadjoke.com/', { headers: { Accept: 'application/json' } })
        .then(r => r.json())
        .then(data => update(data.joke)),
      options: [
        { label: "Another one", next: 'joke' },
        { label: "Back", next: 'start' }
      ]
    }
  }
};
return botData;
```

---

## TODO / Upcoming Features

- **AI Integration** – Connect to LLMs (e.g., OpenAI, local models) to generate dynamic responses or auto‑complete branches.  
- **Export as Package** – Bundle your script + a lightweight runtime so you can embed the bot in any website/webapp with a simple `import` or `<script>` tag.
- **Version History** – Track changes and revert to previous script states.  
- **Node Templates** – Pre‑built components for common patterns (e.g., form collection, FAQ, fallback).  

---