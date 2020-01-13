"use strict";

if (process.env.NODE_ENV === "production") {
  module.exports = require("./fuco.production.js");
} else {
  module.exports = require("./fuco.development.js");
}
