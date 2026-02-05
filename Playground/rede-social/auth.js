const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");

const showMessage = (form, message) => {
  let container = form.querySelector(".message");
  if (!container) {
    container = document.createElement("div");
    container.className = "message";
    form.appendChild(container);
  }
  container.textContent = message;
};

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const payload = Object.fromEntries(formData.entries());
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        showMessage(loginForm, data.error || "Erro ao entrar");
        return;
      }
      localStorage.setItem("instavida_user", JSON.stringify(data));
      window.location.href = "index.html";
    } catch (error) {
      showMessage(loginForm, "Servidor indisponível.");
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const payload = Object.fromEntries(formData.entries());
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        showMessage(registerForm, data.error || "Erro ao cadastrar");
        return;
      }
      localStorage.setItem("instavida_user", JSON.stringify(data));
      window.location.href = "profile.html";
    } catch (error) {
      showMessage(registerForm, "Servidor indisponível.");
    }
  });
}
