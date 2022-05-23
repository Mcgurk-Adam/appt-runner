const fetch = require("node-fetch");
class AppHttp {
    private readonly appDomain:string;
    private headers:Headers;
    constructor() {
        this.appDomain = process.env.APP_URL;
        const appToken = process.env.APP_TOKEN;
        this.headers = new Headers({
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Auth-Token": appToken,
        });
    }
    async get(path:string) {
        const req = await fetch(this.appDomain + path, {
            method: "GET",
            headers: this.headers,
        });
        return await AppHttp.handleResponse(req);
    }
    async post(path:string, data:string) {
        const req = await fetch(this.appDomain + path, {
            method: "POST",
            headers: this.headers,
            body: data,
        });
        return await AppHttp.handleResponse(req);
    }
    private static async handleResponse(fetchRequest:Request) {
        if (!fetchRequest.ok) {
            const output = await fetchRequest.text();
            console.log(`Fetch request failed with code ${fetchRequest.status} and text ${output}`);
        } else if (fetchRequest.status === 200) {
            return await fetchRequest.json();
        }
    }
}