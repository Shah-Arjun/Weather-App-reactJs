import React, { useCallback, useEffect, useMemo, useState } from "react";
import WeatherBackground from "./components/WeatherBackground";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [suggestion, setSuggestion] = useState([]);
  const [unit, setUnit] = useState("C");
  const [error, setError] = useState("");

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  /* -------------------- SUGGESTION FETCH -------------------- */
  const fetchSuggestion = useCallback(
    async (query) => {
      if (!query.trim()) return;

      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
        );

        if (!res.ok) throw new Error("Failed to fetch suggestions");

        const data = await res.json();
        setSuggestion(data || []);
      } catch (err) {
        console.error(err);
        setSuggestion([]);
      }
    },
    [API_KEY]
  );

  /* -------------------- DEBOUNCE CITY INPUT -------------------- */
  useEffect(() => {
    if (city.trim().length < 3) {
      setSuggestion([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestion(city);
    }, 500);

    return () => clearTimeout(timer);
  }, [city, fetchSuggestion]);

  /* -------------------- WEATHER FETCH -------------------- */
  const fetchWeatherData = async (url, name = "") => {
    setError("");
    setWeather(null);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "City not found");
      }

      const data = await response.json();
      setWeather(data);
      setCity(name || data.name);
      setSuggestion([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return setError("Please enter a valid city name.");

    fetchWeatherData(
      `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&appid=${API_KEY}&units=metric`
    );
  };

  /* -------------------- WEATHER BACKGROUND -------------------- */
  const weatherCondition = useMemo(() => {
    if (!weather) return null;

    const now = Date.now() / 1000;
    return {
      main: weather.weather[0].main,
      isDay: now > weather.sys.sunrise && now < weather.sys.sunset,
    };
  }, [weather]);

  /* -------------------- TEMP FORMAT -------------------- */
  const formatTemp = (temp) =>
    unit === "C"
      ? temp.toFixed(1)
      : ((temp * 9) / 5 + 32).toFixed(1);

  /* ==================== UI ==================== */
  return (
    <div>
      <WeatherBackground condition={weatherCondition} />

      <div className="flex items-center justify-center p-6 min-h-screen">
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8 max-w-md text-white w-full border border-white/30 relative z-10">
          <h1 className="text-4xl font-extrabold text-center mb-6">
            Weather App
          </h1>

          {error && (
            <p className="text-red-300 text-center mb-4">{error}</p>
          )}

          {!weather ? (
            <form onSubmit={handleSearch} className="flex flex-col relative">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onBlur={() => setTimeout(() => setSuggestion([]), 150)}
                placeholder="Enter City or Country"
                className="mb-4 p-3 rounded border border-white bg-transparent text-white placeholder-white focus:outline-none focus:border-blue-300 transition"
              />

              {suggestion.length > 0 && (
                <div className="absolute top-12 left-0 right-0 bg-black/30 rounded z-10">
                  {suggestion.map((s) => (
                    <button
                      key={`${s.lat}-${s.lon}`}
                      type="button"
                      onClick={() =>
                        fetchWeatherData(
                          `https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.lon}&appid=${API_KEY}&units=metric`,
                          `${s.name}, ${s.country}${s.state ? `, ${s.state}` : ""}`
                        )
                      }
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-blue-700 transition"
                    >
                      {s.name}, {s.country}
                      {s.state && `, ${s.state}`}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="submit"
                className="bg-purple-700 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
              >
                Get Weather
              </button>
            </form>
          ) : (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setWeather(null);
                  setCity("");
                  setSuggestion([]);
                }}
                className="mb-4 bg-purple-900 hover:bg-blue-700 px-3 py-1 rounded transition"
              >
                New Search
              </button>

              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">{weather.name}</h2>
                <button
                  onClick={() => setUnit((u) => (u === "C" ? "F" : "C"))}
                  className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded"
                >
                  °{unit}
                </button>
              </div>

              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
                className="mx-auto my-4 animate-bounce"
              />

              <p className="text-5xl font-bold">
                {formatTemp(weather.main.temp)}°{unit}
              </p>

              <p className="capitalize text-lg opacity-80">
                {weather.weather[0].description}
              </p>

              <p className="text-sm opacity-80 mt-2">
                Feels like {formatTemp(weather.main.feels_like)}°{unit}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
