// TODO: Cambiar a request y datos reales
// TODO: Cambiar los errores a sweetAlerts

const apiUrl = "http://localhost:3000";
//const apiUrl = "http://localhost:3000";

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

export function change(destination) {
  window.location.href = `/${destination}`;
}
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
      return;
    }

    const data = await response.json();

    const driverListContainer = document.querySelector(
      ".driver-list-container",
    );
    if (data.length > 0) {
      const driverItems = data
        .map(
          (driver) => `
                <li class="driver-item">
                    <div class="driver-header">
                        <span></span>
                        <span class="status ${driver.status}">${driver.status}</span>
                    </div>
                    <div><strong>Nombre:</strong> ${driver.name}</div>
                    <div><strong>Email:</strong> ${driver.email}</div>
                    <div><strong>Rol:</strong> ${driver.role}</div>
                    <div><strong>Creado en:</strong> ${new Date(driver.createdAt).toLocaleDateString()}</div>
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

export async function fetchDeliveries() {
  try {
    const token = localStorage.getItem("token");

    const today = new Date().toISOString().split("T")[0];

    const response = await fetch(`${apiUrl}/deliveries/byDate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        startDate: today,
        endDate: today,
      }),
    });

    const deliveryContainer = document.querySelector(
      ".delivery-list-container",
    );

    if (response.status === 404) {
      deliveryContainer.innerHTML = `
                <li class="delivery-item no-deliveries">
                    <div class="delivery-header">
                        <span>No hay envios agendados para hoy: ${today}.</span>
                    </div>
                </li>
            `;
      return;
    }

    if (!response.ok) {
      deliveryContainer.innerHTML = `
                <li class="delivery-item error-message">
                    <div class="delivery-header">
                        <span>Ha sucedido un error.</span>
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
                        <span class="status ${delivery.status}">${delivery.status}</span>
                    </div>
                    <div><strong>Asignado a:</strong> ${userMap.get(delivery.assignedTo) || "Unknown"}</div>
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
                        <span>No hay envios para hoy: ${today}.</span>
                    </div>
                </li>
            `;
    }
  } catch (error) {
    document.querySelector(".delivery-list-container").innerHTML = `
            <li class="delivery-item error-message">
                <div class="delivery-header">
                    <span>Error consiguiendo envios.</span>
                </div>
            </li>
        `;
  }
}

export async function fetchIncidents() {
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
      (responseData.user || []).map((user) => [user.userId, user.name]),
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
                    <div><strong>Reportado por:</strong> ${userMap.get(incident.reportedBy) || "Desconocido"}</div>
                    <div><strong>ID de envío:</strong> ${incident.deliveryId}</div>
                    <div><strong>Tipo:</strong> ${incident.type}</div>
                    <div><strong>Ubicación:</strong> ${incident.location}</div>
                    <div><strong>Descripción:</strong> ${incident.description}</div>
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
    document.querySelector(".incident-list-container").innerHTML = `
            <li class="incident-item error-message">
                <div class="incident-header">
                    <span>Ha sucedido un error.</span>
                </div>
            </li>
        `;
  }
}

export async function fetchRankings() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${apiUrl}/ranking`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const rankingContainer = document.querySelector(".ranking-list-container");

    if (response.status === 404) {
      rankingContainer.innerHTML = `
                <li class="ranking-item no-rankings">
                    <div class="ranking-header">
                        <span>No hay ranking por el momento.</span>
                    </div>
                </li>
            `;
      return;
    }

    if (!response.ok) {
      rankingContainer.innerHTML = `
                <li class="ranking-item error-message">
                    <div class="ranking-header">
                        <span>Ha sucedido un error.</span>
                    </div>
                </li>
            `;
      return;
    }

    const rankings = await response.json();
    const userMap = new Map(
      rankings.users.map((user) => [user.userId, user.name]),
    );

    const rankingsHtml = rankings.rankings
      .map((ranking, index) => {
        const rankNumber = index + 1;

        let crownIcon = "";
        if (rankNumber === 1) {
          crownIcon = `<i class="fa-solid fa-crown" style="color: gold;"></i>`;
        } else if (rankNumber === 2) {
          crownIcon = `<i class="fa-solid fa-crown" style="color: silver;"></i>`;
        } else if (rankNumber === 3) {
          crownIcon = `<i class="fa-solid fa-crown" style="color: #f1954a;"></i>`;
        }

        return `
                <li class="ranking-item">
                    <div class="ranking-header">
                        <span><strong>${crownIcon} Rango:</strong> ${rankNumber}</span>
                        <span><strong>Usuario:</strong> ${userMap.get(ranking.userId) || "Unknown"}</span>
                    </div>
                    <div><strong>Puntos:</strong> ${ranking.points}</div>
                </li>
            `;
      })
      .join("");

    rankingContainer.innerHTML =
      rankingsHtml ||
      `
            <li class="ranking-item no-rankings">
                <div class="ranking-header">
                    <span>No hay rangos por el momento.</span>
                </div>
            </li>
        `;
  } catch (error) {
    document.querySelector(".ranking-list-container").innerHTML = `
            <li class="ranking-item error-message">
                <div class="ranking-header">
                    <span>Ha sucedido un error.</span>
                </div>
            </li>
        `;
  }
}
