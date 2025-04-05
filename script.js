// Configuration
const users = [
    { username: "bigyan", password: "10" },
    { username: "bigyan", password: "dai" },
    { username: "dhoggarey", password: "bigyandai" }
];

const groups = ["General", "Work", "Friends"];

// App state
let currentUser = null;
let currentChat = null;
let chatType = null;
let player = null;

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatInterface = document.getElementById('chat-interface');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const privateChatsList = document.getElementById('private-chats');
const groupChatsList = document.getElementById('group-chats');
const chatMessages = document.getElementById('chat-messages');
const currentChatName = document.getElementById('current-chat-name');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatTab = document.getElementById('chat-tab');
const feedTab = document.getElementById('feed-tab');
const chatSection = document.getElementById('chat-section');
const feedSection = document.getElementById('feed-section');
const feedPosts = document.getElementById('feed-posts');
const postInput = document.getElementById('post-input');
const postBtn = document.getElementById('post-btn');
const mediaUpload = document.getElementById('media-upload');
const youtubePlayer = document.getElementById('youtube-player');
const youtubeUrl = document.getElementById('youtube-url');
const playBtn = document.getElementById('play-btn');
const userInitial = document.getElementById('user-initial');

// Initialize the app
function init() {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = storedUser;
        showChatInterface();
        loadChats();
        initUserAvatar();
    }
    
    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    chatTab.addEventListener('click', showChatTab);
    feedTab.addEventListener('click', showFeedTab);
    postBtn.addEventListener('click', createPost);
    postInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') createPost();
    });
    playBtn.addEventListener('click', playYouTubeVideo);
    
    // Initialize YouTube Player
    loadYouTubeAPI();
    
    // Listen for storage events
    window.addEventListener('storage', handleStorageEvent);
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = username;
        localStorage.setItem('currentUser', currentUser);
        showChatInterface();
        loadChats();
        initUserAvatar();
        loginError.style.opacity = '0';
    } else {
        loginError.textContent = 'Invalid username or password';
        loginError.style.opacity = '1';
    }
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    loginScreen.classList.remove('hidden');
    chatInterface.classList.add('hidden');
    usernameInput.value = '';
    passwordInput.value = '';
}

// Show chat interface
function showChatInterface() {
    loginScreen.classList.add('hidden');
    chatInterface.classList.remove('hidden');
}

