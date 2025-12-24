import express from "express";
import {connectDB} from "./db.js";
import { PORT } from "./configs/index.js";
import app from "./app.js";

app.listen(PORT, async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(`Server is running on port ${PORT}`);
    process.exit(1);
  }
});
