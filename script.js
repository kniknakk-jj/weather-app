
const API_KEY = 'TA33YRVADWNNBWV94ERUNXP2D';
const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

async function getWeatherData(location) {
    try {
        const response = await fetch(
            `${BASE_URL}/${location}?key=${API_KEY}&unitGroup=us`,
            { mode: 'cors' }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

function processWeatherData(data) {
    if (!data) return null;
    
    const processed = {
        location: data.resolvedAddress,
        currentConditions: {
            temperature: data.currentConditions.temp,
            feelsLike: data.currentConditions.feelslike,
            humidity: data.currentConditions.humidity,
            windSpeed: data.currentConditions.windspeed,
            conditions: data.currentConditions.conditions,
            icon: data.currentConditions.icon
        },
        today: {
            tempMax: data.days[0].tempmax,
            tempMin: data.days[0].tempmin,
            description: data.days[0].description,
            sunrise: data.days[0].sunrise,
            sunset: data.days[0].sunset
        },
        forecast: data.days.slice(1, 8).map(day => ({
            date: day.datetime,
            tempMax: day.tempmax,
            tempMin: day.tempmin,
            conditions: day.conditions,
            icon: day.icon
        }))
    };
    
    return processed;
}


function displayWeatherData(data) {
    const weatherDisplay = document.getElementById('weather-display');
    
    if (!data) {
        weatherDisplay.innerHTML = '<p class="error">Unable to fetch weather data. Please try again.</p>';
        return;
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    
    weatherDisplay.innerHTML = `
        <div class="weather-container">
            <div class="current-weather">
                <h2>${data.location}</h2>
                <div class="current-temp">
                    <span class="icon">${getWeatherIcon(data.currentConditions.icon)}</span>
                    <span class="temp">${Math.round(data.currentConditions.temperature)}°F</span>
                </div>
                <p class="conditions">${data.currentConditions.conditions}</p>
                <div class="details">
                    <div class="detail-item">
                        <span class="label">Feels Like:</span>
                        <span class="value">${Math.round(data.currentConditions.feelsLike)}°F</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Humidity:</span>
                        <span class="value">${data.currentConditions.humidity}%</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Wind Speed:</span>
                        <span class="value">${Math.round(data.currentConditions.windSpeed)} mph</span>
                    </div>
                </div>
                <div class="today-details">
                    <p><strong>Today:</strong> ${data.today.description}</p>
                    <p>High: ${Math.round(data.today.tempMax)}°F | Low: ${Math.round(data.today.tempMin)}°F</p>
                    <p>Sunrise: ${data.today.sunrise} | Sunset: ${data.today.sunset}</p>
                </div>
            </div>
            
            <div class="forecast">
                <h3>7-Day Forecast</h3>
                <div class="forecast-grid">
                    ${data.forecast.map(day => `
                        <div class="forecast-day">
                            <p class="forecast-date">${formatDate(day.date)}</p>
                            <span class="forecast-icon">${getWeatherIcon(day.icon)}</span>
                            <p class="forecast-temp">${Math.round(day.tempMax)}° / ${Math.round(day.tempMin)}°</p>
                            <p class="forecast-conditions">${day.conditions}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function getWeatherIcon(iconCode) {
    const iconMap = {
        'snow': '❄️',
        'rain': '🌧️',
        'fog': '🌫️',
        'wind': '💨',
        'cloudy': '☁️',
        'partly-cloudy-day': '⛅',
        'partly-cloudy-night': '☁️',
        'clear-day': '☀️',
        'clear-night': '🌙'
    };
    
    return iconMap[iconCode] || '🌤️';
}

const form = document.getElementById('weather-form');
const locationInput = document.getElementById('location-input');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const location = locationInput.value.trim();
    
    if (location) {
        const weatherDisplay = document.getElementById('weather-display');
        weatherDisplay.innerHTML = '<p class="loading">Loading weather data...</p>';
        
        console.log(`Fetching weather for: ${location}`);
        
        const rawData = await getWeatherData(location);
        const processedData = processWeatherData(rawData);
        
        console.log('Raw API data:', rawData);
        console.log('Processed weather data:', processedData);
        
        displayWeatherData(processedData);
    }
});