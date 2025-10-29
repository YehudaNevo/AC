# Chat App

A WhatsApp-style chat application with multiple session support, mock backend, and persistent history.

## Features

- **WhatsApp-inspired dark theme UI** - Complete with sidebar and chat view
- **Multiple chat sessions** - Create and manage multiple separate conversations
- **Session list sidebar** - View all your chats with message previews and timestamps
- **Mock backend** - Echoes messages back with realistic network delay
- **Persistent history** - All sessions and messages stored in browser localStorage
- **Session management** - Create new chats, switch between them, and delete old ones
- **Responsive design** - Clean and smooth user experience
- **Smart timestamps** - Relative time display (e.g., "5m ago", "2h ago")
- **Auto-save** - All messages and sessions automatically persist

## How to Use

1. **Open** `index.html` in a web browser
2. **Create sessions** - Click the "+" button in the sidebar to create new chat sessions
3. **Switch sessions** - Click on any session in the sidebar to view its messages
4. **Send messages** - Type a message and press Enter or click send
5. **Echo response** - The bot will echo your message back after a short delay
6. **Delete sessions** - Click the trash icon to delete the current session
7. **Persistent storage** - All sessions are saved automatically and will be there when you return

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage for persistence

## Structure

- `index.html` - Main HTML structure with sidebar and chat area
- `style.css` - WhatsApp-style CSS styling with session list
- `app.js` - Chat logic with multi-session management and mock backend
