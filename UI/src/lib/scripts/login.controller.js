import Swal from "sweetalert2";
const apiUrl = "http://localhost:3000";
//const apiUrl = "http://localhost:3000";

export async function loginController() {
  try {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
      Swal.fire({
        icon: "error",
        title: "Oh no!",
        text: "Es necesario ingresar el usuario y contraseña.",
      });
    }

    const response = await fetch(`${apiUrl}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: username,
        password,
      }),
    });

    console.log(response);

    if (response.status === 401) {
      Swal.fire({
        icon: "error",
        title: "Oh no!",
        text: "Usuario o contraseña incorrectos.",
      });
    } else if (response.status !== 200) {
      Swal.fire({
        icon: "error",
        title: "Oh no!",
        text: "Ocurrió un error inesperado.",
      });
    } else {
      const data = await response.json();
      localStorage.setItem("token", data.token);
      window.location.href = "/";
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Oh no!",
      text: "Ocurrió un error inesperado.",
    });
  }
}
