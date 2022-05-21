const fs = require("fs");
// @ts-ignore I hate hate hate ignoring this...but it just isn't an issue
class Command {
    static "DRIVER_ENV_NAME" = "CHROMEWEBDRIVER";
    private process:NodeJS.Process;
    public desiredDate:string;
    public desiredTime:string;
    public isDryRun:boolean;
    public chromeDriverName:string;
    constructor(process:NodeJS.Process) {
        this.process = process;
        this.isDryRun = process.argv.includes("--dry-run");
    }
    validate(): void {
        const rawDate = this.process.argv[2];
        const rawTime = this.process.argv[3];
        // @todo add the regex here
        if (rawDate) {
            this.desiredDate = rawDate;
        } else {
            Command.badArgumentErrors("Date must be provided and match the format mm/dd/yyyy");
        }
        if (rawTime && rawTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
            this.desiredTime = rawTime;
        } else {
            Command.badArgumentErrors("Time must be provided and match the format HH:MM");
        }
        const rawDriverName = this.getEnvVariable(Command.DRIVER_ENV_NAME);
        if (rawDriverName && fs.existsSync(rawDriverName)) {
            this.chromeDriverName = rawDriverName;
        } else {
            Command.badArgumentErrors("The environment variable CHROMEWEBDRIVER must be populated and point to a valid driver file");
        }
    }
    validateNoTime(): void {
        const rawDate = this.process.argv[2];
        // @todo add the regex here
        if (rawDate) {
            this.desiredDate = rawDate;
        } else {
            Command.badArgumentErrors("Date must be provided and match the format mm/dd/yyyy");
        }
        const rawDriverName = this.getEnvVariable(Command.DRIVER_ENV_NAME);
        if (rawDriverName && fs.existsSync(rawDriverName)) {
            this.chromeDriverName = rawDriverName;
        } else {
            Command.badArgumentErrors("The environment variable CHROMEWEBDRIVER must be populated and point to a valid driver file");
        }
    }
    /**
     * This is where you handle the custom actions to perform...login, navigation, etc...
     * @param {string} actionName give this a describable name, so it's discernible
     * @param {Function} action this handles all the logic for performing your action
     */
    async performActionInBrowser(actionName:string, action:Function): Promise<void> {
        try {
            await Command.wait(1500);
            console.log(`${actionName}`);
            await action();
            console.log(`Completed ${actionName}`);
            await Command.wait(1500);
        } catch (e) {
            console.log(`Error thrown while performing action in a browser, message is: ${e.message}`);
            throw e;
        }
    }
    static async wait(milliseconds): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
    private static badArgumentErrors(customMessage:string = ""): void {
        console.error(`Data validation for the command failed. The syntax to call the command is: \n node index.js "2022-04-21" "9:30" --dry-run \n`);
        throw new Error(customMessage);
    }
    getEnvVariable(name:string): string|null {
        return this.process.env[name];
    }
}
module.exports.Command = Command;