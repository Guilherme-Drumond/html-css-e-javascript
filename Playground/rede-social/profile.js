const form = document.querySelector("#profile-form");
const deleteButton = document.querySelector("#delete-account");

const loadUser = () => {
  const raw = localStorage.getItem("instavida_user");
  return raw ? JSON.parse(raw) : null;
};

const saveUser = (user) => {
  localStorage.setItem("instavida_user", JSON.stringify(user));
};

const showMessage = (message) => {
  let container = document.querySelector(".message");
  if (!container) {
    container = document.createElement("div");
    container.className = "message";
    form.appendChild(container);
  }
  container.textContent = message;
};

const user = loadUser();
if (!user) {
  window.location.href = "login.html";
}

if (form) {
  form.elements.username.value = user.username;
  form.elements.name.value = user.name;
  form.elements.avatar.value = user.avatar || "";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      name: form.elements.name.value,
      avatar: form.elements.avatar.value,
      password: form.elements.password.value || undefined
    };
    try {
      const response = await fetch(`/api/users/${user.id}?user_id=${user.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      const data = await response.json();
      if (!response.ok) {
        showMessage(data.error || "Erro ao atualizar perfil");
        return;
      }
      saveUser(data);
      form.elements.password.value = "";
      showMessage("Perfil atualizado com sucesso.");
    } catch (error) {
      showMessage("Servidor indisponível.");
    }
  });
}

if (deleteButton) {
  deleteButton.addEventListener("click", async () => {
    const confirmed = window.confirm("Deseja realmente excluir sua conta? Essa ação é irreversível.");
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/users/${user.id}/self?user_id=${user.id}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (!response.ok) {
        showMessage(data.error || "Erro ao excluir conta");
        return;
      }
      localStorage.removeItem("instavida_user");
      window.location.href = "register.html";
    } catch (error) {
      showMessage("Servidor indisponível.");
    }
  });
}
