/**
 * name : app.js
 * author : Aman Kumar Gupta
 * Date : 29-Sep-2021
 * Description : Start file of a user service
 */

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const expressFileUpload = require("express-fileupload");
const redoc = require("redoc-express");
// const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./api-doc/api.json");

require("dotenv").config({ path: "./.env" });

let environmentData = require("./envVariables")();

if (!environmentData.success) {
  console.log(
    "Server could not start . Not all environment variable is provided"
  );
  process.exit();
}

require("./configs");

const app = express();

// Health check
require("./health-checks")(app);

app.use(cors());

app.use(expressFileUpload());

// serve your swagger.json file
app.get("/temp/swagger", (req, res) => {
  res.sendFile("api-doc/temp.json", { root: "." });
});

// define title and specUrl location
// serve redoc
app.get(
  "/temp",
  redoc({
    title: "API Docs",
    specUrl: "/temp/swagger",
  })
);

// serve your swagger.json file
app.get("/docs/swagger", (req, res) => {
  res.sendFile("api-doc/api.json", { root: "." });
});
app.get(
  "/docs",
  redoc({
    title: "API Docs",
    specUrl: "/docs/swagger",
  })
);
// app.use("/api-docs", swaggerUi.serve);
// app.get("/api-docs", swaggerUi.setup(swaggerDocument));
app.use(bodyParser.urlencoded({ extended: true, limit: "50MB" }));
app.use(bodyParser.json({ limit: "50MB" }));

app.use(express.static("public"));

/* Logs request info if environment is configured to enable log */
if (process.env.ENABLE_LOG === "true") {
  app.all("*", (req, res, next) => {
    console.log("***User Service Logs Starts Here***");
    console.log(
      "Request Type %s for %s on %s from ",
      req.method,
      req.url,
      new Date()
    );
    console.log("Request Headers: ", req.headers);
    console.log("Request Body: ", req.body);
    console.log("Request Files: ", req.files);
    console.log("***User Service Logs Ends Here***");
    next();
  });
}

/* Registered routes here */
require("./routes")(app);

// Server listens to given port
app.listen(process.env.APPLICATION_PORT, (res, err) => {
  if (err) {
    onError(err);
  }
  console.log("Environment: " + process.env.APPLICATION_ENV);
  console.log(
    "Application is running on the port:" + process.env.APPLICATION_PORT
  );
});

// Handles specific listen errors with friendly messages
function onError(error) {
  switch (error.code) {
    case "EACCES":
      console.log(
        process.env.APPLICATION_PORT + " requires elevated privileges"
      );
      process.exit(1);
    case "EADDRINUSE":
      console.log(process.env.APPLICATION_PORT + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
}
