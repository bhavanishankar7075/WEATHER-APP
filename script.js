// Enhanced API Configuration
const API_KEY = "767364716f1511cee39ff6dd876cc787";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Global Variables
let currentUnit = "metric";
let currentWeatherData = null;
let recentSearches =
  JSON.parse(localStorage.getItem("recentSearches")) || [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Popular cities for suggestions
const popularCities = [
  "New York",
  "London",
  "Tokyo",
  "Paris",
  "Sydney",
  "Dubai",
  "Singapore",
  "Mumbai",
];

// DOM Elements
const citySearchInput = document.getElementById("citySearch");
const searchBtn = document.getElementById("searchBtn");
const getCurrentLocationBtn =
  document.getElementById("getCurrentLocation");
const tempToggleBtn = document.getElementById("tempToggle");
const randomCityBtn = document.getElementById("randomCity");
const errorDisplay = document.getElementById("errorDisplay");
const errorMessage = document.getElementById("errorMessage");
const loadingIndicator = document.getElementById("loadingIndicator");
const weatherAlert = document.getElementById("weatherAlert");
const alertMessage = document.getElementById("alertMessage");
const currentWeatherSection = document.getElementById("currentWeather");
const forecastSection = document.getElementById("forecastSection");
const insightsSection = document.getElementById("insightsSection");
const recentSearchesDropdown = document.getElementById("recentSearches");
const recentCitiesList = document.getElementById("recentCitiesList");
const suggestionsDropdown = document.getElementById("suggestions");
const popularCitiesContainer = document.getElementById("popularCities");
const mainBody = document.getElementById("mainBody");
const particlesContainer = document.getElementById("particles");

// Initialize App
document.addEventListener("DOMContentLoaded", function () {
  setupEventListeners();
  createParticles();
  updateRecentSearchesDropdown();
  populatePopularCities();
  updateCurrentTime();

  // Set up real-time clock
  setInterval(updateCurrentTime, 1000);

  // Try to get user's location on load
  if (navigator.geolocation) {
    getCurrentLocation();
  }
});

// Create floating particles
function createParticles() {
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.width = particle.style.height =
        Math.random() * 4 + 2 + "px";
      particle.style.animationDelay = Math.random() * 8 + "s";
      particle.style.animationDuration = Math.random() * 6 + 4 + "s";
      particlesContainer.appendChild(particle);

      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 12000);
    }, i * 400);
  }

  // Recreate particles periodically
  setTimeout(createParticles, 8000);
}

// Update current time
function updateCurrentTime() {
  const timeElement = document.getElementById("currentTime");
  if (timeElement) {
    const now = new Date();
    timeElement.textContent = now.toLocaleTimeString();
  }
}

// Event Listeners Setup
function setupEventListeners() {
  searchBtn.addEventListener("click", handleSearch);
  citySearchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      handleSearch();
    }
  });

  citySearchInput.addEventListener("input", function () {
    if (this.value.length > 2) {
      showSuggestions();
    } else {
      hideSuggestions();
    }
  });

  citySearchInput.addEventListener("focus", function () {
    if (recentSearches.length > 0) {
      showRecentSearches();
    } else {
      showSuggestions();
    }
  });


  citySearchInput.addEventListener("blur", function (e) {
    // Check if the blur is happening because user clicked on a dropdown item
    setTimeout(() => {
      // Only hide if the clicked element is not within any dropdown
      const clickedElement = document.activeElement;
      const isDropdownClick =
        clickedElement &&
        (clickedElement.closest("#suggestions") ||
          clickedElement.closest("#recentSearches") ||
          clickedElement.closest("#searchResults"));

      if (!isDropdownClick) {
        hideRecentSearches();
        hideSuggestions();
      }
    }, 150);
  });

  getCurrentLocationBtn.addEventListener("click", getCurrentLocation);
  tempToggleBtn.addEventListener("click", toggleTemperatureUnit);
  randomCityBtn.addEventListener("click", searchRandomCity);

  // Additional buttons
  document
    .getElementById("voiceSearch")
    ?.addEventListener("click", startVoiceSearch);
  document
    .getElementById("clearHistory")
    ?.addEventListener("click", clearSearchHistory);
}

