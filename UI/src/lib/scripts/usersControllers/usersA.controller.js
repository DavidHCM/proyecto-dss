import Swal from "sweetalert2";

const apiUrl = "http://localhost:3000";
//const apiUrl = "http://localhost:3000";

export async function fetchUsers() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${apiUrl}/user/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch drivers:", response.statusText);
      return;
    }

    const data = await response.json();

    const driverListContainer = document.querySelector(".users-list-container");
    if (data.length > 0) {
      const driverItems = data
        .map(
          (user) => `
                <li class="driver-item">
                    <div class="driver-header">
                        <div><strong>ID:</strong> ${user.userId}</div>
                        <span class="status ${user.status}">${user.status}</span>
                           <div class="user-actions">
                            <button class="edit-button" data-id="${user.userId}">Editar</button>
                            <button class="delete-button" data-id="${user.userId}">Eliminar</button>
                        </div>
                    </div>
                    
                    <div><strong>Nombre:</strong> ${user.name}</div>
                    <div><strong>Email:</strong> ${user.email}</div>
                    <div><strong>Rol:</strong> ${user.role}</div>
                    <div><strong>Creado en:</strong> ${new Date(user.createdAt).toLocaleDateString()}</div>
                </li>
            `,
        )
        .join("");

      driverListContainer.innerHTML = `<ul class="driver-list">${driverItems}</ul>`;
    } else {
      driverListContainer.innerHTML = `<p class="no-drivers">No hay conductores disponibles.</p>`;
    }
  } catch (error) {
    console.error("Error fetching drivers:", error);
  }
}

export async function deleteUser(userId) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "¡No podrás revertir esta acción!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${apiUrl}/user/${userId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          Swal.fire({
            title: "¡Eliminado!",
            text: "El usuario ha sido eliminado.",
            icon: "success",
          });
          await fetchUsers();
        } else {
          Swal.fire({
            title: "Error",
            text: "Hubo un error al eliminar el usuario.",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Error al eliminar el usuario:", error);
        Swal.fire({
          title: "Error",
          text: "Hubo un error al conectar con el servidor.",
          icon: "error",
        });
      }
    }
  });
}

export async function editUser(userId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${apiUrl}/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    Swal.fire("Error", "Failed to fetch user details.", "error");
    return;
  }

  const user = await response.json();

  const { value: userInfo } = await Swal.fire({
    title: "Editar Usuario",
    html: `
            <label for="swal-name" style="display:block;">Nombre</label>
            <input id="swal-name" class="swal2-input" value="${user.name || ""}" placeholder="Nombre">

            <label for="swal-email" style="display:block;">Correo Electrónico</label>
            <input id="swal-email" type="email" class="swal2-input" value="${user.email || ""}" placeholder="Correo electrónico">

            <label style="display:block;">Rol</label>
            <div style="margin-bottom: 10px;">
                <label><input type="radio" name="role" value="admin" ${user.role === "admin" ? "checked" : ""}> Admin</label>
                <label><input type="radio" name="role" value="driver" ${user.role === "driver" ? "checked" : ""}> Driver</label>
                <label><input type="radio" name="role" value="support" ${user.role === "support" ? "checked" : ""}> Support</label>
            </div>
        `,
    focusConfirm: false,
    preConfirm: () => {
      const role = document.querySelector('input[name="role"]:checked');
      return {
        name: document.getElementById("swal-name").value,
        email: document.getElementById("swal-email").value,
        role: role ? role.value : null,
      };
    },
  });

  if (userInfo) {
    const updateResponse = await fetch(`${apiUrl}/user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userInfo),
    });

    if (updateResponse.ok) {
      Swal.fire("Éxito", "El usuario ha sido actualizado.", "success");
      await fetchUsers();
    } else {
      Swal.fire("Error", "Falla al actualizar el usuario.", "error");
    }
  }
}

export async function addUsers() {
  const { value: userInfo } = await Swal.fire({
    title: "Agregar Usuario",
    html: `
            <label for="swal-name" style="display:block;">Nombre</label>
            <input id="swal-name" class="swal2-input" placeholder="Nombre del usuario">

            <label for="swal-email" style="display:block;">Correo Electrónico</label>
            <input id="swal-email" type="email" class="swal2-input" placeholder="Correo electrónico">

            <label for="swal-password" style="display:block;">Contraseña</label>
            <input id="swal-password" type="password" class="swal2-input" placeholder="Contraseña (minimo 8 caracteres)">

            <label for="swal-confirm-password" style="display:block;">Confirmar Contraseña</label>
            <input id="swal-confirm-password" type="password" class="swal2-input" placeholder="Confirmar contraseña">

            <label style="display:block;">Rol</label>
            <div style="margin-bottom: 10px;">
                <label><input type="radio" name="role" value="admin"> Admin</label>
                <label><input type="radio" name="role" value="driver"> Driver</label>
                <label><input type="radio" name="role" value="support"> Support</label>
            </div>
        `,
    focusConfirm: false,
    preConfirm: () => {
      const password = document.getElementById("swal-password").value;
      const confirmPassword = document.getElementById(
        "swal-confirm-password",
      ).value;
      const role = document.querySelector('input[name="role"]:checked');

      if (password !== confirmPassword) {
        Swal.showValidationMessage("Las contraseñas no coinciden");
        return null;
      }

      return {
        name: document.getElementById("swal-name").value,
        email: document.getElementById("swal-email").value,
        password: password,
        role: role ? role.value : null,
      };
    },
  });

  if (userInfo) {
    if (!userInfo.role) {
      Swal.fire(
        "Error",
        "Por favor selecciona un rol para el usuario.",
        "error",
      );
      return;
    }

    userInfo.status = "active";

    const token = localStorage.getItem("token");
    const response = await fetch(`${apiUrl}/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userInfo),
    });

    if (response.ok) {
      Swal.fire(
        "Éxito",
        "El usuario se ha registrado correctamente.",
        "success",
      );
      await fetchUsers();
    } else {
      const error = await response.json();
      Swal.fire(
        "Error",
        "Hubo un problema al registrar el usuario." || error.message,
        "error",
      );
    }
  }
}
