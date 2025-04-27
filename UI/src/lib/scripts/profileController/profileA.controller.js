import Swal from "sweetalert2";

const apiUrl = "http://localhost:3000";
//const apiUrl = "http://localhost:3000";

let profileImage = "";
let profileName = "[ Nombre del Usuario ]";
let profileCreation = "[ Fecha de Creación ]";
let profileEmail = "[ Correo Electrónico ]";

// TODO: Hacer el cambio de contraseña con link al correo

export async function fetchProfile() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token no encontrado");
    }

    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    const userId = decodedPayload.userId;

    const response = await fetch(`${apiUrl}/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener el perfil: ${response.statusText}`);
    }

    const data = await response.json();

    profileImage = data.profilePic || "default-profile.png";
    profileName = data.name || "[ Nombre del Usuario ]";
    profileCreation = data.createdAt || "[ Fecha de Creación ]";
    profileEmail = data.email || "[ Correo Electrónico ]";

    const profilePicUrl = `${apiUrl}/user/file/${userId}`;

    const profileContainer = document.querySelector(".grow1");
    const profileHTML = `
            <div class="profile-placeholder">
                <div class="avatar-profile" alt="foto de perfil">
                    <img src="${profilePicUrl}" alt="" class="profile-image" />
                </div>
                <button class="update-button" id="changeProfilePictureButton">Cambiar Foto de Perfil</button>
                <div>
                    Nombre:
                </div>
                <div class="profile-name">
                    <span>${profileName}</span>
                </div>
                <div>
                    Fecha de creación:
                </div>
                <div class="profile-creation">
                    <span>${new Date(profileCreation).toLocaleDateString()}</span>
                </div>
                <div>
                    Correo:
                </div>
                <div class="profile-email">
                    <span>${profileEmail}</span>
                </div>
                <div>
                    Cambiar contraseña:
                </div>
                <div class="password-change">
                    <button class="update-button" id="updatePasswordButton">Actualizar contraseña</button>
                </div>
            </div>
        `;

    profileContainer.innerHTML = profileHTML;

    const changePictureButton = document.getElementById(
      "changeProfilePictureButton",
    );
    const updatePasswordButton = document.getElementById(
      "updatePasswordButton",
    );
    updatePasswordButton.addEventListener("click", requestPasswordReset);
    changePictureButton.addEventListener("click", changeProfilePicture);
  } catch (error) {
    console.error("Error al cargar el perfil:", error);
    const profileContainer = document.querySelector(".grow1");
    profileContainer.innerHTML = `<span>Error al cargar el perfil.</span>`;
  }
}

export async function changeProfilePicture() {
  const { value: file } = await Swal.fire({
    title: "Sube tu nueva foto de perfil",
    text: "Arrastra y suelta tu imagen o selecciónala manualmente.",
    input: "file",
    inputAttributes: {
      accept: "image/jpeg, image/png",
      "aria-label": "Sube tu foto de perfil",
    },
    showCancelButton: true,
    confirmButtonText: "Subir",
    cancelButtonText: "Cancelar",
    customClass: {
      popup: "swal2-profile-modal",
    },
  });

  if (file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token no encontrado");
      }

      const payloadBase64 = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const userId = decodedPayload.userId;

      formData.append("userId", userId);

      const response = await fetch(`${apiUrl}/user/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error al subir la imagen: ${response.statusText}`);
      }

      Swal.fire({
        icon: "success",
        title: "Foto de perfil actualizada",
        text: "Tu foto de perfil ha sido cambiada exitosamente.",
      });

      await fetchProfile();
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al subir tu foto de perfil. Inténtalo nuevamente.",
      });
    }
  }
}

export async function requestPasswordReset() {
  const result = await Swal.fire({
    title: "¿Deseas actualizar tu contraseña?",
    text: "Se enviará un enlace a tu correo electrónico para restablecer tu contraseña y se te sacara de tu cuenta.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, enviar enlace",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token no encontrado");
      }

      const payloadBase64 = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const email = decodedPayload.email;
      const userId = decodedPayload.userId;

      const response = await fetch(`${apiUrl}/user/send-reset-password-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, userId }),
      });

      if (!response.ok) {
        throw new Error("No se pudo enviar el correo");
      }

      await Swal.fire({
        icon: "success",
        title: "Correo enviado",
        text: "Revisa tu bandeja de entrada para continuar con el proceso de restablecimiento.",
      });

      localStorage.removeItem("token");
      window.location.reload();
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al enviar el enlace de restablecimiento. Intenta nuevamente.",
      });
    }
  }
}

window.changeProfilePicture = changeProfilePicture;