// Enhanced Search Handling
function handleSearch() {
  const city = citySearchInput.value.trim();
  if (!city) {
    showError("Please enter a city name");
    return;
  }

  if (!validateCityName(city)) {
    showError("Please enter a valid city name (letters and spaces only)");
    return;
  }

  searchWeatherByCity(city);
}

// Voice Search
function startVoiceSearch() {
  if (
    !("webkitSpeechRecognition" in window) &&
    !("SpeechRecognition" in window)
  ) {
    showError("Voice search is not supported in your browser");
    return;
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = function () {
    document.getElementById("voiceSearch").innerHTML =
      '<i class="fas fa-microphone-slash text-highlight"></i>';
  };

  recognition.onresult = function (event) {
    const result = event.results[0][0].transcript;
    citySearchInput.value = result;
    handleSearch();
  };

  recognition.onerror = function () {
    showError("Voice search failed. Please try again.");
  };

  recognition.onend = function () {
    document.getElementById("voiceSearch").innerHTML =
      '<i class="fas fa-microphone"></i>';
  };

  recognition.start();
}

// Random City Search
function searchRandomCity() {
  const randomCity =
    popularCities[Math.floor(Math.random() * popularCities.length)];
  citySearchInput.value = randomCity;
  searchWeatherByCity(randomCity);
}

// Clear Search History
function clearSearchHistory() {
  recentSearches = [];
  localStorage.removeItem("recentSearches");
  updateRecentSearchesDropdown();
  hideRecentSearches();
}

// City Name Validation
function validateCityName(city) {
  const cityRegex = /^[a-zA-Z\s\-',.]+$/;
  return cityRegex.test(city) && city.length >= 2 && city.length <= 50;
}

// Get Current Location
function getCurrentLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by this browser");
    return;
  }

  showLoading();
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      searchWeatherByCoords(lat, lon);
    },
    function (error) {
      hideLoading();
      let errorMsg = "Unable to get your location. ";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg += "Location access denied.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg += "Location information unavailable.";
          break;
        case error.TIMEOUT:
          errorMsg += "Location request timed out.";
          break;
        default:
          errorMsg += "Unknown error occurred.";
          break;
      }
      showError(errorMsg);
    }
  );
}

// Enhanced Search Weather by City
async function searchWeatherByCity(city) {
  try {
    showLoading();
    hideError();

    const currentWeatherUrl = `${BASE_URL}/weather?q=${encodeURIComponent(
      city
    )}&appid=${API_KEY}&units=${currentUnit}`;
    const forecastUrl = `${BASE_URL}/forecast?q=${encodeURIComponent(
      city
    )}&appid=${API_KEY}&units=${currentUnit}`;

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl),
    ]);

    if (!currentResponse.ok) {
      throw new Error(`City not found: ${city}`);
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    // Add to recent searches
    addToRecentSearches(city);

    // Display weather data
    displayCurrentWeather(currentData);
    displayForecast(forecastData);
    displayHourlyForecast(forecastData);
    displayWeatherInsights(currentData, forecastData);

    // Clear search input
    citySearchInput.value = "";
    hideRecentSearches();
    hideSuggestions();

    hideLoading();
  } catch (error) {
    hideLoading();
    showError(error.message || "Failed to fetch weather data");
  }
}

// Search Weather by Coordinates
async function searchWeatherByCoords(lat, lon) {
  try {
    showLoading();
    hideError();

    const currentWeatherUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`;
    const forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`;

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl),
    ]);

    if (!currentResponse.ok) {
      throw new Error("Unable to fetch weather for your location");
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    // Add to recent searches
    addToRecentSearches(currentData.name);

    // Display weather data
    displayCurrentWeather(currentData);
    displayForecast(forecastData);
    displayHourlyForecast(forecastData);
    displayWeatherInsights(currentData, forecastData);

    hideLoading();
  } catch (error) {
    hideLoading();
    showError(
      error.message || "Failed to fetch weather data for your location"
    );
  }
}

