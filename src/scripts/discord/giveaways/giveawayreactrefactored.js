const Log = require("../../log");
const axios = require("axios");
const {
    getRandomProxy
} = require("../../utils/handleProxies");
const utf8 = require('utf8');
const {
    HttpsProxyAgent
} = require("https-proxy-agent");
const timeout = require("../../../pages/utils/timeout");
const {
    Bright
} = require("../../../pages/utils/colors");
const Fingerprints = require("../utils/fingerprint");
const GetCookie = require("../utils/getcookie");

class GiveawayReact {

    // CONFIG DATA
    taskID
    invites;
    delay;
    token;
    apiKey;

    // CLASS DATA
    fingerprint;
    cookie;
    proxyData;
    count;

    logger;
    logs;

    constructor(taskNum, link, delay, token) {
        this.guild_id = link.split('/')[4]
        this.channel_id = link.split('/')[5]
        this.message_id = link.split('/')[6]
        this.taskID = taskNum;
        this.delay = delay;
        this.token = token;

        this.fingerprint;
        this.cookie;
        this.proxyData = {};
        this.agent;
        this.count = 0;

        this.success = true;
        this.errMsg;
        this.running = true;

        this.logger = new Log();
        this.logger.create("JOINER", false);

        this.logs = [];

        this.needCaptcha = false;
        this.captcha_rqtoken;
        this.captcha_key;
    }

    async logIt(data) {
        timeout(this.delay)
        let type = this.success == false ? "error" : "info"
        await this.logger.handle(type, `[TASK-${this.taskID}] - ${data}`, true, false)
        this.logs.push({
            type: type,
            info: `[GIVEAWAY-${this.taskID}] - ${data}`
        })
        return
    }

    async init() {
        await this.logIt("Starting task...")

        await this.setup()
            .then(async () => {
                let messages = await this.getmessages()
                let message = await this.findmessage(messages)
                await this.react(message)
            })
            .catch(error => {
                console.log("Caught Unexpected Error")
                console.log(error.message)
            })

        if (this.success == true) {
            return {
                success: true,
                logs: this.logs
            }
        } else {
            await this.logIt(this.errMsg)
            return {
                success: false,
                logs: this.logs
            }
        }

    }

    async setup() {
        try {
            await this.get_proxy()
            await this.getfingerprint()
            await this.cookies()
            return
        } catch (e) {
            this.running = false;
            this.success = false;
            this.errMsg = e.message;
            return
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
            throw new Error(err.message)
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
    async checkRess(res) {
        if (this.running == false) return
        if (res.status != 204) {
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


    async getmessages() {
        if (this.running == false) return
        try {
            await this.logIt("Getting messages...")
            const config = {
                method: "get",
                url: `https://discord.com/api/channels/${this.channel_id}/messages?limit=100`,
                httpsAgent: this.agent, //proxy here
                headers: {
                    authority: "discord.com",
                    scheme: "https",
                    Connection: "close",
                    "X-Fingerprint": this.fingerprint,
                    cookie: this.cookie,
                    accept: "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    Authorization: this.token,
                    referer: "https://discord.com/channels/@me",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36",
                    "DNT": "1",
                    "TE": "Trailers",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-orgin",
                    "X-Super-Properties": "eyJvcyI6Ik1hYyBPUyBYIiwiYnJvd3NlciI6IlNhZmFyaSIsImRldmljZSI6IiIsInN5c3RlbV9sb2NhbGUiOiJlbi11cyIsImJyb3dzZXJfdXNlcl9hZ2VudCI6Ik1vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzEzXzYpIEFwcGxlV2ViS2l0LzYwNS4xLjE1IChLSFRNTCwgbGlrZSBHZWNrbykgVmVyc2lvbi8xMy4xLjIgU2FmYXJpLzYwNS4xLjE1IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTMuMS4yIiwib3NfdmVyc2lvbiI6IjEwLjEzLjYiLCJyZWZlcnJlciI6IiIsInJlZmVycmluZ19kb21haW4iOiIiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTE3OTE4LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==",
                    Origin: "https://discord.com",
                },
            }
            let response = await axios(config)
            if (await this.checkRes(response) == false) {
                throw new Error("Failed while fetching messages!")
            }
            return response.data
        } catch (e) {
            this.success = false;
            this.errMsg = e.message;
        }
    }
    async findmessage(messages) {
        await this.logIt("Locating message...")
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            if (message.id == this.message_id) {
                return message
            }

        }
    }

    async react(message) {
        await this.logIt("Atempting to join giveaway...")
        if (this.running == false) return
        try {
            let emoji = message.reactions[0].emoji.name
            emoji = utf8.encode(emoji);
            const config = {
                httpsAgent: this.agent, //proxy here
                method: "PUT",
                url: `https://discord.com/api/v9/channels/${this.channel_id}/messages/${this.message_id}/reactions/${emoji}/%40me`,
                headers: {
                    authority: "discord.com",
                    scheme: "https",
                    Connection: "close",
                    accept: "*/*",
                    "X-Fingerprint": this.fingerprint,
                    cookie: this.cookie,
                    "accept-language": "en-US,en;q=0.9",
                    Authorization: this.token,
                    referer: "https://discord.com/channels/@me",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36",
                    "DNT": "1",
                    "TE": "Trailers",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-orgin",
                    "X-Super-Properties": "eyJvcyI6Ik1hYyBPUyBYIiwiYnJvd3NlciI6IlNhZmFyaSIsImRldmljZSI6IiIsInN5c3RlbV9sb2NhbGUiOiJlbi11cyIsImJyb3dzZXJfdXNlcl9hZ2VudCI6Ik1vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzEzXzYpIEFwcGxlV2ViS2l0LzYwNS4xLjE1IChLSFRNTCwgbGlrZSBHZWNrbykgVmVyc2lvbi8xMy4xLjIgU2FmYXJpLzYwNS4xLjE1IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTMuMS4yIiwib3NfdmVyc2lvbiI6IjEwLjEzLjYiLCJyZWZlcnJlciI6IiIsInJlZmVycmluZ19kb21haW4iOiIiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTE3OTE4LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==",
                    Origin: "https://discord.com",
                },
            }
            let response = await axios(config)
            if (await this.checkRess(response) == false) {
                throw new Error("Failed while joing giveaway!")
            }
            await this.logIt(`${Bright}Successfully joined giveaway!`)

        } catch (e) {
            this.success = false;
            this.errMsg = e.message;
        }
    }

}

module.exports = GiveawayReact;