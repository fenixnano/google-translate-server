const translate = require("google-translate-cn-api");
const stdio = require("stdio");
const express = require("express");
const date = require("date-and-time");
const bodyParser = require('body-parser');
const he = require('he');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}))
// parse application/json
app.use(bodyParser.json())

const ops = stdio.getopt({
  port: {
    key: "p",
    args: 1,
    description: "running port",
    default: 30031
  },
  domain: {
    key: "d",
    args: 1,
    description: "google translate port",
    default: "com",
  },
});
const port = parseInt(ops.port);
const domain = ops.domain;

// log functionalities
const timeFormat = date.compile("YYYY/MM/DD HH:mm:ss");
const prettyJson = (object) =>
  JSON.stringify(object)
  .replace(/"/g, "")
  .replace(/([,:])/g, "$1 ");

function log(req, text, status) {
  const now = date.format(new Date(), timeFormat);
  let ip = req.connection.remoteAddress;
  const params = prettyJson(req.query);
  console.log(`${now} [${ip}] ${status}  "${text}"  ${params}`);
}

// express server
app.get("/", function (req, res) {
  const text = he.decode(req.query.text);
  // delete req.query.text;

  translate(text, {
      ...{
        domain: domain
      },
      ...req.query
    })
    .then((resp) => res.json(resp) && log(req, text, 200))
    .catch((resp) => res.status(400).json(resp) && log(req, text, 400));
});

function logPost(req, text, status) {
  const now = date.format(new Date(), timeFormat);
  let ip = req.connection.remoteAddress;
  const params = prettyJson(req.body);
  console.log(`${now} [${ip}] ${status}  "${text}"  ${params}`);
}

app.post("/", function (req, res) {
  const text = he.decode(req.body.text);
  // delete req.body.text;

  translate(text, {
      ...{
        domain: domain
      },
      ...req.body
    })
    .then((resp) => res.json(resp) && logPost(req, text, 200))
    .catch((resp) => res.status(400).json(resp) && logPost(req, text, 400));
});

app.listen(port, function () {
  console.log(
    "\n   ___ _____   ___\n" +
    "  / __|_   _| / __| ___ _ ___ _____ _ _\n" +
    " | (_ | | |   \\__ \\/ -_) '_\\ V / -_) '_|\n" +
    "  \\___| |_|   |___/\\___|_|  \\_/\\___|_|\n\n"
  );
  console.log(`App listening on port ${port}!`);
  console.log(
    `Default Google Translate domain: https://translate.google.${domain}/`
  );
  console.log("Incoming requests will be listed below:\n");
});