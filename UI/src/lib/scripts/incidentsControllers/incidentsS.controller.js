import Swal from "sweetalert2";
const apiUrl = "http://localhost:3000";
//const apiUrl = "http://localhost:3000";

export async function fetchIncidentsOpenS() {
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