// Enhanced Display Current Weather
function displayCurrentWeather(data) {
  currentWeatherData = data;

  // Update UI elements
  document.getElementById(
    "cityName"
  ).textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const temp = Math.round(data.main.temp);
  const unit = currentUnit === "metric" ? "°C" : "°F";
  document.getElementById("currentTemp").textContent = temp + unit;
  document.getElementById("weatherDescription").textContent =
    data.weather[0].description;
  document.getElementById(
    "feelsLike"
  ).textContent = `Feels like ${Math.round(data.main.feels_like)}${unit}`;

  // High/Low temperatures
  document.getElementById("highLow").textContent = `${Math.round(
    data.main.temp_max
  )}° / ${Math.round(data.main.temp_min)}°`;

  // Weather details
  document.getElementById("humidity").textContent =
    data.main.humidity + "%";
  document.getElementById("windSpeed").textContent =
    Math.round(data.wind.speed) +
    (currentUnit === "metric" ? " m/s" : " mph");
  document.getElementById("pressure").textContent =
    data.main.pressure + " hPa";
  document.getElementById("visibility").textContent =
    Math.round(data.visibility / 1000) + " km";

  // UV Index (simulated)
  const uvIndex = Math.floor(Math.random() * 11) + 1;
  document.getElementById("uvIndex").textContent = uvIndex;

  // Weather icon
  const iconElement = document.getElementById("weatherIcon");
  iconElement.textContent = getWeatherIcon(
    data.weather[0].main,
    data.weather[0].icon
  );

  // Update background based on weather
  updateBackground(data.weather[0].main);

  // Check for weather alerts
  checkWeatherAlerts(data);

  // Show current weather section
  currentWeatherSection.classList.remove("hidden");
}

// Display Hourly Forecast
function displayHourlyForecast(data) {
  const hourlyContainer = document.getElementById("hourlyForecast");
  hourlyContainer.innerHTML = "";

  // Take first 24 hours (8 entries * 3 hours each)
  const hourlyData = data.list.slice(0, 8);

  hourlyData.forEach((hour) => {
    const hourCard = createHourlyCard(hour);
    hourlyContainer.appendChild(hourCard);
  });
}

// Create Hourly Card
function createHourlyCard(hour) {
  const date = new Date(hour.dt * 1000);
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
  });

  const temp = Math.round(hour.main.temp);
  const unit = currentUnit === "metric" ? "°C" : "°F";

  const card = document.createElement("div");
  card.className =
    "neo-card rounded-2xl p-4 text-center hover:neon-glow transition-all flex-shrink-0 w-32";

  card.innerHTML = `
                      <p class="text-white text-sm font-semibold mb-2">${time}</p>
                      <div class="text-3xl mb-2">${getWeatherIcon(
    hour.weather[0].main,
    hour.weather[0].icon
  )}</div>
                      <p class="text-white font-bold text-lg">${temp}${unit}</p>
                      <p class="text-gray-400 text-xs mt-1">${Math.round(
    hour.pop * 100
  )}%</p>
                  `;

  return card;
}

// Enhanced Display 7-Day Forecast
function displayForecast(data) {
  const forecastContainer = document.getElementById("forecastContainer");
  forecastContainer.innerHTML = "";

  // Group forecast data by day
  const dailyForecasts = {};
  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toDateString();

    if (
      !dailyForecasts[dateKey] ||
      Math.abs(date.getHours() - 12) <
      Math.abs(
        new Date(dailyForecasts[dateKey].dt * 1000).getHours() - 12
      )
    ) {
      dailyForecasts[dateKey] = item;
    }
  });

  // Convert to array and take first 7 days
  const forecasts = Object.values(dailyForecasts).slice(0, 7);

  forecasts.forEach((forecast, index) => {
    const forecastCard = createEnhancedForecastCard(forecast, index);
    forecastContainer.appendChild(forecastCard);
  });

  // Show forecast section
  forecastSection.classList.remove("hidden");
}

