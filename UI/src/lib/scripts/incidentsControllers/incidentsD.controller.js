import Swal from "sweetalert2";
const apiUrl = "http://localhost:3000";
//const apiUrl = "http://localhost:3000";

export async function addIncident() {
  const token = localStorage.getItem("token");

  const payloadBase64 = token.split(".")[1];
  const decodedPayload = JSON.parse(atob(payloadBase64));
  const userId = decodedPayload.userId;

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

  if (!response.ok) {
    Swal.fire(
      "Error",
      "No se pudieron obtener las entregas del usuario.",
      "error",
    );
    return;
  }

  const data = await response.json();

  if (!Array.isArray(data.delivery)) {
    console.error("El formato de los datos de entregas es incorrecto:", data);
    Swal.fire(
      "Error",
      "El formato de los datos de entregas es incorrecto.",
      "error",
    );
    return;
  }

  const deliveries = data.delivery;

  const deliveryOptions = deliveries
    .map(
      (delivery) => `
            <option value="${delivery.deliveryId}">
                ${delivery.productDetails.name} - ${delivery.deliveryLocation} (${delivery.status})
            </option>
        `,
    )
    .join("");

  const { value: incidentInfo } = await Swal.fire({
    title: "Reportar incidente",
    html: `
            <label for="swal-delivery-id" style="display:block;">Entrega</label>
            <select id="swal-delivery-id" class="swal2-select">
                <option value="" style="max-height: 100px; overflow-y: auto;">Selecciona una entrega</option>
                ${deliveryOptions}
            </select>

            <label for="swal-type" style="display:block;">Tipo de incidente</label>
            <select id="swal-type" class="swal2-select">
                <option value="damage">Daño</option>
                <option value="delay">Retraso</option>
                <option value="theft">Robo</option>
            </select>

            <label for="swal-description" style="display:block;">Descripción</label>
            <textarea id="swal-description" class="swal2-textarea" placeholder="Detalles del incidente"></textarea>

            <label for="swal-location" style="display:block;">Ubicación</label>
            <input id="swal-location" class="swal2-input" placeholder="Ubicación">
        `,
    focusConfirm: false,
    didOpen: () => {
      const locationInput = document.getElementById("swal-location");

      const autocomplete = new google.maps.places.Autocomplete(locationInput);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        locationInput.value = place.formatted_address || place.name;
      });
    },
    preConfirm: () => {
      return {
        deliveryId: document.getElementById("swal-delivery-id").value,
        type: document.getElementById("swal-type").value,
        description: document.getElementById("swal-description").value,
        location: document.getElementById("swal-location").value,
      };
    },
  });

  if (incidentInfo) {
    const completeIncidentInfo = {
      ...incidentInfo,
      reportedBy: userId,
    };

    const response = await fetch(`${apiUrl}/incident`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(completeIncidentInfo),
    });

    if (response.ok) {
      Swal.fire(
        "Éxito",
        "El incidente ha sido reportado correctamente.",
        "success",
      );
      await fetchByDriver();
    } else {
      Swal.fire("Error", "Hubo un problema al reportar el incidente.", "error");
    }
  }
}

export async function fetchByDriver() {
  try {
    const token = localStorage.getItem("token");

    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    const userId = decodedPayload.userId;

    const response = await fetch(
      `${apiUrl}/incident/byDriver?driverId=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const incidentContainer = document.querySelector(
      ".incident-list-container",
    );

    if (!incidentContainer) {
      throw new Error("El contenedor de incidentes no existe en el DOM.");
    }

    if (response.status === 404) {
      incidentContainer.innerHTML = `
                <li class="incident-item no-incidents">
                    <div class="incident-header">
                        <span>No hay reportes abiertos.</span>
                    </div>
                </li>
            `;
      return;
    }

    if (!response.ok) {
      incidentContainer.innerHTML = `
                <li class="incident-item error-message">
                    <div class="incident-header">
                        <span>Ha sucedido un error.</span>
                    </div>
                </li>
            `;
      return;
    }

    const responseData = await response.json();
    const incidents = responseData.incident || [];

    if (incidents.length > 0) {
      const userMap = new Map([
        [responseData.user.userId, responseData.user.name],
      ]);

      const incidentsHtml = incidents
        .map(
          (incident) => `
                <li class="incident-item">
                    <div class="incident-header">
                        <span><strong>ID:</strong> ${incident.incidentId}</span>
                        <span class="status ${incident.status.toLowerCase()}">${incident.status}</span>
                        
                    </div>
                    <div><strong>Reportado por:</strong> ${userMap.get(incident.reportedBy) || "Unknown"}</div>
                    <div><strong>Descripción:</strong> ${incident.description}</div>
                    <div><strong>Ubicación:</strong> ${incident.location}</div>
                    <div><strong>Creado en:</strong> ${new Date(incident.createdAt).toLocaleDateString()}</div>
                </li>
            `,
        )
        .join("");

      incidentContainer.innerHTML = incidentsHtml;
    } else {
      incidentContainer.innerHTML = `
        <li class="incident-item no-incidents">
            <div class="incident-header">
                <span>No hay incidentes reportados.</span>
            </div>
        </li>
    `;
    }
  } catch (error) {
    console.error("Error fetching incidents:", error);
    document.querySelector(".incident-list-container").innerHTML = `
            <li class="incident-item error-message">
                <div class="incident-header">
                    <span>Ha sucedido un error.</span>
                </div>
            </li>
        `;
  }
}
