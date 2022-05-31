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
        return await this.retrieve(By.css(query), false, parentElement);
    }
    async querySelectorAll(query:string, parentElement = null) {
        return await this.retrieve(By.css(query), false, parentElement);
    }
    async getElementById(id:string, parentElement = null) {
        return await this.retrieve(By.id(id), false, parentElement);
    }
    async getElementByName(name:string, parentElement = null) {
        return await this.retrieve(By.name(name), false, parentElement);
    }
    private async retrieve(byQuery, retrieveMultiple:boolean = false, parentElement = null) {
        let currentAttempts = 0;
        let element = null;
        while (currentAttempts < 3 && element == null) {
            try {
                element = await this.handleRetrieve(byQuery, retrieveMultiple, parentElement);
            } catch (e) {
                console.log(`Failed to get an element with message of ${e.message}`);
            }
        }
        return element;
    }
    private async handleRetrieve(byQuery, retrieveMultiple:boolean, parentElement) {
        if (retrieveMultiple) {
            return parentElement == null ? await this.driver.findElements(byQuery) : await parentElement.findElements(byQuery);
        } else {
            return parentElement == null ? await this.driver.findElement(byQuery) : await parentElement.findElement(byQuery);
        }
    }
}
module.exports.ElementInteraction = ElementInteraction;