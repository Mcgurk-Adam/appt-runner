// @ts-ignore hate ignoring this, it's just not an issue
const { Command } = require("./Command");
const { Key } = require('selenium-webdriver');

// @ts-ignore hate ignoring this, it's just not an issue
async function login(driver, document): Promise<void> {
    await driver.get(process.env.LOGIN_PAGE);
    const title = await driver.getTitle();
    if (!title.toLowerCase().includes(process.env.CONFIRMATION_TEXT)) {
        throw new Error("Did not get to the page");
    }
    await Command.wait(2000);
    const loginInput = await document.getElementByName("requiredtxtUserName");
    const passwordInput = await document.getElementByName("requiredtxtPassword");
    const loginButton = await document.getElementByName("btnSignUp2");
    await document.type(loginInput, process.env.USERNAME);
    await document.type(passwordInput, process.env.PASSWORD);
    await document.click(loginButton);
}

// @ts-ignore hate ignoring this, it's just not an issue
async function navigateToKidsZone(document): Promise<void> {
    const kidsZoneLink = await document.getElementById("tabA104");
    await document.click(kidsZoneLink);
}

// @ts-ignore hate ignoring this, it's just not an issue
async function goToCorrectDate(document, desiredDate): Promise<void> {
    const dateInput = await document.getElementById("txtDate");
    const dateValue = await dateInput.getAttribute("value");
    await Command.wait(100);
    for (let i = 0; i < dateValue.length; i++) {
        await document.type(dateInput, Key.BACK_SPACE);
        await Command.wait(50);
    }
    await document.type(dateInput, desiredDate);
    await document.type(dateInput, Key.RETURN);
}

async function getCorrectDayOfWeekRow(document, desiredDate) {
    const dateObject = new Date(desiredDate);
    const dayArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayOfWeekString = dayArray[dateObject.getDay()];
    const tableRows = await document.querySelectorAll("table#classSchedule-mainTable tbody tr");
    let foundDayOfWeek = false;
    let dayOfWeekRow;
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
            dayOfWeekRow = row;
            break;
        }
    }
    return dayOfWeekRow;
}

module.exports = {
    login: login,
    navigateToKidsZone: navigateToKidsZone,
    goToCorrectDate: goToCorrectDate,
};