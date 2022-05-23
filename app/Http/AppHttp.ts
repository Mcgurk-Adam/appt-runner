const fetch = require("node-fetch");
// @ts-ignore I hate hate hate ignoring this...but it just isn't an issue
class AppHttp {
    private readonly appDomain:string;
    private fetchOptions;
    constructor() {
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
    }
    async get(path:string, isDryRun = true) {
        this.fetchOptions.method = "GET";
        if (isDryRun) {
            console.log(`Would GET ${this.appDomain + path}`);
        } else {
            const req = await fetch(this.appDomain + path, this.fetchOptions);
            return await AppHttp.handleResponse(req);
        }
    }
    async post(path:string, data:string, isDryRun = true) {
        this.fetchOptions.body = data;
        if (isDryRun) {
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