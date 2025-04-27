import Swal from "sweetalert2";

const apiUrl = "http://localhost:3000";
//const apiUrl = "http://localhost:3000";

export async function fetchDrivers() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${apiUrl}/user/drivers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch drivers:", response.statusText);
      return [];
    }

    const drivers = await response.json();
    return drivers;
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return [];
  }
}

export async function addDelivery() {
  const drivers = await fetchDrivers();
  const driverOptions = drivers
    .map((driver) => `<option value="${driver.userId}">${driver.name}</option>`)
    .join("");

  const { value: deliveryInfo } = await Swal.fire({
    title: "Información de envío",
    html: `
            <label for="swal-pickup" style="display:block;">Ubicación de recolección</label>
            <input id="swal-pickup" class="swal2-input" placeholder="Ubicación de recolección">
        
            <label for="swal-delivery" style="display:block;">Ubicación de entrega</label>
            <input id="swal-delivery" class="swal2-input" placeholder="Ubicación de entrega">
            
            <label for="swal-fecha" style="display:block;">Fecha esperada</label>
            <input id="swal-fecha" type="date" class="swal2-input">
            
            <label for="swal-assign" style="display:block;">Asignado a</label>
            <select id="swal-assign" class="swal2-input" style="max-height: 100px; overflow-y: auto;">
                <option value="">Selecciona una opción</option>
                ${driverOptions}
            </select>
        `,
    focusConfirm: false,
    didOpen: () => {
      const pickupInput = document.getElementById("swal-pickup");
      const deliveryInput = document.getElementById("swal-delivery");

      const autocompletePickup = new google.maps.places.Autocomplete(
        pickupInput,
      );
      const autocompleteDelivery = new google.maps.places.Autocomplete(
        deliveryInput,
      );

      autocompletePickup.addListener("place_changed", () => {
        const place = autocompletePickup.getPlace();
        pickupInput.value = place.formatted_address || place.name;
      });

      autocompleteDelivery.addListener("place_changed", () => {
        const place = autocompleteDelivery.getPlace();
        deliveryInput.value = place.formatted_address || place.name;
      });
    },
    preConfirm: () => {
      return {
        pickupLocation: document.getElementById("swal-pickup").value,
        deliveryLocation: document.getElementById("swal-delivery").value,
        scheduledTime: document.getElementById("swal-fecha").value,
        assignedTo: document.getElementById("swal-assign").value,
      };
    },
  });

  if (deliveryInfo) {
    const { value: productInfo } = await Swal.fire({
      title: "Detalles del producto",
      html: `
                <label for="swal-product-name" style="display:block;">Nombre del producto</label>
                <input id="swal-product-name" class="swal2-input" placeholder="Nombre del producto">
            
                <label for="swal-product-description" style="display:block;">Descripción del producto</label>
                <input id="swal-product-description" class="swal2-input" placeholder="Descripción del producto">
                
                <label for="swal-product-quantity" style="display:block;">Cantidad</label>
                <input id="swal-product-quantity" type="number" class="swal2-input" placeholder="Cantidad">

                <label for="swal-product-weight" style="display:block;">Peso</label>
                <input id="swal-product-weight" type="number" class="swal2-input" placeholder="Peso en kg">
            `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          name: document.getElementById("swal-product-name").value,
          description: document.getElementById("swal-product-description")
            .value,
          quantity: document.getElementById("swal-product-quantity").value,
          weight: document.getElementById("swal-product-weight").value,
        };
      },
    });

    if (productInfo) {
      console.log(deliveryInfo);

      const completeInfo = {
        ...deliveryInfo,
        productDetails: productInfo,
      };

      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/deliveries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(completeInfo),
      });

      if (response.ok) {
        Swal.fire("Éxito", "El envío se ha creado correctamente.", "success");
        await fetchDeliveries();
      } else {
        Swal.fire("Error", "Hubo un problema al crear el envío.", "error");
      }
    }
  }
}

