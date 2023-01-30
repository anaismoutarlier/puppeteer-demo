const puppeteer = require("puppeteer");
const moment = require("moment");
const fs = require("fs").promises;

const scrap = async uri => {
  // INIT
  const browser = await puppeteer.launch({
    headless: true,
  });
  console.log(`Browser created.`);

  const page = await browser.newPage();
  console.log(`Page created.`);

  await page.goto(uri);
  console.log(`Navigated to path ${uri}.`);
  // PROCESS
  await page.mainFrame().waitForSelector("button#axeptio_btn_acceptAll");
  await page.click("button#axeptio_btn_acceptAll");

  const count = await page
    .$("div.sc-hjsNop.wKrlJ > span")
    .then(el => el.getProperty("textContent"))
    .then(el => el.jsonValue())
    .then(el => Number(el.toString()));

  const pageCount = Math.ceil(count / 30);

  const jobList = await page.evaluate(async () => {
    const data = [];

    const hitList = document.querySelectorAll("li.ais-Hits-list-item");

    for (const el of hitList) {
      console.log(el);
      const title = el.querySelector(".ais-Highlight").textContent;
      const link = el.querySelector("a").href;
      const createdAt = el.querySelector("time").dateTime;

      data.push({
        title,
        link,
        createdAt,
      });
    }
    return data;
  });

  const limit = moment().subtract(2, "hours");
  const finalList = jobList.filter(el =>
    moment(el.createdAt).isSameOrAfter(limit)
  );

  await fs.writeFile("./jobs.json", JSON.stringify(finalList, null, 2));
  console.log("Joblist saved.");
  // await page.screenshot({
  //   path: `./images/${Date.now()}.png`,
  // });

  // await page.addScriptTag({
  //   content: `
  //     const header = document.querySelector("#sticky-menu");
  //     header.style.backgroundColor = "red";
  //   `,
  // });

  // UNMOUNT
  await browser.close();
  console.log("Browser closed.");
};

scrap(
  `https://www.welcometothejungle.com/fr/jobs?groupBy=job&sortBy=mostRecent&query=javascript%20developer`
);
