// Chat application state
let messageCount = 0;
let chatHistory = [];
let lastResponseTime = 0;

// DOM elements
const messageInput = document.getElementById('messageInput');
const chatHistoryDiv = document.getElementById('chatHistory');
const sendButton = document.getElementById('sendButton');
const messageCountSpan = document.getElementById('messageCount');
const lastResponseTimeSpan = document.getElementById('lastResponseTime');
const charCountSpan = document.getElementById('charCount');
const buttonText = document.getElementById('buttonText');
const loadingSpinner = document.getElementById('loadingSpinner');
// Settings modal elements
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsButton = document.getElementById('closeSettingsButton');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    messageInput.addEventListener('input', updateCharCounter);
    messageInput.addEventListener('keypress', handleKeyPress);

    // Load chat history from memory (if page refreshed)
    loadChatHistory();

    // Focus on input
    messageInput.focus();

    // Display welcome message
    if (chatHistory.length === 0) {
        addWelcomeMessage();
    }

    // Settings modal open/close
    if (settingsButton && settingsModal && closeSettingsButton) {
        settingsButton.addEventListener('click', function() {
            settingsModal.classList.remove('hidden');
        });
        closeSettingsButton.addEventListener('click', function() {
            settingsModal.classList.add('hidden');
        });
        // Optional: close modal on outside click
        settingsModal.addEventListener('click', function(e) {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
            }
        });
    }
});

// Handle Enter key press (Ctrl+Enter or Shift+Enter for new line)
async function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
        event.preventDefault();
        await sendMessage();
    }
}

// Update character counter
function updateCharCounter() {
    const currentLength = messageInput.value.length;
    const maxLength = 1000;

    charCountSpan.textContent = currentLength.toString();

    // Update counter styling based on length
    const counterDiv = charCountSpan.parentElement;
    counterDiv.classList.remove('warning', 'danger');

    if (currentLength > maxLength * 0.8) {
        counterDiv.classList.add('warning');
    }
    if (currentLength > maxLength * 0.95) {
        counterDiv.classList.add('danger');
    }
}

// Send message to the API
async function sendMessage() {
    const message = messageInput.value.trim();

    if (!message) {
        showNotification('Please enter a message', 'warning');
        return;
    }

    // Disable UI during request
    setLoadingState(true);

    // Add user message to chat
    addMessageToChat('user', message);

    // Clear input
    messageInput.value = '';
    updateCharCounter();

    // Record start time
    const startTime = performance.now();

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: message
        });

        if (!response.ok) {
            const errorMessage = `HTTP error! status: ${response.status}`;
            console.error('Error:', errorMessage);
            addMessageToChat('bot', `❌ Error: ${errorMessage}`, 0);
            showNotification('Failed to send message', 'error');
            return;
        }

        const data = await response.text();

        // Calculate response time
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        // Update stats
        lastResponseTime = responseTime;
        updateStats();

        // Add bot response to chat
        addMessageToChat('bot', data, responseTime);

    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('bot', `❌ Error: ${error.message}`, 0);
        showNotification('Failed to send message', 'error');
    } finally {
        setLoadingState(false);
        messageInput.focus();
    }
}

// Add message to chat history
function addMessageToChat(sender, message, responseTime = null) {
    const messageObj = {
        id: Date.now(),
        sender: sender,
        message: message,
        timestamp: new Date(),
        responseTime: responseTime
    };

    chatHistory.push(messageObj);

    if (sender === 'user') {
        messageCount++;
        updateStats();
    }

    renderMessage(messageObj);
    scrollToBottom();
    saveChatHistory();
}

// Helper to format milliseconds as mm:ss.mmm
function formatResponseTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;
    let result = '';
    if (minutes > 0) {
        result += `${minutes}m `;
    }
    if (minutes > 0 || seconds > 0) {
        result += `${seconds}s `;
    }
    result += `${milliseconds}ms`;
    return result.trim();
}

// Render a single message
function renderMessage(messageObj) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${messageObj.sender}`;
    messageDiv.setAttribute('data-id', messageObj.id);

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = messageObj.message;

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';

    const timeStr = messageObj.timestamp.toLocaleTimeString();
    if (messageObj.responseTime !== null) {
        timeDiv.innerHTML = `${timeStr} • <span class="response-time">${formatResponseTime(messageObj.responseTime)}</span>`;
    } else {
        timeDiv.textContent = timeStr;
    }

    messageDiv.appendChild(bubble);
    messageDiv.appendChild(timeDiv);

    chatHistoryDiv.appendChild(messageDiv);
}

// Set loading state
function setLoadingState(isLoading) {
    sendButton.disabled = isLoading;
    messageInput.disabled = isLoading;

    if (isLoading) {
        buttonText.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
    } else {
        buttonText.classList.remove('hidden');
        loadingSpinner.classList.add('hidden');
    }
}

// Update statistics
function updateStats() {
    messageCountSpan.textContent = `Messages: ${messageCount}`;
    lastResponseTimeSpan.textContent = `Last response: ${formatResponseTime(lastResponseTime)}`;
}

// Clear chat history
function clearChat() {
    if (chatHistory.length === 0) {
        showNotification('Chat is already empty', 'info');
        return;
    }

    if (confirm('Are you sure you want to clear the chat history?')) {
        chatHistory = [];
        messageCount = 0;
        lastResponseTime = 0;

        chatHistoryDiv.innerHTML = '';
        updateStats();
        saveChatHistory();

        addWelcomeMessage();
        showNotification('Chat cleared', 'success');
    }
}

// Add welcome message
function addWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'message bot';
    welcomeDiv.innerHTML = `
        <div class="message-bubble">
            👋 Welcome to Ollama Chat! I'm ready to help you with questions, coding, creative writing, and more. 
            What would you like to discuss today?
        </div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    chatHistoryDiv.appendChild(welcomeDiv);
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    // Set color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = '#333';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        default:
            notification.style.backgroundColor = '#007bff';
    }

    // Add animation keyframes
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Save chat history to sessionStorage
function saveChatHistory() {
    const chatData = {
        history: chatHistory,
        messageCount: messageCount,
        lastResponseTime: lastResponseTime
    };
    sessionStorage.setItem('ollama-chat-history', JSON.stringify(chatData));
}

// Load chat history from sessionStorage
function loadChatHistory() {
    const saved = sessionStorage.getItem('ollama-chat-history');
    if (saved) {
        try {
            const chatData = JSON.parse(saved);
            chatHistory = chatData.history || [];
            messageCount = chatData.messageCount || 0;
            lastResponseTime = chatData.lastResponseTime || 0;

            // Render all messages
            chatHistory.forEach(msg => {
                msg.timestamp = new Date(msg.timestamp); // Convert back to Date object
                renderMessage(msg);
            });

            updateStats();
            scrollToBottom();
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }
}