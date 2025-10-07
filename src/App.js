import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { Country, City } from "country-state-city";

const API_KEY = "5fe302c5dd917cf654f27c2ab2740be2";

export default function App() {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);

  // ✅ Combine all cities with their country code
  const [allCities, setAllCities] = useState([]);

  useEffect(() => {
    const countries = Country.getAllCountries();
    const cityList = [];
    countries.forEach((country) => {
      const cities = City.getCitiesOfCountry(country.isoCode);
      cities.forEach((city) => {
        cityList.push({
          name: city.name,
          country: country.name,
          countryCode: country.isoCode,
        });
      });
    });
    setAllCities(cityList);
  }, []);

  // ✅ Format Time Function
  const pad = (n) => (n < 10 ? "0" + n : n);
  const formatTime = (dt, timezone) => {
    const localDate = new Date((dt + timezone) * 1000);
    const hours = localDate.getUTCHours();
    const minutes = localDate.getUTCMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    return `${pad(h12)}:${pad(minutes)} ${ampm}`;
  };

  // ✅ Fetch weather by city name
  const getWeather = async (cityName) => {
    if (!cityName) return;
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      setWeather(res.data);

      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const dailyData = forecastRes.data.list.filter(
        (item, index) => index % 8 === 0
      );
      setForecast(dailyData);
      setSuggestions([]);
    } catch (err) {
      alert("City not found!");
      console.error(err);
    }
  };

  // ✅ Handle typing in input
  const handleChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (value.trim() === "") {
      setSuggestions([]);
      return;
    }

    const filtered = allCities.filter(
      (item) =>
        item.name.toLowerCase().startsWith(value.toLowerCase()) ||
        item.country.toLowerCase().startsWith(value.toLowerCase())
    );

    setSuggestions(filtered.slice(0, 15)); // limit to 15 for performance
  };

  // ✅ When city selected
  const handleSelect = (city) => {
    setSearch(`${city.name}, ${city.countryCode}`);
    getWeather(city.name);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && search.trim() !== "") {
      getWeather(search);
    }
  };

  return (
    <div className="app">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search country or city..."
          value={search}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <button onClick={() => getWeather(search)}>Search</button>

        {/* 🔽 Dropdown Suggestion List */}
        {suggestions.length > 0 && (
          <ul className="suggestion-list">
            {suggestions.map((city, index) => (
              <li key={index} onClick={() => handleSelect(city)}>
                <strong>{city.name}</strong> — {city.country} ({city.countryCode})
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ✅ Weather Box */}
      {weather && (
        <div className="weather-box">
          <h2>
            {weather.name}, {weather.sys.country}
          </h2>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="icon"
          />
          <h1>{Math.round(weather.main.temp)}°C</h1>
          <p>{weather.weather[0].description}</p>

          <p>🕒 Local Time: {formatTime(weather.dt, weather.timezone)}</p>
          <p>🌅 Sunrise: {formatTime(weather.sys.sunrise, weather.timezone)}</p>
          <p>🌇 Sunset: {formatTime(weather.sys.sunset, weather.timezone)}</p>
        </div>
      )}

      {/* ✅ Forecast */}
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
