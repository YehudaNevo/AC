// Chat Application with Mock Backend and Multiple Session History

class ChatApp {
    constructor() {
        this.sessions = {};
        this.currentSessionId = null;
        this.storageKey = 'chatSessions';
        this.currentSessionKey = 'currentSession';
        this.init();
    }

    init() {
        this.loadSessions();

        // Create first session if none exist
        if (Object.keys(this.sessions).length === 0) {
            this.createSession();
        } else {
            // Load the last active session
            const lastSessionId = localStorage.getItem(this.currentSessionKey);
            if (lastSessionId && this.sessions[lastSessionId]) {
                this.currentSessionId = lastSessionId;
            } else {
                // Use first session
                this.currentSessionId = Object.keys(this.sessions)[0];
            }
        }

        this.renderSessions();
        this.switchToSession(this.currentSessionId);
    }

    loadSessions() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.sessions = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading sessions:', e);
                this.sessions = {};
            }
        }
    }

    saveSessions() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.sessions));
        if (this.currentSessionId) {
            localStorage.setItem(this.currentSessionKey, this.currentSessionId);
        }
    }

    createSession(name = null) {
        const sessionId = 'session_' + Date.now();
        const sessionCount = Object.keys(this.sessions).length + 1;

        this.sessions[sessionId] = {
            id: sessionId,
            name: name || `Chat ${sessionCount}`,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.saveSessions();
        this.renderSessions();
        this.switchToSession(sessionId);

        return sessionId;
    }

    deleteSession(sessionId) {
        if (!sessionId || !this.sessions[sessionId]) return;

        // Don't delete if it's the only session
        if (Object.keys(this.sessions).length === 1) {
            alert('Cannot delete the last session. Create a new one first.');
            return;
        }

        if (!confirm('Are you sure you want to delete this chat session?')) {
            return;
        }

        delete this.sessions[sessionId];

        // Switch to another session if current one was deleted
        if (this.currentSessionId === sessionId) {
            const sessionIds = Object.keys(this.sessions);
            this.currentSessionId = sessionIds[0];
            this.switchToSession(this.currentSessionId);
        }

        this.saveSessions();
        this.renderSessions();
    }

    switchToSession(sessionId) {
        if (!sessionId || !this.sessions[sessionId]) return;

        this.currentSessionId = sessionId;
        this.saveSessions();
        this.renderSessions();
        this.renderMessages();

        // Update header title
        const session = this.sessions[sessionId];
        document.getElementById('sessionTitle').textContent = session.name;
    }

    getCurrentSession() {
        return this.sessions[this.currentSessionId];
    }

    showWelcomeMessage() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '<div class="empty-state">Start a conversation by typing a message below!</div>';
    }

    renderSessions() {
        const sessionsList = document.getElementById('sessionsList');
        sessionsList.innerHTML = '';

        // Sort sessions by most recently updated
        const sortedSessions = Object.values(this.sessions).sort((a, b) => {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

        sortedSessions.forEach(session => {
            const sessionDiv = document.createElement('div');
            sessionDiv.className = `session-item ${session.id === this.currentSessionId ? 'active' : ''}`;
            sessionDiv.onclick = () => this.switchToSession(session.id);

            const lastMessage = session.messages[session.messages.length - 1];
            const preview = lastMessage ? lastMessage.content : 'No messages yet';
            const time = this.formatSessionTime(session.updatedAt);

            sessionDiv.innerHTML = `
                <div class="session-avatar">${session.name.charAt(0)}</div>
                <div class="session-info">
                    <div class="session-name">${this.escapeHtml(session.name)}</div>
                    <div class="session-preview">${this.escapeHtml(preview)}</div>
                </div>
                <div class="session-meta">${time}</div>
            `;

            sessionsList.appendChild(sessionDiv);
        });
    }

    formatSessionTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    }

    addMessage(content, isUser = true) {
        const session = this.getCurrentSession();
        if (!session) return;

        const message = {
            id: Date.now() + Math.random(),
            content: content,
            isUser: isUser,
            timestamp: new Date().toISOString()
        };

        session.messages.push(message);
        session.updatedAt = new Date().toISOString();
        this.saveSessions();
        this.renderMessage(message);
        this.renderSessions(); // Update session preview
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
        const session = this.getCurrentSession();
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';

        if (!session || session.messages.length === 0) {
            this.showWelcomeMessage();
            return;
        }

        session.messages.forEach(message => {
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

function createNewSession() {
    chatApp.createSession();
}

function deleteCurrentSession() {
    chatApp.deleteSession(chatApp.currentSessionId);
}

// Focus input on load
window.addEventListener('load', () => {
    document.getElementById('messageInput').focus();
});
