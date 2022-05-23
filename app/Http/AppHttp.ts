const fetch = require("node-fetch");
// @ts-ignore I hate hate hate ignoring this...but it just isn't an issue
class AppHttp {
    private readonly appDomain:string;
    private readonly isDryRun:boolean;
    private fetchOptions;
    constructor(isDryRun = false) {
        this.appDomain = process.env.APP_URL;
        const appToken = process.env.APP_TOKEN;
        this.fetchOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Auth-Token": appToken,
            }
        };
        this.isDryRun = isDryRun;
    }
    async get(path:string) {
        this.fetchOptions.method = "GET";
        if (this.isDryRun) {
            console.log(`Would GET ${this.appDomain + path}`);
        } else {
            const req = await fetch(this.appDomain + path, this.fetchOptions);
            return await AppHttp.handleResponse(req);
        }
    }
    async post(path:string, data:string) {
        this.fetchOptions.body = data;
        if (this.isDryRun) {
            console.log(`Would POST to ${this.appDomain + path} with body of ${data}`);
        } else {
            const req = await fetch(this.appDomain + path, this.fetchOptions);
            return await AppHttp.handleResponse(req);
        }
    }
    private static async handleResponse(fetchRequest) {
        if (!fetchRequest.ok) {
            const output = await fetchRequest.text();
            console.log(`Fetch request failed with code ${fetchRequest.status} and text ${output}`);
        } else if (fetchRequest.status === 200) {
            return await fetchRequest.json();
        }
    }
}
module.exports.AppHttp = AppHttp;