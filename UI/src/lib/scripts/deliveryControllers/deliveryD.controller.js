import Swal from "sweetalert2";

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
    const userMap = new Map([[deliveries.user.userId, deliveries.user.name]]);

    if (deliveries.delivery.length > 0) {
      const deliveriesHtml = deliveries.delivery
        .map(
          (delivery) => `
                <li class="delivery-item">
                    <div class="delivery-header">
                        <span><strong>ID:</strong> ${delivery.deliveryId}</span>
                        <span class="status ${delivery.status.toLowerCase()}">${delivery.status}</span>
                        <button data-id="${delivery.deliveryId}" class="edit-button-driver">Editar</button>
                    </div>
                    <div><strong>Asignado a:</strong> ${userMap.get(delivery.assignedTo) || "Unknown"}</div>
                    <div><strong>Ruta:</strong> ${delivery.route}</div>
                    <div><strong>Ubicacion:</strong> ${delivery.deliveryLocation}</div>
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

export async function editDeliveryDriver(deliveryId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${apiUrl}/deliveries/${deliveryId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    Swal.fire("Error", "Error al conseguir el pedido", "error");
    return;
  }

  const delivery = await response.json();

  const { value: deliveryStatus } = await Swal.fire({
    title: "Cambiar estado del pedido",
    html: `
            <label style="display:block; margin-top: 10px;">Selecciona el estado:</label>
            <div id="swal-status">
                <label><input type="radio" name="status" value="in-progress" ${delivery.status === "in-progress" ? "checked" : ""}> En progreso</label><br>
                <label><input type="radio" name="status" value="completed" ${delivery.status === "completed" ? "checked" : ""}> Completado</label>
            </div>
        `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Actualizar estado",
    preConfirm: () => {
      const selectedStatus = document.querySelector(
        'input[name="status"]:checked',
      ).value;
      return selectedStatus;
    },
  });

  if (deliveryStatus && deliveryStatus !== delivery.status) {
    const updateResponse = await fetch(`${apiUrl}/deliveries/${deliveryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: deliveryStatus,
        deliveredAt: deliveryStatus === "completed" ? new Date() : null,
      }),
    });

    if (updateResponse.ok) {
      Swal.fire({
        title: "Hecho!",
        text: `El estado ha sido actualizado a ${deliveryStatus}.`,
        icon: "success",
      });
      await fetchDeliveriesDriver();
    } else {
      Swal.fire("Error", "Error al actualizar el estado", "error");
    }
  } else if (deliveryStatus === delivery.status) {
    Swal.fire("Info", "El pedido ya tiene el estado seleccionado.", "info");
  }
}

/*
export async function fetchDeliveriesDrivers() {
    try {
        const token = localStorage.getItem("token");
        const today = new Date().toISOString().split("T")[0];
        const response = await fetch(`${apiUrl}/deliveries/active`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });


        const deliveryContainer = document.querySelector('.delivery-list-container');

        if (response.status === 404) {
            deliveryContainer.innerHTML = `
                <li class="delivery-item no-deliveries">
                    <div class="delivery-header">
                        <span>No deliveries scheduled for ${today}.</span>
                    </div>
                </li>
            `;
            return;
        }

        if (!response.ok) {
            deliveryContainer.innerHTML = `
                <li class="delivery-item error-message">
                    <div class="delivery-header">
                        <span>An error occurred while fetching deliveries.</span>
                    </div>
                </li>
            `;
            return;
        }

        const deliveries = await response.json();
        const userMap = new Map(deliveries.users.map(user => [user.userId, user.name]));

        if (deliveries.deliveries.length > 0) {
            const deliveriesHtml = deliveries.deliveries.map(delivery => `
                <li class="delivery-item">
                    <div class="delivery-header">
                        <span><strong>ID:</strong> ${delivery.deliveryId}</span>
                        <span class="status ${delivery.status.toLowerCase()}">${delivery.status}</span>
                        <button data-id="${delivery.deliveryId}" class="edit-button">Edit</button>
                        <button data-id="${delivery.deliveryId}" class="delete-button">Eliminar</button>
                    </div>
                    <div><strong>Assigned to:</strong> ${userMap.get(delivery.assignedTo) || 'Unknown'}</div>
                    <div><strong>Route:</strong> ${delivery.route}</div>
                    <div><strong>Location:</strong> ${delivery.deliveryLocation}</div>
                    <div><strong>Scheduled:</strong> ${new Date(delivery.scheduledTime).toLocaleDateString()}</div>
                </li>
            `).join('');



            deliveryContainer.innerHTML = `<ul class="delivery-list">${deliveriesHtml}</ul>`;
        } else {
            deliveryContainer.innerHTML = `
                <li class="delivery-item no-deliveries">
                    <div class="delivery-header">
                        <span>No deliveries available for ${today}.</span>
                    </div>
                </li>
            `;
        }
    } catch (error) {
        document.querySelector('.delivery-list-container').innerHTML = `
            <li class="delivery-item error-message">
                <div class="delivery-header">
                    <span>An error occurred while fetching deliveries.</span>
                </div>
            </li>
        `;
    }
}
 */