// Create Enhanced Forecast Card
function createEnhancedForecastCard(forecast, index) {
  const date = new Date(forecast.dt * 1000);
  const dayName =
    index === 0
      ? "Today"
      : date.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const temp = Math.round(forecast.main.temp);
  const unit = currentUnit === "metric" ? "°C" : "°F";

  const card = document.createElement("div");
  card.className =
    "neo-card rounded-3xl p-6 weather-morph text-center hover:neon-glow transition-all";

  const precipitationChance = Math.round(forecast.pop * 100);
  const windDirection = getWindDirection(forecast.wind.deg);

  card.innerHTML = `
                      <div class="flex justify-between items-start mb-4">
                          <div>
                              <h3 class="text-white font-bold text-lg">${dayName}</h3>
                              <p class="text-gray-400 text-sm">${dateStr}</p>
                          </div>
                          <div class="text-right">
                              <span class="text-xs bg-highlight px-2 py-1 rounded-full text-white">${precipitationChance}%</span>
                          </div>
                      </div>

                      <div class="text-6xl mb-4 weather-icon-bounce">${getWeatherIcon(
    forecast.weather[0].main,
    forecast.weather[0].icon
  )}</div>

                      <div class="mb-4">
                          <p class="text-white text-3xl font-bold mb-1">${temp}${unit}</p>
                          <p class="text-gray-300 text-sm capitalize">${forecast.weather[0].description
    }</p>
                      </div>

                      <div class="grid grid-cols-2 gap-3 text-xs">
                          <div class="neo-card p-3 rounded-xl">
                              <div class="flex items-center justify-center mb-1">
                                  <i class="fas fa-tint text-ocean mr-1"></i>
                              </div>
                              <p class="text-gray-400">Humidity</p>
                              <p class="text-white font-semibold">${forecast.main.humidity
    }%</p>
                          </div>
                          <div class="neo-card p-3 rounded-xl">
                              <div class="flex items-center justify-center mb-1">
                                  <i class="fas fa-wind text-emerald mr-1"></i>
                              </div>
                              <p class="text-gray-400">Wind</p>
                              <p class="text-white font-semibold">${Math.round(
      forecast.wind.speed
    )} ${currentUnit === "metric" ? "m/s" : "mph"}</p>
                              <p class="text-gray-500 text-xs">${windDirection}</p>
                          </div>
                      </div>

                      <div class="mt-4 pt-4 border-t border-gray-600">
                          <div class="flex justify-between text-xs text-gray-400">
                              <span>Pressure: ${forecast.main.pressure
    } hPa</span>
                              <span>Clouds: ${forecast.clouds.all}%</span>
                          </div>
                      </div>
                  `;

  return card;
}

// Display Weather Insights
function displayWeatherInsights(currentData, forecastData) {
  // Weather Pattern Analysis
  const patternContainer = document.getElementById("weatherPattern");
  const patterns = analyzeWeatherPatterns(forecastData);

  patternContainer.innerHTML = patterns
    .map(
      (pattern) => `
                      <div class="flex items-center justify-between p-3 neo-card rounded-xl">
                          <div class="flex items-center">
                              <i class="${pattern.icon} text-${pattern.color} mr-3"></i>
                              <span class="text-white">${pattern.title}</span>
                          </div>
                          <span class="text-gray-400 text-sm">${pattern.value}</span>
                      </div>
                  `
    )
    .join("");

  // Climate Summary
  const climateContainer = document.getElementById("climateSummary");
  const climate = generateClimateSummary(currentData, forecastData);

  climateContainer.innerHTML = `
                      <div class="space-y-3">
                          <div class="p-3 neo-card rounded-xl">
                              <h4 class="text-white font-semibold mb-2">Current Conditions</h4>
                              <p class="text-gray-300 text-sm">${climate.currentConditions}</p>
                          </div>
                          <div class="p-3 neo-card rounded-xl">
                              <h4 class="text-white font-semibold mb-2">7-Day Outlook</h4>
                              <p class="text-gray-300 text-sm">${climate.weeklyOutlook}</p>
                          </div>
                          <div class="p-3 neo-card rounded-xl">
                              <h4 class="text-white font-semibold mb-2">Recommendations</h4>
                              <p class="text-gray-300 text-sm">${climate.recommendations}</p>
                          </div>
                      </div>
                  `;

  // Show insights section
  insightsSection.classList.remove("hidden");
}

// Analyze Weather Patterns
function analyzeWeatherPatterns(forecastData) {
  const patterns = [];

  // Temperature trend
  const temps = forecastData.list
    .slice(0, 5)
    .map((item) => item.main.temp);
  const tempTrend =
    temps[temps.length - 1] > temps[0] ? "Rising" : "Falling";
  patterns.push({
    icon: "fas fa-thermometer-half",
    color: tempTrend === "Rising" ? "highlight" : "ocean",
    title: "Temperature Trend",
    value: tempTrend,
  });

  // Precipitation probability
  const avgPrecip =
    forecastData.list
      .slice(0, 8)
      .reduce((sum, item) => sum + item.pop, 0) / 8;
  patterns.push({
    icon: "fas fa-cloud-rain",
    color: "ocean",
    title: "Rain Probability",
    value: Math.round(avgPrecip * 100) + "%",
  });

  // Wind conditions
  const avgWind =
    forecastData.list
      .slice(0, 8)
      .reduce((sum, item) => sum + item.wind.speed, 0) / 8;
  const windCondition =
    avgWind > 10 ? "Windy" : avgWind > 5 ? "Moderate" : "Calm";
  patterns.push({
    icon: "fas fa-wind",
    color: "emerald",
    title: "Wind Conditions",
    value: windCondition,
  });

  return patterns;
}

