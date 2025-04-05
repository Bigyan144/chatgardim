let users = [
    { username: "alice", password: "123" },
    { username: "bob", password: "456" },
    { username: "charlie", password: "789" }
  ];
  
  let currentUser = null;
  
  let loginForm = document.getElementById("login-form");
  let usernameInput = document.getElementById("username");
  let passwordInput = document.getElementById("password");
  let loginError = document.getElementById("login-error");
  
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
  
    let enteredUsername = usernameInput.value.trim();
    let enteredPassword = passwordInput.value;
  
    let foundUser = users.find(
      user => user.username === enteredUsername && user.password === enteredPassword
    );
  
    if (foundUser) {
      currentUser = foundUser;
      document.getElementById("login-screen").classList.add("hidden");
      document.getElementById("chat-interface").classList.remove("hidden");
      updateUserInitial();
    } else {
      loginError.textContent = "Invalid username or password.";
      loginError.style.opacity = 1;
    }
  });
  
  function updateUserInitial() {
    let initial = currentUser.username.charAt(0).toUpperCase();
    document.getElementById("user-initial").textContent = initial;
  }
  
  document.getElementById("logout-btn").addEventListener("click", () => {
    currentUser = null;
    document.getElementById("chat-interface").classList.add("hidden");
    document.getElementById("login-screen").classList.remove("hidden");
    usernameInput.value = "";
    passwordInput.value = "";
    loginError.style.opacity = 0;
  });
  
  document.getElementById("chat-tab").addEventListener("click", () => {
    document.getElementById("chat-section").classList.remove("hidden");
    document.getElementById("feed-section").classList.add("hidden");
    document.getElementById("chat-tab").classList.add("active");
    document.getElementById("feed-tab").classList.remove("active");
  });
  
  document.getElementById("feed-tab").addEventListener("click", () => {
    document.getElementById("chat-section").classList.add("hidden");
    document.getElementById("feed-section").classList.remove("hidden");
    document.getElementById("feed-tab").classList.add("active");
    document.getElementById("chat-tab").classList.remove("active");
  });
  
  document.getElementById("post-btn").addEventListener("click", () => {
    let postInput = document.getElementById("post-input");
    let mediaUpload = document.getElementById("media-upload");
  
    let text = postInput.value.trim();
    let file = mediaUpload.files[0];
  
    if (text || file) {
      let postElement = document.createElement("div");
      postElement.classList.add("post-card");
  
      let header = document.createElement("div");
      header.classList.add("post-header");
  
      let avatar = document.createElement("div");
      avatar.classList.add("post-avatar");
      avatar.textContent = currentUser.username.charAt(0).toUpperCase();
  
      let name = document.createElement("div");
      name.textContent = currentUser.username;
  
      header.appendChild(avatar);
      header.appendChild(name);
  
      postElement.appendChild(header);
  
      if (text) {
        let content = document.createElement("div");
        content.classList.add("post-text");
        content.textContent = text;
        postElement.appendChild(content);
      }
  
      if (file) {
        let reader = new FileReader();
        reader.onload = function () {
          let img = document.createElement("img");
          img.classList.add("post-media");
          img.src = reader.result;
          postElement.appendChild(img);
          document.getElementById("feed-posts").prepend(postElement);
        };
        reader.readAsDataURL(file);
      } else {
        document.getElementById("feed-posts").prepend(postElement);
      }
  
      postInput.value = "";
      mediaUpload.value = "";
    }
  });
  
  document.getElementById("play-btn").addEventListener("click", () => {
    let url = document.getElementById("youtube-url").value.trim();
    let id = extractYouTubeID(url);
    if (id) {
      let iframe = document.createElement("iframe");
      iframe.width = "100%";
      iframe.height = "300";
      iframe.src = `https://www.youtube.com/embed/${id}`;
      iframe.frameBorder = 0;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
  
      let playerBox = document.getElementById("youtube-player");
      playerBox.innerHTML = "";
      playerBox.appendChild(iframe);
    }
  });
  
  function extractYouTubeID(url) {
    let match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    return match ? match[1] : null;
  }
  