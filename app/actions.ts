// @ts-ignore hate ignoring this, it's just not an issue
const { Command } = require("./Command");

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

module.exports.login = login;