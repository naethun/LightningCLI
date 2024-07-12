const Log = require("../../log");
const axios = require("axios");
const {
    getRandomProxy
} = require("../../utils/handleProxies");
const {
    HttpsProxyAgent
} = require("https-proxy-agent");
const timeout = require("../../../pages/utils/timeout");
const {
    Bright
} = require("../../../pages/utils/colors");
const Fingerprints = require("../utils/fingerprint");
const GetCookie = require("../utils/getcookie");

class Checker {

    // CONFIG DATA
    taskID;
    delay;
    token;

    // CLASS DATA
    fingerprint;
    cookie;
    proxyData;
    count;

    logger;
    logs;

    constructor(taskNum, delay, token) {
        this.taskID = taskNum;
        this.delay = delay;
        this.token = token;

        this.fingerprint;
        this.cookie;
        this.proxyData = {};
        this.agent;
        this.count = 0;

        this.status = 'failed'
        this.aged = false;

        this.success = true;
        this.errMsg;
        this.running = true;

        this.logger = new Log();
        this.logger.create("CHECKER", false);

        this.logs = [];

    }

    async logIt(data) {
        timeout(this.delay)
        let type = this.success == false ? "error" : "info"
        await this.logger.handle(type, `[TASK-${this.taskID}] - ${data}`, true, false)
        this.logs.push({
            type: type,
            info: `[CHECKER-${this.taskID}] - ${data}`
        })
        return
    }

    async init() {
        await this.logIt("Starting task...")
        await this.get_proxy()
            .then(await this.getfingerprint())
            .then(await this.cookies())
            .then(await this.checker())
            .catch(error => {
                console.log("caught error")
                console.log(error.message)
            })

            // await browserlogin(this.token, this.proxyData)

        if (this.success == true) {
            return {
                success: true,
                logs: this.logs,
                status: this.status,
                aged: this.aged
            }
        } else {
             await this.logIt(this.errMsg)
            return {
                success: false,
                logs: this.logs,
                status: this.status,
                aged: this.aged
            }
        }

    }

    async get_proxy() {
        if (this.running == false) return
        await this.logIt("Getting proxy...")
        try {
            let proxy = (await getRandomProxy()).split(":")
            this.proxyData = {
                host: proxy[0],
                port: proxy[1],
                user: proxy[2],
                pass: proxy[3],
                proxyURL: `http://${proxy[2]}:${proxy[3]}@${proxy[0]}:${proxy[1]}`
            }
            this.agent = new HttpsProxyAgent(this.proxyData.proxyURL);
            return
        } catch (err) {
            this.running = false;
            this.success = false;
            this.errMsg = err.message;
            console.log(this.errMsg)
        }
    }


    async checkRes(res) {
        if (this.running == false) return
        if (res.status != 200) {
            this.success = false
            this.running = false
            return false
        }
        return true
    }

    async getfingerprint() {
        if (this.running == false) return
        await this.logIt("Fetching fingerprint...")
        try {
            this.fingerprint = await Fingerprints()
            return
        } catch (e) {
            throw new Error(`Failed while fetching fingerprint: ${e.message}`)
        }
    }

    async cookies() {
        if (this.running == false) return
        await this.logIt("Building cookies...")
        try {
            this.cookie = await GetCookie(this.agent)
            return
        } catch (e) {
            throw new Error(`Failed while building cookies: ${e.message}`)
        }
    }
    async checker(){
        if (this.running == false) return
        await this.logIt("Checking account...")
    const config = {
        method: "get",
        url: `https://discordapp.com/api/v9/users/@me/guilds`,
        httpsAgent: this.agent,
        headers: {
            authority: "discord.com",
            scheme: "https",
            Connection: "close",
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            Authorization: this.token,
            referer: "https://discord.com/channels/@me",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36",
            "X-Fingerprint": this.fingerprint,
            "DNT": "1",
            "TE": "Trailers",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-orgin",
            "X-Super-Properties": "eyJvcyI6Ik1hYyBPUyBYIiwiYnJvd3NlciI6IlNhZmFyaSIsImRldmljZSI6IiIsInN5c3RlbV9sb2NhbGUiOiJlbi11cyIsImJyb3dzZXJfdXNlcl9hZ2VudCI6Ik1vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzEzXzYpIEFwcGxlV2ViS2l0LzYwNS4xLjE1IChLSFRNTCwgbGlrZSBHZWNrbykgVmVyc2lvbi8xMy4xLjIgU2FmYXJpLzYwNS4xLjE1IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTMuMS4yIiwib3NfdmVyc2lvbiI6IjEwLjEzLjYiLCJyZWZlcnJlciI6IiIsInJlZmVycmluZ19kb21haW4iOiIiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTE3OTE4LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==",
            Origin: "https://discord.com",
            cookie: this.cookie,
        },
    }
    await axios(config).then(async (response) => {
        if (response.status == 200) {
            await this.logIt(`${Bright}Account is vaild!`)
            this.status = 'Vaild'
            let id = atob(this.token.split('.')[0])
            const timestamp = ((id / 4194304) + 1420070400000);
            if (Date.parse(new Date(timestamp)) > 259200000) {
                await this.logIt(`${Bright}Account is aged!'`)
                this.aged = true
            } else {
                await this.logIt(`${Bright}Account is fresh!`)
            }
            this.success = true
        }
    }).catch( async (error) => {
        if (error.response.status == 403) {
            this.status = 'Locked'
            await this.logIt(`${Bright}Account is locked!`)
            
        }
        if (error.response.status == 401) {
            this.status = 'Disabled'
            await this.logIt(`${Bright}Account is Disabled!`)
        }
        this.success = true
    });
    }
}


module.exports = Checker;