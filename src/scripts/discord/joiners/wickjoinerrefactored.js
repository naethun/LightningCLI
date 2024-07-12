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
const Captcha = require("2captcha"); //solve cap
const {
    config
} = require("dotenv");

class WickJoiner {
    //inquire DATA
    messagelink;
    guild_id;
    channel_id;
    message_id;

    // CONFIG DATA
    taskID
    invites;
    delay;
    token;
    apiKey;

    // CLASS DATA
    inviteCode;
    fingerprint;
    cookie;
    proxyData;
    xContentHeader;
    count;

    captcha
    code

    logger;
    logs;

    needCaptcha;
    captcha_rqtoken;
    captcha_key;
    emojiFound;

    constructor(taskNum, invite, delay, token, apiKey) {

        this.messagelink = 'https://discord.com/channels/986025451430481941/986029948340940810/986029988904071188'
        this.guild_id = messagelink.split('/')[4]
        this.channel_id = messagelink.split('/')[5]
        this.message_id = messagelink.split('/')[6];




        this.taskID = taskNum;
        this.invite = invite;
        this.delay = delay;
        this.token = token;
        this.apiKey = apiKey;

        this.inviteCode;
        this.fingerprint;
        this.cookie;
        this.proxyData = {};
        this.agent;
        this.xContentHeader;
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
        this.emojiFound = false;
    }

    async logIt(data) {
        timeout(this.delay)
        let type = this.success == false ? "error" : "info"
        await this.logger.handle(type, `[TASK-${this.taskID}] - ${data}`, true, false)
        this.logs.push({
            type: type,
            info: `[JOINER-${this.taskID}] - ${data}`
        })
        return
    }

    async init() {
        await this.logIt("Starting task...")
        await this.setup()
        .then(await this.join())
        .then(async () => {
            if (this.needCaptcha) await this.joincap()
        })
            .catch(error => {
                console.log("caught error")
                console.log(error.message)
            })


        if (this.success == true) {
            this.success == false
            await this.logIt("Solving wick verification!")
            await this.clickwick()
            await this.getcaptcha()
            await this.solvecaptcha()
            await this.returncode()
        } else {
            await this.logIt(this.errMsg)
            return {
                success: false,
                logs: this.logs
            }
        }

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
            await this.grabInviteCode()
            await this.cookies()
            await this.getXcontent()
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

    async grabInviteCode() {
        if (this.running == false) return
        await this.logIt("Pulling invite code...")
        try {
            this.inviteCode = this.invite.split("/")[this.invite.split("/").length - 1]
        } catch (e) {
            throw new Error(e.message)
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

    async getXcontent() {
        if (this.running == false) return
        await this.logIt("Fetching header...")
        try {
            this.xContentHeader = await Xcontents(this.agent, this.inviteCode)
            return
        } catch (e) {
            throw new Error(`Failed while fetching headers: ${e.message}`)
        }
    }

    async join() {
        if (this.running == false) return
        try {
            let response = await Join(this.agent, this.inviteCode, this.xContentHeader, this.token, this.fingerprint, this.cookie);

            if (await this.checkRes(response) == false) {

                if (response.data.captcha_key) {
                    let data = response.data.captcha_rqdata
                    await this.logIt("Need captcha to join...")
                    this.captcha_rqtoken = response.data.captcha_rqtoken;
                    this.captcha_key = await CaptchaSolver(this.apikey, data)
                    await this.getfingerprint() //gens new fingerprint
                    await this.cookies() // gets new cookie
                    await this.joincap() //join but with captcha
                    this.needCaptcha = true;
                    return
                } else {
                    throw new Error("Failed while joining server!")
                }
            }
            if (response.data.new_member) {
                this.success = true;
                this.logIt(`${Bright}Successfully joined server!`)
            } else {
                this.success = true;
                this.logIt(`${Bright}Account disabled or already in server!`)
            }
        } catch (e) {
            this.success = false;
            this.errMsg = "Failed while joining server!";
        }
    }

    async joincap() {
        if (this.running == false) return
        try {
            let response = await JoinCaptcha(this.agent, this.inviteCode, this.captcha_key, this.captcha_rqtoken, this.xContentHeader, this.token, this.fingerprint, this.cookie);
            if (await this.checkRes(response) == false) {
                throw new Error("Failed while joining server!")
            }
            if (response.data.new_member) {
                this.success = true;
                this.logIt(`${Bright}Successfully joined server!`)
            } else {
                this.success = true;
                this.logIt(`${Bright}Account disabled or already in server!`)
            }
        } catch (e) {
            this.success = false;
            this.errMsg = "Failed while joining server!";
        }
    }

    async clickwick() {
        if (this.running == false) return
        try {
            //clicks verify button
            const config = {
                httpsAgent: this.agent, //proxy here
                method: "post",
                url: `https://discord.com/api/v9/interactions`,
                data: {
                    "type": 3,
                    "nonce": `${getRandomInt(18)}`,
                    "guild_id": `${this.guild_id}`,
                    "channel_id": `${this.channel_id}`,
                    "message_flags": 0,
                    "message_id": `${this.message_id}`,
                    "application_id": "548410451818708993",
                    "session_id": "33b54503960e3bb1f2a0f413e1ce5a13",
                    "data": {
                        "component_type": 2,
                        "custom_id": "v_911148730357522442_Z8lqex9Gzx"
                    }
                },
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
            if (await this.checkRes(response) == false) {
                throw new Error("Failed while clicking button!")
            }
            await logIt(`Successfully clicked button!`)
        } catch (e) {
            this.success = false;
            this.errMsg = "Failed while clicking button!";
            this.running == false
        }
    }

    async getcaptcha() {
        if (this.running == false) return
        try {
            await this.sleep(1500)
            const config = {
                httpsAgent: this.agent, //proxy here
                method: "get",
                url: `https://discord.com/api/v9/channels/941503447008686141/messages?limit=1`,
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
            if (await this.checkRes(response) == false) {
                throw new Error("Failed while getting captcha!")
            }
            await logIt(`Successfully got captcha!`)
        } catch (e) {
            this.success = false;
            this.errMsg = "Failed while getting captcha!";
            this.running == false
        }
        this.captcha = response
    }
    async solvecaptcha() {
        if (this.running == false) return
        try {
            let captcha = captcha.data[0].embeds[0].image.url
            let client = new Client(this.apiKey, {
                timeout: 60000,
                polling: 2000,
                throwErrors: true
            });
            client.decode({
                url: captcha
            })
            let response = await client.decode()
            let content = response.text
            await logIt(`Successfully solved captcha!`)
            code = content
        } catch (e) {
            this.success = false;
            this.errMsg = "Failed while solving captcha!";
            this.running == false
        }
    }

    async returncode(code) {
        if (this.running == false) return
        try {
            //returns code once done
            const config = {
                httpsAgent: this.agent, //proxy here
                method: "post",
                url: `https://discord.com/api/v9/channels/941503447008686141/messages`,
                data: {
                    "content": `${code}`,
                    "nonce": `${this.getRandomInt(18)}`,
                    "tts": false
                },
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
            if (await this.checkRes(response) == false) {
                throw new Error("Failed while solving wick verifcation!")
            }
            await logIt(`${Bright}Successfully solved wick verifcation!`)
            this.success = true;
        } catch (e) {
            this.success = false;
            this.errMsg = "Failed while solving wick verifcation!";
        }
    }
    async sleep(milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
            currentDate = Date.now();
        } while (currentDate - date < milliseconds);
    }
     getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
}
module.exports = WickJoiner;