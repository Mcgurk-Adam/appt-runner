// @ts-ignore hate ignoring this, it's just not an issue
const { login, navigateToKidsZone, goToCorrectDate } = require("../../app/actions");

const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
// @ts-ignore I hate hate hate ignoring this...but it just isn't an issue
const { AppHttp } = require("../../app/Http/AppHttp");
// @ts-ignore I hate hate hate ignoring this...but it just isn't an issue
const { Command } = require("../../app/Command");
// @ts-ignore I hate hate hate ignoring this...but it just isn't an issue
const { ElementInteraction } = require("../../app/Html/ElementInteraction");
const command = new Command(process);
command.validateNoTime();
const service = new chrome.ServiceBuilder(Command.chromeDriverName);
const driver = new Builder().forBrowser("chrome").setChromeService(service).build();
const document = new ElementInteraction(driver);
console.log(`Checking available kids zone appointments for ${command.desiredDate}`);
(async () => {
    await command.performActionInBrowser("login", async () => await login(driver, document));
    await command.performActionInBrowser("navigate to kids zone", async () => await navigateToKidsZone(document));
    await command.performActionInBrowser("go to the correct date", async () => await goToCorrectDate(document, command.desiredDate));
    await command.performActionInBrowser("get all the possible times", async () => {
        const dateObject = new Date(command.desiredDate);
        const dayArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayOfWeekString = dayArray[dateObject.getDay()];
        const tableRows = await document.querySelectorAll("table#classSchedule-mainTable tbody tr");
        let foundDayOfWeek = false;
        const timeArray = [];
        for (const row of tableRows) {
            const firstTd = await document.querySelector("td", row);
            const className = await firstTd.getAttribute("class");
            const rowIsHeader = className.includes("header");
            if (rowIsHeader) {
                if (foundDayOfWeek) break;
                const labelElement = await document.querySelector(".headText", firstTd);
                const labelText = await labelElement.getAttribute("innerText");
                foundDayOfWeek = labelText.toLowerCase().includes(dayOfWeekString.toLowerCase());
            } else if (foundDayOfWeek) {
                const allTds = await document.querySelectorAll("td", row);
                // probably a weekend or a holiday
                if (allTds.length === 1) {
                    continue;
                }
                const tdText = await firstTd.getAttribute("innerText");
                const tdTwo = await document.querySelector("td:nth-child(2)", row);
                const reserveText = await tdTwo.getAttribute("innerText");
                // this means it is already completed
                if (reserveText === "") {
                    continue;
                }
                timeArray.push(tdText.replace(/\s/g, '').replace(/[a-z]/gi, ''));
            }
        }
        const appHttp = new AppHttp(command.isDryRun);
        await appHttp.post("/github/send-time-options", JSON.stringify({
            possible_dates: timeArray
        }));
    });
})();