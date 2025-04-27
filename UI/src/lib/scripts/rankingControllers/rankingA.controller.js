const apiUrl = "http://localhost:3000";
//const apiUrl = "http://localhost:3000";

export async function fetchAllRankings() {
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
