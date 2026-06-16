

// import dotenv from "dotenv";
// dotenv.config({
//     path: './.env' });

// import { app } from "./app.js";
// import { connectMongo, connectPostgres } from "./db/index.js";

// const startServer = async () => {
//   try {
//     await connectMongo();
//     await connectPostgres();

//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//   } catch (err) {
//     console.error("Failed to start server:", err);
//     process.exit(1);
//   }
// };

// startServer();

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import http from "http";
import { app } from "./app.js";
import { connectMongo, connectPostgres } from "./db/index.js";
import { initSocket } from "./socketServer.js";

const startServer = async () => {
  try {
    await connectMongo();
    await connectPostgres();

    // Wrap Express in an http.Server so Socket.io can share the same port
    const httpServer = http.createServer(app);

    // Attach Socket.io
    initSocket(httpServer);

    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () =>
      console.log(`🚀 Server + Socket.io running on port ${PORT}`)
    );
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();