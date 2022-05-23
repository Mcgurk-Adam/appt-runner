import {login} from "../../app/actions";

const { Builder, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fetch = require("node-fetch");
// @ts-ignore I hate hate hate ignoring this...but it just isn't an issue
const { Command } = require("../../app/Command");
// @ts-ignore I hate hate hate ignoring this...but it just isn't an issue
const { ElementInteraction } = require("../../app/Html/ElementInteraction");
const command = new Command(process);
command.validateNoTime();
const service = new chrome.ServiceBuilder(process.env.CHROMEWEBDRIVER);
console.log(process.env.CHROMEWEBDRIVER);
const driver = new Builder().forBrowser("chrome").setChromeService(service).build();
const document = new ElementInteraction(driver);
console.log(`Checking available kids zone appointments for ${command.desiredDate}`);
(async () => {
    await command.performActionInBrowser("login", login(driver, document));
    await command.performActionInBrowser("navigate to kids zone", async () => {
        const kidsZoneLink = await document.getElementById("tabA104");
        await document.click(kidsZoneLink);
    });
    await command.performActionInBrowser("go to the correct date", async () => {
        const dateInput = await document.getElementById("txtDate");
        const dateValue = await dateInput.getAttribute("value");
        await Command.wait(100);
        for (let i = 0; i < dateValue.length; i++) {
            await document.type(dateInput, Key.BACK_SPACE);
            await Command.wait(50);
        }
        await document.type(dateInput, command.desiredDate);
        await document.type(dateInput, Key.RETURN);
    });
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
        if (timeArray.length === 0) {
            console.log(`There are no kids zone appointments to be scheduled for ${command.desiredDate}`);
        }
        if (command.isDryRun) {
            console.log(`would call ${command.getEnvVariable("APP_URL")}/github/send-time-options with the payload of ${JSON.stringify({possible_dates: timeArray})}`);
        } else {
            const fetchRequest = await fetch(`${command.getEnvVariable("APP_URL")}/github/send-time-options`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Auth-Token": command.getEnvVariable("APP_TOKEN"),
                },
                body: JSON.stringify({
                    possible_dates: timeArray,
                })
            });
            if (!fetchRequest.ok) {
                console.log(`Fetch failed with the code of ${fetchRequest.status}`);
                process.exit(1);
            }
        }
    });
})();