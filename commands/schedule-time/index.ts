const { Builder, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fetch = require("node-fetch");
// @ts-ignore I hate hate hate ignoring this...but it just isn't an issue
const { Command } = require("../../app/Command");
// @ts-ignore I hate hate hate ignoring this...but it just isn't an issue
const { ElementInteraction } = require("../../app/Html/ElementInteraction");
const command = new Command(process);
command.validate();
const service = new chrome.ServiceBuilder(process.env.CHROMEWEBDRIVER);
const driver = new Builder().forBrowser("chrome").setChromeService(service).build();
const document = new ElementInteraction(driver);
console.log(`Trying to schedule available kids zone appointments on ${command.desiredDate} at ${command.desiredTime}`);
(async () => {
    await command.performActionInBrowser("login", async () => {
        await driver.get(process.env.LOGIN_PAGE);
        const title = await driver.getTitle();
        if (!title.toLowerCase().includes(process.env.CONFIRMATION_TEXT)) {
            throw new Error("Did not get to the page");
        }
        await Command.wait(4000);
        const loginInput = await document.getElementByName("requiredtxtUserName");
        const passwordInput = await document.getElementByName("requiredtxtPassword");
        const loginButton = await document.getElementByName("btnSignUp2");
        await document.type(loginInput, process.env.USERNAME);
        await document.type(passwordInput, process.env.PASSWORD);
        await document.click(loginButton);
    });
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
                    if (reserveText === "" || !reserveText.includes("(")) {
                        console.log("Sorry, the signup period has passed");
                    } else if (reserveText.replace(/\s/g, '').includes("0 Open")) {
                        console.log("Sorry, the kids zone is already booked");
                    } else if (!reserveText.includes("Sign Up Now")) {
                        console.log("Signup period not open yet, will retry");
                        if (command.isDryRun) {
                            console.log(`Would call ${command.getEnvVariable("APP_URL")}/github/requeue with the payload of ${JSON.stringify({date: command.desiredDate, time: command.desiredTime})}`);
                        } else {
                            const fetchRequest = await fetch(`${command.getEnvVariable("APP_URL")}/github/requeue`, {
                                method: "POST",
                                headers: {
                                    "Accept": "application/json",
                                    "Content-Type": "application/json",
                                    "Auth-Token": command.getEnvVariable("APP_TOKEN"),
                                },
                                body: JSON.stringify({
                                    date: command.desiredDate,
                                    time: command.desiredTime,
                                })
                            });
                            if (!fetchRequest.ok) {
                                console.log(`Fetch failed with the code of ${fetchRequest.status}`);
                                process.exit(1);
                            }
                        }
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
        }
    });
})();