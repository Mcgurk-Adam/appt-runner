// @ts-ignore hate ignoring this, it's just not an issue
const { login, navigateToKidsZone, goToCorrectDate } = require("../../app/actions");
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
// @ts-ignore I hate hate hate ignoring this...but it just isn't an issue
const { Command } = require("../../app/Command");
// @ts-ignore I hate hate hate ignoring this...but it just isn't an issue
const { AppHttp } = require("../../app/Http/AppHttp");
// @ts-ignore I hate hate hate ignoring this...but it just isn't an issue
const { ElementInteraction } = require("../../app/Html/ElementInteraction");
const command = new Command(process);
command.validate();
const service = new chrome.ServiceBuilder(process.env.CHROMEWEBDRIVER);
const driver = new Builder().forBrowser("chrome").setChromeService(service).build();
const document = new ElementInteraction(driver);
console.log(`Trying to schedule available kids zone appointments on ${command.desiredDate} at ${command.desiredTime}`);
(async () => {
    console.log("we do get here");
    await command.performActionInBrowser("login", async () => await login(driver, document));
    await command.performActionInBrowser("navigate to kids zone", async () => await navigateToKidsZone(document));
    await command.performActionInBrowser("go to the correct date", async () => await goToCorrectDate(document, command.desiredDate));
    await command.performActionInBrowser("click on the right button", async () => {
        const dateObject = new Date(command.desiredDate);
        const dayArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayOfWeekString = dayArray[dateObject.getDay()];
        const tableRows = await document.querySelectorAll("table#classSchedule-mainTable tbody tr");
        let foundDayOfWeek = false;
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
                const time = tdText.replace(/\s/g, '').replace(/[a-z]/gi, '');
                if (time === command.desiredTime) {
                    const tdTwo = await document.querySelector("td:nth-child(2)", row);
                    const reserveText = await tdTwo.getAttribute("innerHTML");
                    const appHttp = new AppHttp(command.isDryRun);
                    if (reserveText === "" || !reserveText.includes("(")) {
                        console.log("Sorry, the signup period has passed");
                    } else if (reserveText.replace(/\s/g, '').includes("0 Open")) {
                        console.log("Kids zone already full");
                        await appHttp.post("/github/confirm/booked", JSON.stringify({date: command.desiredDate, time: command.desiredTime}));
                    } else if (!reserveText.includes("Sign Up Now")) {
                        console.log("Signup period not open yet, will retry");
                        await appHttp.post("/github/requeue", JSON.stringify({
                            date: command.desiredDate,
                            time: command.desiredTime,
                        }));
                    } else {
                        const signupButton = await document.querySelector("input[type=button]", tdTwo);
                        await signupButton.click();
                        await Command.wait(2000);
                        break;
                    }
                    process.exit();
                }
            }
        }
    });
    await command.performActionInBrowser("schedule the appointment", async () => {

        const reservationButton = await document.querySelector(process.env.SCHEDULE_BUTTON_SELECTOR);
        if (command.isDryRun) {
            console.log(`Would have successfully scheduled an appointment on ${command.desiredDate} at ${command.desiredTime}`);
        } else {
            await reservationButton.click();
            const appHttp = new AppHttp(command.isDryRun);
            await appHttp.post("/github/confirm/schedule", JSON.stringify({
                date: command.desiredDate,
                time: command.desiredTime,
            }));
        }
    });
})();