import { app } from "./src/app.js";
import { initRabbitMQ } from "./src/rabbitmq/connection.js";
import { intialData } from "./src/utils/initial-data.js";
import dotenv from "dotenv";

dotenv.config();
const port = 8080;

async function main() {
  try {
    await initRabbitMQ();

    if (process.env.RUN_INITIAL_DATA === "true") {
      await intialData();
    }

    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (err) {
    console.error("❌ Gagal inisialisasi:", err);
    process.exit(1);
  }
}

main();
