"use strict";

if (process.env.NODE_ENV === "production") {
  module.exports = require("./html.production.js");
} else {
  module.exports = require("./html.development.js");
}
