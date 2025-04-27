import Swal from "sweetalert2";
import socket from "../socketClient";

const apiUrl = "http://localhost:3000";
//const apiUrl = "http://localhost:3000";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

socket.on("receiveNotification", (data) => {
  Toast.fire({
    icon: "info",
    title: data.message,
  });
});

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
      console.error("Failed to fetch users:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data.map((user) => ({
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function createNotificationModal() {
  const users = await fetchUsers();

  const { value: formValues } = await Swal.fire({
    title: "Crear Notificación",
    html: `
            <div style="margin-bottom: 10px;">
                <label for="message" style="display: block; margin-bottom: 5px;">Mensaje:</label>
                <input id="message" class="swal2-input" placeholder="Escribe tu mensaje">
            </div>

            <div style="margin-bottom: 10px;">
                <label for="type" style="display: block; margin-bottom: 5px;">Tipo:</label>
                <select id="type" class="swal2-select">
                    <option value="all">Para todos</option>
                    <option value="specificUser">Usuario específico</option>
                    <option value="specificRole">Rol específico</option>
                </select>
            </div>

            <div id="user-dropdown-container" style="display: none; margin-bottom: 10px;">
                <label for="userId" style="display: block; margin-bottom: 5px;">Seleccionar Usuario:</label>
                <select id="userId" class="swal2-select">
                    ${users.map((user) => `<option value="${user.userId}">${user.name}</option>`).join("")}
                </select>
            </div>

            <div id="role-dropdown-container" style="display: none; margin-bottom: 10px;">
                <label for="roleId" style="display: block; margin-bottom: 5px;">Seleccionar Rol:</label>
                <select id="roleId" class="swal2-select">
                    <option value="admin">Admins</option>
                    <option value="driver">Drivers</option>
                    <option value="support">Support</option>
                </select>
            </div>
        `,
    preConfirm: () => {
      const message = document.getElementById("message").value;
      const type = document.getElementById("type").value;
      const userId =
        type === "specificUser"
          ? document.getElementById("userId").value
          : null;
      const roleId =
        type === "specificRole"
          ? document.getElementById("roleId").value
          : null;

      if (!message) {
        Swal.showValidationMessage("El mensaje es obligatorio");
        return;
      }

      return {
        message,
        type,
        userId,
        roleId,
        status: "sent",
        createdAt: new Date(),
      };
    },
    didOpen: () => {
      const typeSelect = document.getElementById("type");
      const userDropdown = document.getElementById("user-dropdown-container");
      const roleDropdown = document.getElementById("role-dropdown-container");

      typeSelect.addEventListener("change", () => {
        userDropdown.style.display =
          typeSelect.value === "specificUser" ? "block" : "none";
        roleDropdown.style.display =
          typeSelect.value === "specificRole" ? "block" : "none";
      });
    },
    confirmButtonText: "Crear",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
  });

  if (formValues) {
    console.log("Notificación creada:", formValues);

    socket.emit("sendNotification", formValues);
  }
}

export async function fetchAllNotifications() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${apiUrl}/notification/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const notificationContainer = document.querySelector(
      ".notification-list-container",
    );

    if (response.status === 404) {
      notificationContainer.innerHTML = `
                <li class="notification-item no-notifications">
                    <div class="notification-header">
                        <span>No hay notificaciones disponibles.</span>
                    </div>
                </li>
            `;
      return;
    }

    if (!response.ok) {
      notificationContainer.innerHTML = `
                <li class="notification-item error-message">
                    <div class="notification-header">
                        <span>Error obteniendo las notificaciones</span>
                    </div>
                </li>
            `;
      return;
    }

    const notifications = await response.json();

    if (notifications && notifications.length > 0) {
      const notificationsHtml = notifications
        .map(
          (notification) => `
                <li class="notification-item">
                    <div class="notification-header">
                        <span><strong>ID:</strong> ${notification._id || "N/A"}</span>
                        <span class="status ${notification.status}">${notification.status}</span>
                    </div>
                    ${notification.userId ? `<div><strong>Usuario ID:</strong> ${notification.userId}</div>` : ""}
                    <div><strong>Mensaje:</strong> ${notification.message || "Sin mensaje"}</div>
                    <div><strong>Creado en:</strong> ${new Date(notification.createdAt).toLocaleDateString()}</div>
                </li>
            `,
        )
        .join("");

      notificationContainer.innerHTML = `<ul class="notification-list">${notificationsHtml}</ul>`;
    } else {
      notificationContainer.innerHTML = `
                <p class="no-notifications">No hay notificaciones para hoy.</p>
            `;
    }
  } catch (error) {
    document.querySelector(".notification-list-container").innerHTML = `
            <li class="notification-item error-message">
                <div class="notification-header">
                    <span>Ha ocurrido un error: ${error.message}</span>
                </div>
            </li>
        `;
  }
}

export async function fetchNotificationsUser() {
  try {
    const token = localStorage.getItem("token");

    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    const userId = decodedPayload.userId;

    const today = new Date().toISOString().split("T")[0];

    const response = await fetch(
      `${apiUrl}/notification/byUser?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const notificationContainer = document.querySelector(
      ".notification-list-container",
    );

    if (response.status === 404) {
      notificationContainer.innerHTML = `
                <li class="delivery-item no-deliveries">
                    <div class="delivery-header">
                        <span>No hay notificaciones para el dia ${today}.</span>
                    </div>
                </li>
            `;
      return;
    }

    if (!response.ok) {
      notificationContainer.innerHTML = `
                <li class="delivery-item error-message">
                    <div class="delivery-header">
                        <span>Error consiguiendo las notificaciones</span>
                    </div>
                </li>
            `;
      return;
    }
    const notificationA = await response.json();
    const notificationB = notificationA.notification;
    const user = notificationA.user;

    if (notificationB && notificationB.length > 0) {
      const notificationsHtml = notificationB
        .map(
          (notification) => `
                <li class="notification-item">
                    <div class="notification-header">
                        <span><strong>ID:</strong> ${notification._id || "N/A"}</span>
                        <span class="status ${notification.status}">${notification.status}</span>
                    </div>
                    ${notification.userId ? `<div><strong>Usuario</strong> ${user.name}</div>` : ""}
                    <div><strong>Mensaje:</strong> ${notification.message || "Sin mensaje"}</div>
                    <div><strong>Creado en:</strong> ${new Date(notification.createdAt).toLocaleDateString()}</div>
                </li>
            `,
        )
        .join("");

      notificationContainer.innerHTML = `<ul class="notification-list">${notificationsHtml}</ul>`;
    } else {
      notificationContainer.innerHTML = `
                <p class="no-notifications">No hay notificaciones para hoy.</p>
            `;
    }
  } catch (error) {
    document.querySelector(".notification-list-container").innerHTML = `
            <li class="notification-item error-message">
                <div class="notification-header">
                    <span>Ha sucedido un error.</span>
                </div>
            </li>
        `;
  }
}
