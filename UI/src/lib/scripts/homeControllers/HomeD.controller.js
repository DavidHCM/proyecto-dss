// TODO: Cambiar a request y datos reales
const apiUrl = "http://localhost:3000";
//const apiUrl = "http://localhost:3000";

export async function fetchDeliveriesDriver() {
  try {
    const token = localStorage.getItem("token");

    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    const userId = decodedPayload.userId;

    const today = new Date().toISOString().split("T")[0];

    const response = await fetch(
      `${apiUrl}/deliveries/byDriver?driverId=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const deliveryContainer = document.querySelector(
      ".delivery-list-container",
    );

    if (response.status === 404) {
      deliveryContainer.innerHTML = `
                <li class="delivery-item no-deliveries">
                    <div class="delivery-header">
                        <span>No hay envios para el dia ${today}.</span>
                    </div>
                </li>
            `;
      return;
    }

    if (!response.ok) {
      deliveryContainer.innerHTML = `
                <li class="delivery-item error-message">
                    <div class="delivery-header">
                        <span>Error consiguiendo los envios</span>
                    </div>
                </li>
            `;
      return;
    }
    const deliveriesA = await response.json();
    const deliveriesB = deliveriesA.delivery;
    const user = deliveriesA.user;

    if (deliveriesB.length > 0) {
      const deliveriesHtml = deliveriesB
        .map(
          (delivery) => `
                <li class="delivery-item">
                    <div class="delivery-header">
                        <span><strong>ID:</strong> ${delivery.deliveryId}</span>
                        <span class="status ${delivery.status}">${delivery.status}</span>
                    </div>
                    <div><strong>Asignado a:</strong> ${user.name}</div>
                    <div><strong>Ruta:</strong> ${delivery.route}</div>
                    <div><strong>Locacion:</strong> ${delivery.deliveryLocation}</div>
                    <div><strong>Fecha programada:</strong> ${new Date(delivery.scheduledTime).toLocaleDateString()}</div>
                </li>
            `,
        )
        .join("");

      deliveryContainer.innerHTML = `<ul class="delivery-list">${deliveriesHtml}</ul>`;
    } else {
      deliveryContainer.innerHTML = `
                <li class="delivery-item no-deliveries">
                    <div class="delivery-header">
                        <span>No hay envios para hoy ${today}.</span>
                    </div>
                </li>
            `;
    }
  } catch (error) {
    document.querySelector(".delivery-list-container").innerHTML = `
            <li class="delivery-item error-message">
                <div class="delivery-header">
                    <span>Ocurrio un error.</span>
                </div>
            </li>
        `;
  }
}

export async function fetchNotificationsDriver() {
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
                        <span><strong>ID:</strong> ${notification.notificationId}</span>
                        <span class="status ${notification.status}">${notification.status}</span>
                    </div>
                    <div><strong>Usuario</strong> ${user.name}</div>
                    <div><strong>ID de envio:</strong> ${notification.deliveryId}</div>
                    <div><strong>Tipo:</strong> ${notification.type}</div>
                    <div><strong>Mensage:</strong> ${notification.message}</div>
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
