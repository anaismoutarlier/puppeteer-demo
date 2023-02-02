const puppeteer = require("puppeteer");
const moment = require("moment");
const fs = require("fs").promises;

const getText = el => {

}

const getURL = arr => {
}

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

    // await page.screenshot({
  //   path: `./images/${Date.now()}.png`,
  // });

  // await page.addScriptTag({
  //   content: `
  //     const header = document.querySelector("#sticky-menu");
  //     header.style.backgroundColor = "red";
  //   `,
  // });

  // const count = await page
  //   .$("div.sc-hjsNop.wKrlJ > span")
  //   .then(el => el.getProperty("textContent"))
  //   .then(el => el.jsonValue())
  //   .then(el => Number(el.toString()));

  // const pageCount = Math.ceil(count / 30);

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

  for (const hit of finalList) {
    console.log(`Navigating to ${hit.title}.`)
    await page.goto(hit.link, {
      waitUntil: "domcontentloaded"
    });

    const jobData = await page.evaluate(() => {
      const companyLink = document.querySelector(`a[data-testid="job-header-organization-link-logo"]`).href;

      const metas = document.querySelector(`ul[data-testid="job-summary-job-metas"]`).children;
      const metaData = [];

      for (const li of metas) {
        metaData.push(li.textContent.trim())
      }
      return {
        company: companyLink,
        metas: metaData
      }
    });
    console.log(jobData)
    break;
  }

  // await fs.writeFile("./jobs.json", JSON.stringify(finalList, null, 2));
  // console.log("Joblist saved.");


  // UNMOUNT
  await browser.close();
  console.log("Browser closed.");
};

module.exports = scrap;
