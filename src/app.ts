import express from "express";
import cors from "cors";
import businessRoutes from "./routes/business.routes";
import { protectedRoutes, publicRoutes } from "./routes";

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/", protectedRoutes);
app.use("/public", publicRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
