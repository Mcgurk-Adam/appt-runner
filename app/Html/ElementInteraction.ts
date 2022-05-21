const { By } = require('selenium-webdriver');
// @ts-ignore I hate hate hate ignoring this...but it just isn't an issue
const { Command } = require("../Command");
// @ts-ignore I hate hate hate ignoring this...but it just isn't an issue
class ElementInteraction {
    private driver;
    constructor(driver) {
        this.driver = driver;
    }
    async querySelector(query:string, parentElement = null) {
        try {
            if (parentElement) {
                return await parentElement.findElement(By.css(query));
            }
            return await this.driver.findElement(By.css(query));
        } catch (e) {
            return null;
        }
    }
    async querySelectorAll(query:string, parentElement = null) {
        try {
            if (parentElement) {
                return await parentElement.findElements(By.css(query));
            }
            return await this.driver.findElements(By.css(query));
        } catch (e) {
            return null;
        }
    }
    async getElementById(id:string) {
        try {
            return await this.driver.findElement(By.id(id));
        } catch (e) {
            return null;
        }
    }
    async getElementByName(name:string) {
        try {
            return await this.driver.findElement(By.name(name));
        } catch (e) {
            return null;
        }
    }
    async type(element, value:string): Promise<void> {
        await element.sendKeys(value);
        await Command.wait(50);
    }
    async click(element): Promise<void> {
        await element.click();
        await Command.wait(50);
    }
}
module.exports.ElementInteraction = ElementInteraction;