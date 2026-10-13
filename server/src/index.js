import "dotenv/config";
import app from "./app.js";
import { checkDbConnection } from "./config/checkDb.js";

const PORT = process.env.PORT || 4000;

// Verificăm baza de date înainte să pornim serverul; dacă nu merge, oprim procesul cu un mesaj clar.
const dbOk = await checkDbConnection();
if (!dbOk) process.exit(1);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Outfitly API pe portul ${PORT}`);
});