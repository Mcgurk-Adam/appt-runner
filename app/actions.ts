const { Command } = require("./Command");
const { ElementInteraction } = require("./Html/ElementInteraction");

// @ts-ignore
export async function login(driver, document:ElementInteraction): Promise<void> {
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