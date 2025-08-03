# SkyLens - Advanced Weather Platform

## Project Overview

SkyLens is a modern and intuitive weather forecast application built using JavaScript, HTML, and CSS. It leverages the OpenWeatherMap API to provide real-time weather data, current conditions, and extended forecasts for various locations. The application focuses on a user-friendly interface, responsiveness across different screen sizes, and dynamic visual elements to enhance the user experience.

## Features

*   **Location-Based Forecasts:**
    *   Search weather by city name.
    *   Get weather for your current location using geolocation.
*   **Interactive UI:**
    *   Intuitive design with modern aesthetics.
    *   Responsive layout for desktop, tablet (iPad Mini), and mobile (iPhone SE).
    *   Dynamic background changes based on weather conditions.
    *   Custom animations and visual effects.
*   **Detailed Weather Information:**
    *   Current temperature, 'feels like' temperature, high/low temperatures.
    *   Humidity, wind speed, pressure, and visibility.
    *   UV Index (simulated).
*   **Extended Forecast:**
    *   7-day weather outlook with detailed insights.
    *   Visually appealing forecast cards with relevant icons.
*   **User Experience Enhancements:**
    *   Temperature unit toggle (°C/°F).
    *   Custom weather alerts for extreme temperatures.
    *   Dropdown for recently searched cities, utilizing local storage.
    *   Input validation and graceful error handling with custom UI messages.

## Technologies Used

*   **HTML5:** For structuring the web content.
*   **CSS3:** For styling, including custom animations and responsive design.
*   **Tailwind CSS:** A utility-first CSS framework for rapid UI development and responsiveness.
*   **JavaScript (ES6+):** For dynamic content, API integration, and user interaction.
*   **OpenWeatherMap API:** To fetch real-time weather data and forecasts.

## Setup and Installation

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/bhavanishankar7075/WEATHER-APP
    cd WEATHER-APP
    ```
    *(Note: Replace `https://github.com/bhavanishankar7075/WEATHER-APP` with the actual URL of your GitHub repository.)*

2.  **Open `index.html`:**
    Simply open the `index.html` file in your web browser. All necessary CSS and JavaScript files are linked locally or via CDN.

3.  **API Key Configuration:**
    The application uses the OpenWeatherMap API. You will need an API key to fetch weather data. 
    *   Go to [OpenWeatherMap](https://openweathermap.org/) and sign up for a free account.
    *   Obtain your API key from your account dashboard.
    *   Open `script.js` and replace `767364716f1511cee39ff6dd876cc787` with your actual API key:
        ```javascript
        const API_KEY = "767364716f1511cee39ff6dd876cc787"; 
        ```

## Usage

*   **Search by City:** Enter a city name in the search bar and click the 


Search button or press Enter.
*   **Current Location:** Click the "Locate Me" button to get the weather for your current geographical position.
*   **Temperature Toggle:** Click the temperature unit button (°C/°F) to switch between Celsius and Fahrenheit.
*   **Recent Searches:** Your recent searches will appear in a dropdown for quick access.

## Project Structure

```
WEATHER-APP/
├── index.html      # Main HTML file for the application structure
├── style.css       # Custom CSS for additional styling and animations
└── script.js       # JavaScript for logic, API calls, and dynamic content
```

## Contributing

Contributions are welcome! Please feel free to fork the repository, create a new branch, and submit a pull request for any improvements or bug fixes.

## Contact

For any inquiries or feedback, please contact [ bhavani shankar/shankarmandalabhavani@gmail.com/https://github.com/bhavanishankar7075].