// Generate Climate Summary
function generateClimateSummary(currentData, forecastData) {
  const currentTemp = currentData.main.temp;
  const weatherMain = currentData.weather[0].main;

  let currentConditions = `Currently experiencing ${weatherMain.toLowerCase()} conditions with temperatures around ${Math.round(
    currentTemp
  )}°${currentUnit === "metric" ? "C" : "F"}.`;

  let weeklyOutlook =
    "The upcoming week shows varied weather patterns with ";
  const avgTemp =
    forecastData.list
      .slice(0, 7)
      .reduce((sum, item) => sum + item.main.temp, 0) / 7;
  weeklyOutlook += `average temperatures around ${Math.round(avgTemp)}°${currentUnit === "metric" ? "C" : "F"
    }.`;

  let recommendations = "Based on current conditions, ";
  if (currentTemp > 30 && currentUnit === "metric") {
    recommendations +=
      "consider staying hydrated and wearing light clothing.";
  } else if (currentTemp < 5 && currentUnit === "metric") {
    recommendations += "dress warmly and be cautious of icy conditions.";
  } else {
    recommendations +=
      "current weather conditions are comfortable for outdoor activities.";
  }

  return {
    currentConditions,
    weeklyOutlook,
    recommendations,
  };
}

// Get Wind Direction
function getWindDirection(deg) {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return directions[Math.round(deg / 22.5) % 16];
}

// Enhanced Get Weather Icon
function getWeatherIcon(weatherMain, iconCode) {
  const iconMap = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "❄️",
    Mist: "🌫️",
    Smoke: "🌫️",
    Haze: "🌫️",
    Dust: "🌪️",
    Fog: "🌫️",
    Sand: "🌪️",
    Ash: "🌋",
    Squall: "💨",
    Tornado: "🌪️",
  };

  return iconMap[weatherMain] || "🌤️";
}

// Enhanced Update Background
function updateBackground(weatherMain) {
  mainBody.className =
    "min-h-screen transition-all duration-1000 relative overflow-x-hidden";

  switch (weatherMain.toLowerCase()) {
    case "clear":
      mainBody.classList.add("sunset-bg");
      break;
    case "clouds":
      mainBody.classList.add("cosmic-bg");
      break;
    case "rain":
    case "drizzle":
      mainBody.classList.add("storm-bg");
      break;
    case "thunderstorm":
      mainBody.classList.add("storm-bg");
      break;
    case "snow":
      mainBody.classList.add("winter-bg");
      break;
    case "mist":
    case "fog":
    case "haze":
      mainBody.classList.add("forest-bg");
      break;
    default:
      mainBody.classList.add("aurora-bg");
  }
}

