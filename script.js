let currentPage = 1;
let currentQuery = "";

async function searchAnime(page = 1) {
  const input = document.getElementById("animeInput").value.trim();
  if (input) {
    currentQuery = input;
    saveToHistory(input);
  }

  const query = currentQuery;
  const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&page=${page}`);
  const data = await res.json();

  renderResults(data.data);
  document.getElementById("pageNum").textContent = page;
  currentPage = page;
}

function renderResults(animeList) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  animeList.forEach(anime => {
    const div = document.createElement("div");
    div.classList.add("anime-card");

    div.innerHTML = `
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}" />
      <div class="anime-details">
        <h3>${anime.title}</h3>
        <p><strong>Episodes:</strong> ${anime.episodes ?? 'N/A'}</p>
        <p><strong>Score:</strong> ${anime.score ?? 'N/A'}</p>
        <p>${anime.synopsis ? anime.synopsis.slice(0, 200) + "..." : "No synopsis available."}</p>
        <button onclick="addToFavorites('${anime.mal_id}', '${anime.title.replace(/'/g, "\\'")}', '${anime.images.jpg.image_url}')">Add to Favorites</button>
      </div>
    `;
    resultsDiv.appendChild(div);
  });
}

function saveToHistory(query) {
  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  if (!history.includes(query)) {
    history.unshift(query);
    if (history.length > 5) history.pop();
    localStorage.setItem("searchHistory", JSON.stringify(history));
    renderHistory();
  }
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  history.forEach(q => {
    const li = document.createElement("li");
    li.textContent = q;
    li.onclick = () => {
      document.getElementById("animeInput").value = q;
      currentQuery = q;
      searchAnime(1);
    };
    list.appendChild(li);
  });
}

function addToFavorites(id, title, imageUrl) {
  let favs = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favs.find(a => a.id === id)) {
    favs.push({ id, title, imageUrl });
    localStorage.setItem("favorites", JSON.stringify(favs));
    renderFavorites();
  }
}

function removeFromFavorites(id) {
  let favs = JSON.parse(localStorage.getItem("favorites")) || [];
  favs = favs.filter(f => f.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favs));
  renderFavorites();
}

function renderFavorites() {
  const favs = JSON.parse(localStorage.getItem("favorites")) || [];
  const list = document.getElementById("favoritesList");
  list.innerHTML = "";

  favs.forEach(f => {
    const li = document.createElement("li");
    li.innerHTML = `<img src="${f.imageUrl}" width="40" /> ${f.title}
      <button onclick="removeFromFavorites('${f.id}')">❌</button>`;
    list.appendChild(li);
  });
}

document.getElementById("nextBtn").onclick = () => searchAnime(currentPage + 1);
document.getElementById("prevBtn").onclick = () => {
  if (currentPage > 1) searchAnime(currentPage - 1);
};

// Initial render
renderHistory();
renderFavorites();