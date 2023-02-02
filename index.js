const express = require('express');
const scraper = require("./modules/scraper");
const { CronJob } = require("cron");
const http = require("http");

const app = express();
const server = http.createServer(app);

function cron() {
  console.log("Cron launched");
  new CronJob("0 * * * *", () => scraper(
    `https://www.welcometothejungle.com/fr/jobs?groupBy=job&sortBy=mostRecent&query=javascript%20developer`
  ), null, true, "Europe/Paris")
}

cron();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));