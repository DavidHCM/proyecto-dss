import Swal from "sweetalert2";

const apiUrl = "http://localhost:3000";
//const apiUrl = "http://localhost:3000";

export async function fetchAllDeliveriesSupport() {
  const token = localStorage.getItem("token");
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
                    </div>
                    <div><strong>Asignado a:</strong> ${userMap.get(delivery.assignedTo) || "Desconocido"}</div>
                    <div><strong>Ruta:</strong> ${delivery.route}</div>
                    <div><strong>Ubicación:</strong> ${delivery.deliveryLocation}</div>
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
