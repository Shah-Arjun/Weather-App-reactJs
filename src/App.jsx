import React, { useState } from "react";
import WeatherBackground from "./components/WeatherBackground";

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [suggestion, setSuggestion] = useState([]);

  const API_KEY = 'cb563880bcb4628d6c001ba9188c4864';

  // Function to fetch weather
  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      if (!res.ok) throw new Error("City not found");

      const data = await res.json();
      setWeather(data);
      setSuggestion([]);
    } catch (err) {
      alert(err.message);
    }
  };

  // Placeholder for suggested city fetch (optional)
  const fetchWeatherData = async (url, label) => {
    try {
      const res = await fetch(url);
      const data = await res.json();
      setWeather(data);
      setCity(label);
      setSuggestion([]);
    } catch (err) {
      console.error(err);
    }
  };

  // Get condition for background
  const getWatherCondition = () =>
    weather && {
      main: weather.weather[0].main,
      isDay:
        Date.now() / 1000 > weather.sys.sunrise &&
        Date.now() / 1000 < weather.sys.sunset,
    };

  return (
    <div>
      <WeatherBackground condition={getWatherCondition()} />

      <div className="flex items-center justify-center p-6 min-h-screen">
        <div className="bg-transparent backdrop-filter backdrop-blur-md rounded-xl shadow-2xl p-8 max-w-md text-white w-full border border-white/30 relative z-10">
          <h1 className="text-4xl font-extrabold text-center mb-6">Weather App</h1>

          {!weather ? (
            <form onSubmit={handleSearch} className="flex flex-col relative">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter City or Country"
                className="mb-4 p-3 rounded border border-white bg-transparent text-white placeholder-white focus:outline-none focus:border-blue-300 transition duration-300"
              />
              {suggestion.length > 0 && (
                <div className="absolute top-12 left-0 right-0 bg-transparent shadow-md rounded z-10">
                  {suggestion.map((s) => (
                    <button
                      type="button"
                      key={`${s.lat}-${s.lon}`}
                      onClick={() =>
                        fetchWeatherData(
                          `https://api.openweathermap.org/data/3.0/onecall?lat=${s.lat}&lon=${s.lon}&exclude=hourly,minutely&appid=${API_KEY}`,
                          `${s.name}, ${s.country}${s.state ? `, ${s.state}` : ""}`
                        )
                      }
                      className="block hover:bg-blue-700 bg-transparent px-4 py-2 text-sm text-left w-full transition-colors"
                    >
                      {s.name}, {s.country}
                      {s.state && `, ${s.state}`}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="submit"
                className="bg-purple-700 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Get Weather
              </button>
            </form>
          ) : (
            <div className="mt-6 text-center transition-opacity duration-500">
              <button
                onClick={() => {
                  setWeather(null);
                  setCity('');
                }}
                className="mb-4 bg-purple-900 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded transition-colors"
              >
                New Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