// Load available chats
function loadChats() {
    privateChatsList.innerHTML = '';
    groupChatsList.innerHTML = '';
    
    // Private chats
    users.forEach(user => {
        if (user.username !== currentUser) {
            const chatItem = document.createElement('button');
            chatItem.className = 'w-full text-left p-2 rounded hover:bg-gray-700 flex items-center';
            chatItem.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white mr-2">
                    ${user.username.charAt(0).toUpperCase()}
                </div>
                <span>${user.username}</span>
            `;
            chatItem.addEventListener('click', () => openChat('private', user.username));
            privateChatsList.appendChild(chatItem);
        }
    });
    
    // Group chats
    groups.forEach(group => {
        const groupItem = document.createElement('button');
        groupItem.className = 'w-full text-left p-2 rounded hover:bg-gray-700 flex items-center';
        groupItem.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2">
                <i class="fas fa-users"></i>
            </div>
            <span>${group}</span>
        `;
        groupItem.addEventListener('click', () => openChat('group', group));
        groupChatsList.appendChild(groupItem);
    });
}

// Open a chat
function openChat(type, name) {
    chatType = type;
    currentChat = name;
    currentChatName.textContent = name;
    messageInput.disabled = false;
    sendBtn.disabled = false;
    loadMessages();
}

// Load messages
function loadMessages() {
    chatMessages.innerHTML = '';
    
    const chatKey = chatType === 'private' 
        ? `private_chat_${getPrivateChatKey(currentUser, currentChat)}`
        : `group_chat_${currentChat}`;
    
    const messages = JSON.parse(localStorage.getItem(chatKey)) || [];
    
    if (messages.length === 0) {
        chatMessages.innerHTML = '<div class="text-center text-gray-500 py-10">No messages yet</div>';
        return;
    }
    
    messages.forEach(msg => {
        const isCurrentUser = msg.sender === currentUser;
        const messageDiv = document.createElement('div');
        messageDiv.className = `mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`;
        
        messageDiv.innerHTML = `
            <div class="max-w-xs lg:max-w-md">
                <div class="${isCurrentUser ? 'chat-bubble-sent' : 'chat-bubble-received'} p-3 rounded-lg">
                    ${msg.text}
                </div>
                <div class="text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}">
                    ${new Date(msg.timestamp).toLocaleTimeString()} • ${msg.sender}
                </div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
    });
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message
function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentChat || !currentUser) return;
    
    const message = {
        sender: currentUser,
        text: text,
        timestamp: new Date().toISOString()
    };
    
    const chatKey = chatType === 'private' 
        ? `private_chat_${getPrivateChatKey(currentUser, currentChat)}`
        : `group_chat_${currentChat}`;
    
    const messages = JSON.parse(localStorage.getItem(chatKey)) || [];
    messages.push(message);
    localStorage.setItem(chatKey, JSON.stringify(messages));
    
    messageInput.value = '';
    loadMessages();
    localStorage.setItem('lastUpdate', Date.now().toString());
}

// Tab switching
function showChatTab() {
    chatSection.classList.remove('hidden');
    feedSection.classList.add('hidden');
    chatTab.classList.add('active');
    feedTab.classList.remove('active');
}

function showFeedTab() {
    chatSection.classList.add('hidden');
    feedSection.classList.remove('hidden');
    chatTab.classList.remove('active');
    feedTab.classList.add('active');
    loadFeedPosts();
}

// Feed functionality
function loadFeedPosts() {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    feedPosts.innerHTML = '';
    
    if (posts.length === 0) {
        feedPosts.innerHTML = '<div class="text-center text-gray-500 py-10">No posts yet. Be the first to share!</div>';
        return;
    }
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-card';
        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-avatar">${post.author.charAt(0).toUpperCase()}</div>
                <div>
                    <div class="font-semibold">${post.author}</div>
                    <div class="text-xs text-gray-500">${new Date(post.timestamp).toLocaleString()}</div>
                </div>
            </div>
            <p class="post-text">${post.text}</p>
            ${post.media ? `<img src="${post.media}" class="post-media">` : ''}
            <div class="post-actions">
                <div class="post-action">
                    <i class="fas fa-heart mr-1"></i>
                    <span>${post.likes || 0}</span>
                </div>
                <div class="post-action">
                    <i class="fas fa-comment mr-1"></i>
                    <span>${post.comments ? post.comments.length : 0}</span>
                </div>
            </div>
            <div class="comment-section">
                ${post.comments ? post.comments.map(comment => `
                    <div class="flex items-start mb-2">
                        <div class="post-avatar" style="width:30px;height:30px;font-size:12px;">
                            ${comment.author.charAt(0).toUpperCase()}
                        </div>
                        <div class="ml-2">
                            <div class="font-semibold text-sm">${comment.author}</div>
                            <div class="text-sm">${comment.text}</div>
                        </div>
                    </div>
                `).join('') : ''}
                <div class="comment-input">
                    <input type="text" placeholder="Write a comment..." class="flex-1 p-2 border rounded-l-lg">
                    <button class="px-3 bg-blue-500 text-white rounded-r-lg">Post</button>
                </div>
            </div>
        `;
        feedPosts.appendChild(postElement);
    });
}

function createPost() {
    const text = postInput.value.trim();
    const file = mediaUpload.files[0];
    
    if (!text && !file) return;

    const newPost = {
        id: Date.now(),
        author: currentUser,
        text: text,
        media: file ? URL.createObjectURL(file) : null,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: []
    };

    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.unshift(newPost);
    localStorage.setItem('posts', JSON.stringify(posts));

    postInput.value = '';
    mediaUpload.value = '';
    loadFeedPosts();
}

// YouTube Player
function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '150',
        width: '100%',
        playerVars: {
            'autoplay': 0,
            'controls': 1,
            'disablekb': 0,
            'rel': 0
        }
    });
}

function playYouTubeVideo() {
    const url = youtubeUrl.value.trim();
    if (!url) return;
    
    const videoId = extractYouTubeId(url);
    if (videoId) {
        player.loadVideoById(videoId);
    } else {
        alert('Invalid YouTube URL');
    }
}

function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Helper functions
function getPrivateChatKey(user1, user2) {
    return [user1, user2].sort().join('_');
}

function handleStorageEvent(e) {
    if (e.key === 'lastUpdate' && currentChat) {
        loadMessages();
    }
}

function initUserAvatar() {
    if (currentUser) {
        userInitial.textContent = currentUser.charAt(0).toUpperCase();
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
