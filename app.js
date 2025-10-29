// Chat Application with Mock Backend and Session History

class ChatApp {
    constructor() {
        this.messages = [];
        this.storageKey = 'chatHistory';
        this.init();
    }

    init() {
        this.loadHistory();
        this.renderMessages();

        // Show welcome message if no history
        if (this.messages.length === 0) {
            this.showWelcomeMessage();
        }
    }

    showWelcomeMessage() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '<div class="empty-state">Start a conversation by typing a message below!</div>';
    }

    loadHistory() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.messages = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading history:', e);
                this.messages = [];
            }
        }
    }

    saveHistory() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
    }

    addMessage(content, isUser = true) {
        const message = {
            id: Date.now() + Math.random(),
            content: content,
            isUser: isUser,
            timestamp: new Date().toISOString()
        };

        this.messages.push(message);
        this.saveHistory();
        this.renderMessage(message);
        this.scrollToBottom();
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    renderMessage(message) {
        const chatMessages = document.getElementById('chatMessages');

        // Remove empty state if present
        const emptyState = chatMessages.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.isUser ? 'message-user' : 'message-bot'}`;
        messageDiv.innerHTML = `
            <div class="message-content">${this.escapeHtml(message.content)}</div>
            <div class="message-time">${this.formatTime(message.timestamp)}</div>
        `;

        chatMessages.appendChild(messageDiv);
    }

    renderMessages() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';

        if (this.messages.length === 0) {
            this.showWelcomeMessage();
            return;
        }

        this.messages.forEach(message => {
            this.renderMessage(message);
        });

        this.scrollToBottom();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }

    // Mock backend - echoes the message back
    async mockBackendEcho(message) {
        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                resolve({
                    success: true,
                    echo: message
                });
            }, 500 + Math.random() * 500); // 500-1000ms delay
        });
    }

    async sendMessage(content) {
        if (!content || content.trim() === '') {
            return;
        }

        // Add user message
        this.addMessage(content, true);

        // Clear input
        const input = document.getElementById('messageInput');
        input.value = '';
        input.focus();

        // Call mock backend
        try {
            const response = await this.mockBackendEcho(content);

            if (response.success) {
                // Add bot response (echo)
                this.addMessage(response.echo, false);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessage('Error: Could not send message', false);
        }
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all chat history?')) {
            this.messages = [];
            this.saveHistory();
            this.renderMessages();
        }
    }
}

// Initialize the chat app
const chatApp = new ChatApp();

// Global functions for HTML event handlers
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (message) {
        chatApp.sendMessage(message);
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function clearHistory() {
    chatApp.clearHistory();
}

// Focus input on load
window.addEventListener('load', () => {
    document.getElementById('messageInput').focus();
});
