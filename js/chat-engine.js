/**
 * ROOOT CHATBOT ENGINE
 * Powered by Groq API
 * Mode: The Coder (Efficiency)
 */

// Load Config (Simulated Env)
const API_KEY = CONFIG.GROQ_API_KEY;
const API_URL = CONFIG.GROQ_API_URL;
const MODEL = CONFIG.MODEL;

// Persona Database
const AGENTS = [
    { name: "Marco", gender: "M", avatar: "M" },
    { name: "Giulia", gender: "F", avatar: "G" },
    { name: "Alessandro", gender: "M", avatar: "A" },
    { name: "Sofia", gender: "F", avatar: "S" }
];

// Select Random Agent
const currentAgent = AGENTS[Math.floor(Math.random() * AGENTS.length)];

// System Prompt
const SYSTEM_PROMPT = `
Sei ${currentAgent.name}, un assistente virtuale dedicato al supporto clienti per ROOOT.
Sei un ${currentAgent.gender === 'M' ? 'ragazzo' : 'ragazza'} gentile, professionale ed efficiente.
Il tuo compito è spiegare ai visitatori come ROOOT aiuta i fornitori (fruttivendoli, horeca) a gestire gli ordini.
Punti chiave da sottolineare:
1. I clienti ordinano via Telegram (facile per loro).
2. Il fornitore riceve tutto su Google Sheets (ordinato per lui).
3. Risparmio di tempo, niente errori di trascrizione.
Rispondi in modo conciso (max 3 frasi per volta). Usa qualche emoji ma senza esagerare.
Se ti chiedono prezzi o demo, invitali a cliccare i bottoni sul sito.
IMPORTANTE: Se l'utente chiede come contattare il bot o iniziare, rispondi SEMPRE con la frase "clicca qui" formattata esattamente così: [clicca qui](https://t.me/progetto_ai_bot).
`;

// State
let chatHistory = [
    { role: "system", content: SYSTEM_PROMPT }
];

// DOM Elements
const chatTrigger = document.getElementById('rooot-chat-trigger');
const chatPanel = document.getElementById('rooot-chat-panel');
const chatClose = document.getElementById('chat-close');
const messagesContainer = document.getElementById('chat-messages');
const inputField = document.getElementById('chat-input');
const sendBtn = document.getElementById('chat-send');
const agentNameEl = document.getElementById('agent-name');
const agentAvatarEl = document.getElementById('agent-avatar');

// Initialization
function initChat() {
    agentNameEl.textContent = currentAgent.name;
    agentAvatarEl.textContent = currentAgent.avatar;

    // Welcome Message
    setTimeout(() => {
        addMessage(`Ciao! Sono ${currentAgent.name}. Come posso aiutarti a gestire meglio i tuoi ordini oggi? 👋`, 'bot');
    }, 600);
}

// Event Listeners
chatTrigger.addEventListener('click', () => {
    chatPanel.classList.add('active');
    inputField.focus();
});

chatClose.addEventListener('click', () => {
    chatPanel.classList.remove('active');
});

sendBtn.addEventListener('click', sendMessage);
inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Sends Message to Groq
async function sendMessage() {
    const text = inputField.value.trim();
    if (!text) return;

    // UI Updates
    addMessage(text, 'user');
    inputField.value = '';
    showTyping();

    // Context Update
    chatHistory.push({ role: "user", content: text });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: chatHistory,
                temperature: 0.6,
                max_tokens: 250
            })
        });

        if (!response.ok) throw new Error("Errore API");

        const data = await response.json();
        const botReply = data.choices[0].message.content;

        removeTyping();
        addMessage(botReply, 'bot');
        chatHistory.push({ role: "assistant", content: botReply });

    } catch (error) {
        console.error("Groq Error:", error);
        removeTyping();
        addMessage("⚠️ Scusa, ho un problema di connessione. Riprova tra poco.", 'bot');
    }
}

// UI Helpers
function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    // Parse Markdown Links: [text](url) -> <a href="url" target="_blank">text</a>
    const htmlContent = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:inherit;text-decoration:underline;">$1</a>');
    div.innerHTML = htmlContent;
    messagesContainer.appendChild(div);
    scrollToBottom();
}

function showTyping() {
    const div = document.createElement('div');
    div.className = `typing-indicator`;
    div.id = 'typing-indicator';
    div.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
    messagesContainer.appendChild(div);
    scrollToBottom();
}

function removeTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Start
initChat();
