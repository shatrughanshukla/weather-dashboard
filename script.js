const API_KEY = "a64e4d94e5dbf62e285c7d2a654a4287";

const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const currentWeatherDiv = document.getElementById("current-weather");
const forecastDiv = document.getElementById("forecast");
const errorDiv = document.getElementById("error-message");
const forecastTitle = document.getElementById("forecast-title");

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  errorDiv.style.display = "none";
  currentWeatherDiv.innerHTML = "";
  forecastDiv.innerHTML = "";
  forecastTitle.style.display = "none";
  try {
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric`
    );
    if (!forecastRes.ok) throw new Error("City not found");
    const forecastData = await forecastRes.json();
    renderCurrentWeatherFromForecast(forecastData);
    renderForecastFromForecast(forecastData);
  } catch (err) {
    errorDiv.textContent = err.message;
    errorDiv.style.display = "block";
  }
});

function renderCurrentWeatherFromForecast(data) {
  const current = data.list[0];
  const cityName = data.city.name;
  const country = data.city.country;
  const date = new Date(current.dt * 1000);
  const iconUrl = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
  currentWeatherDiv.innerHTML = `
        <div class="weather-main">
            <img class="weather-icon" src="${iconUrl}" alt="Weather icon">
            <div class="weather-details">
                <div><b>${cityName}, ${country}</b> (${date.toLocaleDateString()})</div>
                <div>Temperature: ${current.main.temp}°C</div>
                <div>${current.weather[0].description.replace(/\b\w/g, (c) =>
                  c.toUpperCase()
                )}</div>
                <div>Humidity: ${current.main.humidity}%</div>
                <div>Wind: ${current.wind.speed} m/s</div>
            </div>
        </div>
    `;
}

function renderForecastFromForecast(data) {
  const daily = {};
  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString();
    const hour = date.getHours();
    if (!daily[day] || Math.abs(hour - 12) < Math.abs(daily[day].hour - 12)) {
      daily[day] = { ...item, hour };
    }
  });
  const days = Object.keys(daily).slice(1, 6);
  forecastDiv.innerHTML = "";
  days.forEach((day) => {
    const item = daily[day];
    const date = new Date(item.dt * 1000);
    const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
    forecastDiv.innerHTML += `
            <div class="forecast-card">
                <div class="forecast-date">${date.toLocaleDateString()}</div>
                <img class="forecast-icon" src="${iconUrl}" alt="Weather icon">
                <div class="forecast-temp">${item.main.temp}°C</div>
                <div class="forecast-desc">${item.weather[0].description.replace(
                  /\b\w/g,
                  (c) => c.toUpperCase()
                )}</div>
            </div>
        `;
  });
  if (days.length) forecastTitle.style.display = "block";
}

