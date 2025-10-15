//used chat gpt for assistance with debugging map from Leaflet
const API_KEY = "2964b8ff-5dff-48a5-9dd0-50f4564dd5d4";
const BASE_URL = "https://api.balldontlie.io/v1";

// Grab references to DOM elements
const playerInfo = document.getElementById("playerInfo"); // paragraph to show player info
const getPlayer = document.getElementById("getPlayer");   // button to get a random player

let map;     // variable to store Leaflet map instance
let marker;  // variable to store the current marker on the map

// Wait until the entire page (HTML + CSS + images) is fully loaded
window.addEventListener("load", () => {
  // Initialize the Leaflet map inside the div with id="map"
  // Set default center to USA ([latitude, longitude]) and zoom level 4
  map = L.map("map").setView([39.5, -98.35], 4);

  // Add OpenStreetMap tiles to the map (the visual map layer)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Fix rendering issues: tells Leaflet to recalc container size
  map.invalidateSize();
});

// Function: given a location (college/high school/country), show it on the map
function showLocationOnMap(location) {
  // Use OpenStreetMap's Nominatim API to convert location name to coordinates
  const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;

  fetch(geoUrl)
    .then(res => res.json())  // Convert the response to JSON
    .then(results => {
      if (results.length === 0) return; // If no location found, stop

      // Grab latitude, longitude, and full display name of the first result
      const { lat, lon, display_name } = results[0];

      // Remove the old marker if it exists
      if (marker) map.removeLayer(marker);

      // Add a new marker at the found location
      marker = L.marker([lat, lon]).addTo(map);

      // Bind a popup to the marker with location name
      marker.bindPopup(`<b>${location}</b><br>${display_name}`).openPopup();

      // Center the map on this location and zoom in to level 6
      map.setView([lat, lon], 6);
    })
    .catch(err => console.error("Error finding location:", err));
}

// Event listener: when the button is clicked, fun begins...
getPlayer.addEventListener("click", () => {
  // Show temporary loading message
  playerInfo.textContent = "Loading...";

  // Randomly choose a page from the API 
  const randomPage = Math.floor(Math.random() * 10) + 1;
  const url = `${BASE_URL}/players?per_page=100&page=${randomPage}`;

  // Fetch data from the API
  fetch(url, { headers: { Authorization: API_KEY } })
    .then(res => res.json())  // Convert response to JSON
    .then(data => {
      const players = data.data; // Get the array of players
      if (!players.length) {     // If no players found, show message
        playerInfo.textContent = "No players found.";
        return;
      }

      // Player randomizier 
      const randomIndex = Math.floor(Math.random() * players.length);
      const player = players[randomIndex];

      // Display college, high school, or country
      const locationInfo = player.college || player.high_school || player.country || "Unknown";

      // Player info
      playerInfo.textContent = `${player.first_name} ${player.last_name} — ${player.team.full_name} (${player.position || "N/A"}) | ${locationInfo}`;

      // find the location if known, and show it on the map
      if (locationInfo !== "Unknown") showLocationOnMap(locationInfo);
      else {
        // unknown location, then remove the marker and reset map to US
        if (marker) map.removeLayer(marker);
        map.setView([39.5, -98.35], 4);
      }
    })
    .catch(err => {
      // If fetch failed, show the error message
      console.error("Error fetching player:", err);
      playerInfo.textContent = "Error fetching random player.";
    });
});
