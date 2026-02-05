const storyContainer = document.querySelector("#stories");
const postsContainer = document.querySelector("#posts");
const suggestionsContainer = document.querySelector("#suggestions");
const profileName = document.querySelector("#profile-username");
const profileFullName = document.querySelector("#profile-name");
const profileAvatar = document.querySelector("#profile-avatar");
const loginLink = document.querySelector("#login-link");
const profileLink = document.querySelector("#profile-link");

const gradients = {
  "gradient-1": "linear-gradient(120deg, #ffd3b6, #d5e9f6, #c7b2ff)",
  "gradient-2": "linear-gradient(120deg, #d0f4de, #fef9c3, #fbcfe8)",
  "gradient-3": "linear-gradient(120deg, #c2e9fb, #a1c4fd, #fbc2eb)"
};

const fallbackData = {
  currentUser: { username: "joaopaulo", name: "João Paulo Santos", avatar: "JP" },
  stories: [
    { username: "aline", avatar: "AL" },
    { username: "moraes", avatar: "MO" },
    { username: "rafa", avatar: "RA" },
    { username: "leticia", avatar: "LE" },
    { username: "caique", avatar: "CA" }
  ],
  posts: [
    {
      username: "aline",
      avatar: "AL",
      caption: "Sol de fim de tarde com vista incrível. #vida #paisagem",
      image_url: "gradient-1",
      likes: 1284
    },
    {
      username: "moraes",
      avatar: "MO",
      caption: "Café, laptop e ideias novas para o projeto de hoje.",
      image_url: "gradient-2",
      likes: 980
    }
  ],
  suggestions: [
    { username: "vitoria", avatar: "VI" },
    { username: "lucas", avatar: "LU" },
    { username: "dani", avatar: "DA" }
  ]
};

function createAvatar(avatar, username) {
  const avatarElement = document.createElement("div");
  avatarElement.className = "avatar";
  avatarElement.textContent = avatar || username.slice(0, 2).toUpperCase();
  return avatarElement;
}

function renderStories(stories) {
  storyContainer.innerHTML = "";
  stories.forEach((story) => {
    const storyCard = document.createElement("div");
    storyCard.className = "story";

    const avatar = createAvatar(story.avatar, story.username);
    const username = document.createElement("span");
    username.textContent = `@${story.username}`;

    storyCard.appendChild(avatar);
    storyCard.appendChild(username);
    storyContainer.appendChild(storyCard);
  });
}

function renderPosts(posts) {
  postsContainer.innerHTML = "";
  posts.forEach((post) => {
    const article = document.createElement("article");
    article.className = "post";

    const header = document.createElement("header");
    const avatar = createAvatar(post.avatar, post.username);
    const userInfo = document.createElement("div");
    const username = document.createElement("strong");
    username.textContent = `@${post.username}`;
    const location = document.createElement("span");
    location.textContent = "Brasil";
    userInfo.appendChild(username);
    userInfo.appendChild(location);

    const more = document.createElement("button");
    more.className = "more";
    more.textContent = "•••";

    header.appendChild(avatar);
    header.appendChild(userInfo);
    header.appendChild(more);

    const photo = document.createElement("div");
    photo.className = "photo";
    photo.style.background = gradients[post.image_url] || gradients["gradient-1"];

    const actions = document.createElement("div");
    actions.className = "post-actions";
    actions.innerHTML = "<button>❤</button><button>💬</button><button>↗</button>";

    const info = document.createElement("div");
    info.className = "post-info";
    info.innerHTML = `
      <strong>${post.likes || 0} curtidas</strong>
      <p><strong>@${post.username}</strong> ${post.caption}</p>
      <a href="#">Ver todos os comentários</a>
    `;

    article.appendChild(header);
    article.appendChild(photo);
    article.appendChild(actions);
    article.appendChild(info);

    postsContainer.appendChild(article);
  });
}

function renderSuggestions(suggestions) {
  suggestionsContainer.innerHTML = "";
  suggestions.forEach((user) => {
    const suggestion = document.createElement("div");
    suggestion.className = "suggestion";

    const avatar = createAvatar(user.avatar, user.username);
    const info = document.createElement("div");
    const username = document.createElement("strong");
    username.textContent = `@${user.username}`;
    const sub = document.createElement("span");
    sub.textContent = "Sugestão do InstaVida";
    info.appendChild(username);
    info.appendChild(sub);

    const button = document.createElement("button");
    button.textContent = "Seguir";

    suggestion.appendChild(avatar);
    suggestion.appendChild(info);
    suggestion.appendChild(button);

    suggestionsContainer.appendChild(suggestion);
  });
}

function applyFeed(data) {
  if (data.currentUser) {
    profileName.textContent = `@${data.currentUser.username}`;
    profileFullName.textContent = data.currentUser.name;
    profileAvatar.textContent = data.currentUser.avatar;
  }

  renderStories(data.stories || []);
  renderPosts(data.posts || []);
  renderSuggestions(data.suggestions || []);
}

async function loadFeed() {
  try {
    const response = await fetch("/api/feed");
    if (!response.ok) {
      throw new Error("Resposta inválida do servidor");
    }
    const data = await response.json();
    applyFeed(data);
  } catch (error) {
    console.warn("Usando dados locais por falta de backend", error);
    applyFeed(fallbackData);
  }
}

loadFeed();

const storedUser = localStorage.getItem("instavida_user");
if (storedUser) {
  if (loginLink) {
    loginLink.textContent = "Sair";
    loginLink.href = "#";
    loginLink.addEventListener("click", (event) => {
      event.preventDefault();
      localStorage.removeItem("instavida_user");
      window.location.reload();
    });
  }
} else if (profileLink) {
  profileLink.textContent = "Cadastrar";
  profileLink.href = "register.html";
}