export async function deleteDelivery(deliveryId) {
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

        const response = await fetch(`${apiUrl}/deliveries/${deliveryId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          Swal.fire({
            title: "¡Eliminado!",
            text: "El envío ha sido eliminado.",
            icon: "success",
          });
          await fetchDeliveries();
        } else {
          Swal.fire({
            title: "Error",
            text: "Hubo un error al eliminar el envío.",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Error al eliminar la entrega:", error);
        Swal.fire({
          title: "Error",
          text: "Hubo un error al conectar con el servidor.",
          icon: "error",
        });
      }
    }
  });
}

export async function editDelivery(deliveryId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${apiUrl}/deliveries/${deliveryId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    Swal.fire("Error", "Failed to fetch delivery details.", "error");
    return;
  }

  const delivery = await response.json();
  const drivers = await fetchDrivers();
  const driverOptions = drivers
    .map(
      (driver) =>
        `<option value="${driver.userId}" ${driver.userId === delivery.assignedTo ? "selected" : ""}>${driver.name}</option>`,
    )
    .join("");

  const scheduledDate = delivery.scheduledTime
    ? new Date(delivery.scheduledTime).toISOString().split("T")[0]
    : "";

  const { value: deliveryInfo } = await Swal.fire({
    title: "Edit Delivery Information",
    html: `
            <label for="swal-pickup" style="display:block;">Ubicacion a recoger</label>
            <input id="swal-pickup" class="swal2-input" value="${delivery.pickupLocation || ""}" placeholder="Pickup Location">
            
            <label for="swal-delivery" style="display:block;">Ubicacion de entrega</label>
            <input id="swal-delivery" class="swal2-input" value="${delivery.deliveryLocation || ""}" placeholder="Delivery Location">
            
            <label for="swal-fecha" style="display:block;">Dia estimado</label>
            <input id="swal-fecha" type="date" class="swal2-input" value="${scheduledDate}">
            
            <label for="swal-assign" style="display:block;">Asignado a </label>
            <select id="swal-assign" class="swal2-input">
                ${driverOptions}
            </select>

            <label style="display:block; margin-top: 10px;">Status</label>
            <div id="swal-status">
                <label><input type="radio" name="status" value="completed" ${delivery.status === "completed" ? "checked" : ""}> Completed</label>
                <label><input type="radio" name="status" value="canceled" ${delivery.status === "canceled" ? "checked" : ""}> Canceled</label>
                <label><input type="radio" name="status" value="pending" ${delivery.status === "pending" ? "checked" : ""}> Pending</label>
                <label><input type="radio" name="status" value="in-progress" ${delivery.status === "in-progress" ? "checked" : ""}> In Progress</label>
            </div>
        `,
    focusConfirm: false,
    didOpen: () => {
      // Inicializar Autocompletado
      const pickupInput = document.getElementById("swal-pickup");
      const deliveryInput = document.getElementById("swal-delivery");

      const autocompletePickup = new google.maps.places.Autocomplete(
        pickupInput,
      );
      const autocompleteDelivery = new google.maps.places.Autocomplete(
        deliveryInput,
      );

      autocompletePickup.addListener("place_changed", () => {
        const place = autocompletePickup.getPlace();
        pickupInput.value = place.formatted_address || place.name;
      });

      autocompleteDelivery.addListener("place_changed", () => {
        const place = autocompleteDelivery.getPlace();
        deliveryInput.value = place.formatted_address || place.name;
      });
    },
    preConfirm: () => {
      const selectedStatus = document.querySelector(
        'input[name="status"]:checked',
      ).value;
      return {
        pickupLocation: document.getElementById("swal-pickup").value,
        deliveryLocation: document.getElementById("swal-delivery").value,
        scheduledTime:
          document.getElementById("swal-fecha").value || scheduledDate,
        assignedTo: document.getElementById("swal-assign").value,
        status: selectedStatus,
      };
    },
  });

  if (deliveryInfo) {
    const { value: productInfo } = await Swal.fire({
      title: "Edit Product Details",
      html: `
                <label for="swal-product-name" style="display:block;">Nombre de producto</label>
                <input id="swal-product-name" class="swal2-input" value="${delivery.productDetails.name || ""}" placeholder="Product Name">
                
                <label for="swal-product-description" style="display:block;">Descripcion de producto</label>
                <input id="swal-product-description" class="swal2-input" value="${delivery.productDetails.description || ""}" placeholder="Product Description">
                
                <label for="swal-product-quantity" style="display:block;">Cantidad</label>
                <input id="swal-product-quantity" type="number" class="swal2-input" value="${delivery.productDetails.quantity || ""}" placeholder="Quantity">
            `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          productId: delivery.productDetails.productId,
          name: document.getElementById("swal-product-name").value,
          description: document.getElementById("swal-product-description")
            .value,
          quantity: document.getElementById("swal-product-quantity").value,
        };
      },
    });

    if (productInfo) {
      const completeInfo = {
        ...deliveryInfo,
        productDetails: productInfo,
      };

      const updateResponse = await fetch(`${apiUrl}/deliveries/${deliveryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(completeInfo),
      });

      if (updateResponse.ok) {
        Swal.fire("Success", "Envio se ha actualizado.", "success");
        await fetchDeliveries();
      } else {
        Swal.fire("Error", "Falla al actualizar.", "error");
      }
    }
  }
}

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

export async function fetchAllDeliveries() {
  const token = localStorage.getItem("token");
  const apiUrl = "http://localhost:3000";
  //const apiUrl = "http://localhost:3000";

  const response = await fetch(`${apiUrl}/deliveries`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const deliveryContainer = document.querySelector(".delivery-list-container");

  if (response.ok) {
    const { deliveries, users } = await response.json();

    const userMap = new Map(users.map((user) => [user.userId, user.name]));

    if (deliveries.length > 0) {
      deliveryContainer.innerHTML = deliveries
        .map(
          (delivery) => `
                <li class="delivery-item">
                    <div class="delivery-header">
                        <span><strong>ID:</strong> ${delivery.deliveryId}</span>
                        <span class="status ${delivery.status.toLowerCase()}">${delivery.status}</span>
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
    } else {
      deliveryContainer.innerHTML = `<p>No hay entregas disponibles.</p>`;
    }
  } else {
    console.error("Error fetching deliveries:", response.statusText);
    deliveryContainer.innerHTML = `<p>Ocurrió un error al cargar las entregas.</p>`;
  }
}

/*
export async function fetchDeliveries() {
    try {
        const token = localStorage.getItem("token");
        const today = new Date().toISOString().split("T")[0];
        const response = await fetch(`${apiUrl}/deliveries/byDate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                startDate: today,
                endDate: today
            })
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
                        <span class="status ${delivery.status}">${delivery.status}</span>
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
