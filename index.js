const express = require("express");
const connectDB = require("./config/db");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
// const config = require("config");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());

// Define Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/levels", require("./routes/levels"));
app.use("/api/coins", require("./routes/coins"));
app.use("/api/hints", require("./routes/hints"));
app.use("/api/words", require("./routes/words")); // Mount word routes
app.use("/api/password", require("./routes/password"));
app.use("/api/daily", require("./routes/dailyChallenges"));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