// Enhanced Weather Alerts
function checkWeatherAlerts(data) {
  const temp = data.main.temp;
  const weatherMain = data.weather[0].main.toLowerCase();
  const windSpeed = data.wind.speed;
  const humidity = data.main.humidity;

  let alertText = "";
  let alertType = "warning";

  if (currentUnit === "metric" && temp > 40) {
    alertText = `🔥 Extreme Heat Alert! Temperature is ${Math.round(
      temp
    )}°C. Stay hydrated, avoid prolonged sun exposure, and seek air conditioning.`;
    alertType = "danger";
  } else if (currentUnit === "imperial" && temp > 104) {
    alertText = `🔥 Extreme Heat Alert! Temperature is ${Math.round(
      temp
    )}°F. Stay hydrated, avoid prolonged sun exposure, and seek air conditioning.`;
    alertType = "danger";
  } else if (currentUnit === "metric" && temp < -10) {
    alertText = `🥶 Extreme Cold Alert! Temperature is ${Math.round(
      temp
    )}°C. Dress in layers, limit outdoor exposure, and watch for frostbite signs.`;
    alertType = "danger";
  } else if (currentUnit === "imperial" && temp < 14) {
    alertText = `🥶 Extreme Cold Alert! Temperature is ${Math.round(
      temp
    )}°F. Dress in layers, limit outdoor exposure, and watch for frostbite signs.`;
    alertType = "danger";
  } else if (weatherMain === "thunderstorm") {
    alertText =
      "⛈️ Thunderstorm Alert! Stay indoors, avoid electrical appliances, and postpone outdoor activities.";
  } else if (windSpeed > 15) {
    alertText = `💨 High Wind Warning! Wind speed is ${Math.round(
      windSpeed
    )} ${currentUnit === "metric" ? "m/s" : "mph"
      }. Secure loose objects and be cautious driving.`;
  } else if (humidity > 85) {
    alertText =
      "💧 High Humidity Advisory! Humidity levels are very high. Take frequent breaks if exercising outdoors.";
  }

  if (alertText) {
    alertMessage.textContent = alertText;
    document.getElementById("alertTime").textContent =
      new Date().toLocaleTimeString();
    weatherAlert.classList.remove("hidden");
  } else {
    weatherAlert.classList.add("hidden");
  }
}

// Temperature Unit Toggle
function toggleTemperatureUnit() {
  currentUnit = currentUnit === "metric" ? "imperial" : "metric";
  tempToggleBtn.innerHTML = `<i class="fas fa-thermometer-half mr-2"></i>${currentUnit === "metric" ? "°C" : "°F"
    }`;

  // If we have current weather data, refresh with new unit
  if (currentWeatherData) {
    const city = currentWeatherData.name;
    searchWeatherByCity(city);
  }
}

// Populate Popular Cities
function populatePopularCities() {
  popularCitiesContainer.innerHTML = "";
  popularCities.forEach((city) => {
    const cityButton = document.createElement("button");
    cityButton.className =
      "neo-card px-3 py-2 rounded-lg text-white text-sm hover:neon-glow transition-all";
    cityButton.textContent = city;
    cityButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      citySearchInput.value = city; // Set the input value
      searchWeatherByCity(city);
      hideSuggestions();
      hideRecentSearches();
    });
    popularCitiesContainer.appendChild(cityButton);
  });
}

// Show/Hide Suggestions
function showSuggestions() {
  suggestionsDropdown.classList.remove("hidden");
  hideRecentSearches();
}

function hideSuggestions() {
  suggestionsDropdown.classList.add("hidden");
}

// Recent Searches Management
function addToRecentSearches(city) {
  recentSearches = recentSearches.filter(
    (search) => search.toLowerCase() !== city.toLowerCase()
  );
  recentSearches.unshift(city);
  recentSearches = recentSearches.slice(0, 8);
  localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  updateRecentSearchesDropdown();
}

function updateRecentSearchesDropdown() {
  recentCitiesList.innerHTML = "";

  if (recentSearches.length === 0) {
    return;
  }
  recentSearches.forEach((city) => {
    const cityItem = document.createElement("button");
    cityItem.className =
      "w-full text-left px-4 py-3 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all flex items-center justify-between";
    cityItem.innerHTML = `
              <span>${city}</span>
              <i class="fas fa-arrow-up-right text-gray-400"></i>
          `;
    cityItem.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      citySearchInput.value = city; // Set the input value
      searchWeatherByCity(city);
      hideRecentSearches();
      hideSuggestions();
    });
    recentCitiesList.appendChild(cityItem);
  });

}

function showRecentSearches() {
  if (recentSearches.length > 0) {
    recentSearchesDropdown.classList.remove("hidden");
    hideSuggestions();

    updateRecentSearchesDropdown();

  }
}

function hideRecentSearches() {
  recentSearchesDropdown.classList.add("hidden");
}

// Error Handling
function showError(message) {
  errorMessage.textContent = message;
  errorDisplay.classList.remove("hidden");

  setTimeout(() => {
    hideError();
  }, 5000);
}

function hideError() {
  errorDisplay.classList.add("hidden");
}

// Loading Indicator
function showLoading() {
  loadingIndicator.classList.remove("hidden");
}

function hideLoading() {
  loadingIndicator.classList.add("hidden");
}
