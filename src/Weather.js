import React, { useEffect } from "react";
import axios from "axios";

const API_KEY = "5fe302c5dd917cf654f27c2ab2740be2";

function Weather({ city, setWeatherData }) {
  useEffect(() => {
    if (city) {
      const fetchWeather = async () => {
        try {
          const res = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
          setWeatherData(res.data);
        } catch (err) {
          console.error("Error fetching weather:", err);
          setWeatherData(null);
        }
      };
      fetchWeather();
    }
  }, [city, setWeatherData]);

  return null;
}

export default Weather;
