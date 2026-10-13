import { HttpError } from "../utils/httpError.js";
import { getWeather } from "../services/weather.service.js";

// GET /weather?lat=47.01&lon=28.86 -> { temperature, condition, summary }
export const current = async (req, res, next) => {
  try {
    const { lat, lon } = req.validQuery;
    res.json(await getWeather(lat, lon));
  } catch (e) {
    console.error("weather:", e.message);
    next(new HttpError(502, "WEATHER_UNAVAILABLE", "Nu pot afla vremea acum. Încearcă din nou puțin mai târziu."));
  }
};
