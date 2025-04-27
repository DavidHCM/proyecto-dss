import Swal from "sweetalert2";

const apiUrl = "http://localhost:3000";
//const apiUrl = "http://localhost:3000";

export async function fetchDeliveries() {
  try {
    const token = localStorage.getItem("token");
    const today = new Date().toISOString().split("T")[0];
    const response = await fetch(`${apiUrl}/deliveries/active`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const deliveryContainer = document.querySelector(
      ".delivery-list-container",
    );

    if (response.status === 404) {
      deliveryContainer.innerHTML = `
                <li class="delivery-item no-deliveries">
                    <div class="delivery-header">
                        <span>No hay envios para hoy ${today}.</span>
                    </div>
                </li>
            `;
      return;
    }

    if (!response.ok) {
      deliveryContainer.innerHTML = `
                <li class="delivery-item error-message">
                    <div class="delivery-header">
                        <span>Un error ha ocurrido.</span>
                    </div>
                </li>
            `;
      return;
    }

    const deliveries = await response.json();
    const userMap = new Map(
      deliveries.users.map((user) => [user.userId, user.name]),
    );

    if (deliveries.deliveries.length > 0) {
      const deliveriesHtml = deliveries.deliveries
        .map(
          (delivery) => `
                    <li class="delivery-item">
                        <div class="delivery-header">
                            <span><strong>ID:</strong> ${delivery.deliveryId}</span>
                            <span class="status ${delivery.status.toLowerCase()}">${delivery.status}</span>
                            <button data-pickup="${delivery.pickupLocation}" data-destination="${delivery.deliveryLocation}" class="select-route-button">
                                Seleccionar Ruta
                            </button>
                            <button data-id="${delivery.deliveryId}" class="edit-button">Editar</button>
                            <button data-id="${delivery.deliveryId}" class="delete-button">Eliminar</button>
                        </div>
                        <div><strong>Asignado a:</strong> ${userMap.get(delivery.assignedTo) || "Desconocido"}</div>
                        <div><strong>Locacion inicio:</strong> ${delivery.pickupLocation}</div>
                        <div><strong>Locacion entrega:</strong> ${delivery.deliveryLocation}</div>
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
                    <span>Un error ha ocurrido.</span>
                </div>
            </li>
        `;
  }
}

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
                        <span>No hay envios para hoy ${today}.</span>
                    </div>
                </li>
            `;
      return;
    }
    if (!response.ok) {
      deliveryContainer.innerHTML = `
                <li class="delivery-item error-message">
                    <div class="delivery-header">
                        <span>Ocurrio un error.</span>
                    </div>
                </li>
            `;
      return;
    }

    const deliveries = await response.json();
    const user = deliveries.user;

    if (deliveries.delivery.length > 0) {
      const deliveriesHtml = deliveries.delivery
        .map(
          (delivery) => `
                    <li class="delivery-item">
                        <div class="delivery-header">
                            <span><strong>ID:</strong> ${delivery.deliveryId}</span>
                            <span class="status ${delivery.status.toLowerCase()}">${delivery.status}</span>
                            <button data-pickup="${delivery.pickupLocation}" data-destination="${delivery.deliveryLocation}" class="select-route-button">
                                Seleccionar Ruta
                            </button>
                            <button data-id="${delivery.deliveryId}" class="edit-button">Editar</button>
                            <button data-id="${delivery.deliveryId}" class="delete-button">Eliminar</button>
                        </div>
                        <div><strong>Asignado a:</strong> ${user ? user.name : "Desconocido"}</div>
                        <div><strong>Locacion inicio:</strong> ${delivery.pickupLocation}</div>
                        <div><strong>Locacion entrega:</strong> ${delivery.deliveryLocation}</div>
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
