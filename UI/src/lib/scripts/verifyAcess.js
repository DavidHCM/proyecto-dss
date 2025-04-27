import Swal from "sweetalert2";
const apiUrl = "http://localhost:3000";
//const apiUrl = "http://localhost:3000";

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export async function getUserType() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token no encontrado");
    }
    let user = parseJwt(token);
    return user.role;
  } catch (error) {
    window.location.href = "/login";
    return false;
  }
}

export async function authMiddleware(shouldRedirect = true) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token no encontrado");
    }

    const response = await fetch(`${apiUrl}/auth`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Autenticación fallida");
    }

    return true;
  } catch (error) {
    if (shouldRedirect) {
      Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: error.message || "Ha ocurrido un error en la autenticación",
      });
      window.location.href = "/login";
    }
    return false;
  }
}
