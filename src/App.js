import React, { useState } from "react";
import axios from "axios";
import Select from "react-select";
import { Country, City } from "country-state-city";
import "./App.css";

const API_KEY = "5fe302c5dd917cf654f27c2ab2740be2";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [cities, setCities] = useState([]); // ✅ new for dropdown

  // ✅ Helper: pad number with leading zero
  const pad = (n) => (n < 10 ? "0" + n : n);

  // ✅ Convert UTC timestamp + timezone offset → Local time string
  const formatTime = (dt, timezone) => {
    const localDate = new Date((dt + timezone) * 1000);
    const hours = localDate.getUTCHours();
    const minutes = localDate.getUTCMinutes();

    // 12-hour format
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;

    return `${pad(h12)}:${pad(minutes)} ${ampm}`;
  };

  const getWeather = async (cityName) => {
    if (!cityName) return;

    try {
      // Current Weather
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      setWeather(res.data);

      // 5 Day Forecast
      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );

      // Filter daily forecast (every 8th 3-hour data point ~ 1 per day)
      const dailyData = forecastRes.data.list.filter(
        (item, index) => index % 8 === 0
      );
      setForecast(dailyData);
    } catch (err) {
      alert("City not found!");
      console.error(err);
    }
  };

  // ✅ Input change handler
  const handleInputChange = (e) => {
    const value = e.target.value;
    setCity(value);

    const country = Country.getAllCountries().find(
      (c) => c.name.toLowerCase() === value.toLowerCase()
    );

    if (country) {
      const cityList = City.getCitiesOfCountry(country.isoCode).map((c) => ({
        label: c.name,
        value: c.name,
      }));
      setCities(cityList);
    } else {
      setCities([]);
    }
  };

  const handleCitySelect = (selected) => {
    setCity(selected.label);
    setCities([]);
    getWeather(selected.label);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && cities.length === 0) {
      getWeather(city);
    }
  };

  return (
    <div className="app">
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city or country..."
          value={city}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button onClick={() => getWeather(city)}>Search</button>
      </div>

      {cities.length > 0 && (
        <Select
          options={cities}
          onChange={handleCitySelect}
          placeholder="Select a city..."
        />
      )}

      {weather && (
        <div className="weather-box">
          <h2>
            {weather.name}, {weather.sys.country}
          </h2>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="weather"
          />
          <h1>{Math.round(weather.main.temp)}°C</h1>
          <p>{weather.weather[0].description}</p>

          {/* ✅ Correct Local Times */}
          <p>🕒 Local Time: {formatTime(weather.dt, weather.timezone)}</p>
          <p>🌅 Sunrise: {formatTime(weather.sys.sunrise, weather.timezone)}</p>
          <p>🌇 Sunset: {formatTime(weather.sys.sunset, weather.timezone)}</p>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="forecast">
          <h3>5-Day Forecast</h3>
          <div className="forecast-cards">
            {forecast.map((day, i) => (
              <div className="card" key={i}>
                <h4>
                  {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </h4>
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt="icon"
                />
                <p>{Math.round(day.main.temp)}°C</p>
                <small>{day.weather[0].description}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
