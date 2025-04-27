import Swal from "sweetalert2";
const apiUrl = "http://localhost:3000";
//const apiUrl = "http://localhost:3000";

export async function fetchIncidentsOpen() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${apiUrl}/incident/OpenIncidents`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

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
    const userMap = new Map(
      responseData.user.map((user) => [user.userId, user.name]),
    );

    if (incidents.length > 0) {
      const incidentsHtml = incidents
        .map(
          (incident) => `
                <li class="incident-item">
                    <div class="incident-header">
                        <span><strong>ID:</strong> ${incident.incidentId}</span>
                        <span class="status ${incident.status.toLowerCase()}">${incident.status}</span>
                        <div class="button-group">
                            <button data-id="${incident.incidentId}" class="edit-button">Editar</button>
                            <button data-id="${incident.incidentId}" class="delete-button">Eliminar</button>
                        </div>
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

export async function fetchAllIncidents() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${apiUrl}/incident/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

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
    const userMap = new Map(
      responseData.user.map((user) => [user.userId, user.name]),
    );

    if (incidents.length > 0) {
      const incidentsHtml = incidents
        .map(
          (incident) => `
                <li class="incident-item">
                    <div class="incident-header">
                        <span><strong>ID:</strong> ${incident.incidentId}</span>
                        <span class="status ${incident.status.toLowerCase()}">${incident.status}</span>
                        <div class="button-group">
                            <button data-id="${incident.incidentId}" class="edit-button">Editar</button>
                            <button data-id="${incident.incidentId}" class="delete-button">Eliminar</button>
                        </div>
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

export async function handleDeleteIncident(incidentId) {
  const confirmResult = await Swal.fire({
    title: "¿Estás seguro?",
    text: `Esta acción eliminará el incidente con ID ${incidentId}.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (confirmResult.isConfirmed) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/incident/${incidentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      console.log(response.statusText);
      if (!response.ok) {
        throw new Error(
          `Error al eliminar el incidente: ${response.statusText}`,
        );
      }

      Swal.fire(
        "Eliminado",
        "El incidente ha sido eliminado correctamente.",
        "success",
      );
    } catch (error) {
      console.log(error);
      console.log(error.message);
      Swal.fire(
        "Error",
        `No se pudo eliminar el incidente. ${error.message}`,
        "error",
      );
    }
  }
}

export async function handleEditIncident(incidentId) {
  const { value: formValues } = await Swal.fire({
    title: "Editar Incidente",
    html: `
            <label for="edit-description" style="display:block;">Descripción:</label>
            <input id="edit-description" class="swal2-input" placeholder="Descripción">
            
            <label for="edit-location" style="display:block;">Ubicación:</label>
            <input id="edit-location" class="swal2-input" placeholder="Ubicación">
        `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Guardar",
    didOpen: () => {
      const locationInput = document.getElementById("edit-location");

      const autocomplete = new google.maps.places.Autocomplete(locationInput);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        locationInput.value = place.formatted_address || place.name;
      });
    },
    preConfirm: () => {
      const description = document.getElementById("edit-description").value;
      const location = document.getElementById("edit-location").value;

      if (!description || !location) {
        Swal.showValidationMessage("Ambos campos son obligatorios");
        return null;
      }

      return { description, location };
    },
  });

  if (formValues) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/incident/${incidentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formValues),
      });

      if (!response.ok) {
        throw new Error(`Error al editar el incidente: ${response.statusText}`);
      }

      Swal.fire(
        "Editado",
        "El incidente ha sido actualizado correctamente.",
        "success",
      );
    } catch (error) {
      Swal.fire(
        "Error",
        `No se pudo editar el incidente. ${error.message}`,
        "error",
      );
    }
  }
}
