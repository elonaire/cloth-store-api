const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const indexRouter = require("./api/routes/index");
const usersRouter = require("./api/routes/users");
const productsRouter = require("./api/routes/products");
const ordersRouter = require("./api/routes/orders");
const blogRouter = require("./api/routes/blog");
const cartRouter = require("./api/routes/cart");
const checkoutRouter = require("./api/routes/checkout");
const categoryRouter = require("./api/routes/category");
const filesRouter = require("./api/routes/files");

const app = express();
var whitelist = [
  "http://localhost:3006",
  "http://nimonaturals.com",
  "http://34.67.57.125:3006",
  "http://192.168.214.206:3006",
];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV === "production") {
  app.use("/", cors(corsOptions), indexRouter);
  app.use("/users", cors(corsOptions), usersRouter);
  app.use("/products", cors(corsOptions), productsRouter);
  app.use("/orders", cors(corsOptions), ordersRouter);
  app.use("/blog", cors(corsOptions), blogRouter);
  app.use("/cart", cors(corsOptions), cartRouter);
  app.use("/checkout", cors(corsOptions), checkoutRouter);
  app.use("/category", cors(corsOptions), categoryRouter);
  app.use("/files", cors(corsOptions), filesRouter);
} else if (
  process.env.NODE_ENV === "development" ||
  process.env.NODE_ENV === "test"
) {
  app.use(cors());
  app.use("/", indexRouter);
  app.use("/users", usersRouter);
  app.use("/products", productsRouter);
  app.use("/orders", ordersRouter);
  app.use("/blog", blogRouter);
  app.use("/cart", cartRouter);
  app.use("/checkout", checkoutRouter);
  app.use("/category", categoryRouter);
  app.use("/files", filesRouter);
}

app.get("/callback", (req, res, next) => {
  console.log(req);
});

app.use((err, req, res, next) => {
  if (err) {
    if (err.statusCode) {
      res.status(err.statusCode).json(err);
    }
    res.status(500).json(err);
  } else {
    res.status(404).json({
      message: "Resource not found",
    });
  }
});

module.exports = app;
