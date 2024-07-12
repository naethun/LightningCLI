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

class GiveawayChecker {

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
    username;
    winner;

    logger;
    logs;

    constructor(taskNum, link, delay, token) {
        this.guild_id = link.split('/')[4]
        this.channel_id = link.split('/')[5]
        this.message_id = link.split('/')[6]
        this.taskID = taskNum;
        this.delay = delay;
        this.username
        this.winner = false
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
        this.logger.create("CHECKER", false);

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
            info: `[CHECKER-${this.taskID}] - ${data}`
        })
        return
    }

    async init() {
        await this.logIt("Starting task...")

        await this.setup()
            .then(async () => {
                await this.logIt("Attempting to fetch all messages...")
                let allMessages = await this.getAllMessages()
                await this.logIt("Attempting to fetch bot type...")
                let bot = await this.findbot(allMessages)
                await this.logIt("Attempting to fetch all new messages...")
                let newMessages = await this.getNewMessages(bot.new)
                await this.logIt("Attempting to fetching user info...")
                let userdata = await this.getuser()
                let userid = userdata.split(':')[0]
                this.username = userdata.split(':')[1]
                try {
                    if (bot.bot == 'GiveawayBot' || bot.bot == 'Giveaway Boat' || bot.bot == 'Dyno' || bot.bot == 'Invite Tracker') {
                        try {
                            let ended = await this.checkgiveaway(newMessages, 'Congratulations')
                            if (ended) {
                                await this.find(newMessages, userid)
                            } else {
                                throw new Error("Giveaway has not ended or no winner was found!")
                            }
                        } catch (e) {
                            this.success = false;
                            this.errMsg = e.message;
                        }
                    }
                    //next if
                    else {
                        throw new Error("This type of giveaway is not supported!")
                    }
                } catch (e) {
                    this.success = false;
                    this.errMsg = e.message;
                }
            })
            .catch(error => {
                console.log("Caught Unexpected Error")
                console.log(error.message)
            })

        if (this.success == true) {
            if (this.winner == true) {
                return {
                    success: true,
                    logs: this.logs,
                    winner: true,
                    username: this.username,
                    token: this.token
                }
            } else {
                await this.logIt(`${Bright} Not a winner better luck next time!`)
                return {
                    success: true,
                    logs: this.logs,
                    winner: false,
                    username: this.username,
                }
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

    async getAllMessages() {
        try {
            const config = {
                method: "get",
                url: `https://discord.com/api/v9/channels/${this.channel_id}/messages?limit=50`,
                httpsAgent: this.agent, //proxy here
                headers: {
                    authority: 'discord.com',
                    scheme: 'https',
                    accept: '*/*',
                    'sec-ch-ua-platform': "Windows",
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
                    'x-debug-options': 'bugReporterEnabled',
                    'x-discord-locale': 'en-US',
                    'x-super-properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwMi4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTAyLjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjEzMjgzMSwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=',
                    Authorization: this.token,
                    "X-Fingerprint": this.fingerprint,
                    cookie: this.cookie,
                },
            }
            let response = await axios(config)
            if (await this.checkRes(response) == false) {
                throw new Error("Failed while fetching all messages!")
            }
            return response
        } catch (e) {
            this.success = false;
            this.errMsg = e.message;
        }
    }
    async findbot(messages) {
        for (let i = 0; i < messages.data.length; i++) {
            const message = messages.data[i];
            if (message.id == this.message_id) {
                let num = Math.floor(messages.data.length - i)
                num = Math.floor(messages.data.length - num)
                return {
                    bot: message.author.username,
                    new: num

                }
            }
        }
    }


    async getNewMessages(num) {
        try {
            const config = {
                method: "get",
                url: `https://discord.com/api/v9/channels/${this.channel_id}/messages?limit=${num}`,
                httpsAgent: this.agent, //proxy here
                headers: {
                    authority: 'discord.com',
                    scheme: 'https',
                    accept: '*/*',
                    'sec-ch-ua-platform': "Windows",
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
                    'x-debug-options': 'bugReporterEnabled',
                    'x-discord-locale': 'en-US',
                    'x-super-properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwMi4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTAyLjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjEzMjgzMSwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=',
                    Authorization: this.token,
                    "X-Fingerprint": this.fingerprint,
                    cookie: this.cookie,
                },
            }
            let response = await axios(config)
            if (await this.checkRes(response) == false) {
                throw new Error("Failed while fetching new messages!")
            }
            return response.data
        } catch (e) {
            this.success = false;
            this.errMsg = e.message;
        }
    }

    async checkgiveaway(newmessages, saying) {
        let ended = false
        for (let q = 0; q < newmessages.length; q++) {
            if (newmessages[q].content.includes(saying)) {
                ended = true
            }
        }
        return ended
    }


    async getuser() {
        try {
            const config = {
                method: "get",
                httpsAgent: this.agent, //proxy here
                url: `https://discordapp.com/api/v9/users/@me`,
                headers: {
                    authority: 'discord.com',
                    path: '/api/v9/users/@me',
                    scheme: 'https',
                    accept: '*/*',
                    referer: 'https://discord.com/channels/@me',
                    'sec-ch-ua-platform': "Windows",
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
                    'x-debug-options': 'bugReporterEnabled',
                    'x-discord-locale': 'en-US',
                    'x-super-properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwMi4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTAyLjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjEzMjgzMSwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=',
                    Authorization: this.token,
                    "X-Fingerprint": this.fingerprint,
                    cookie: this.cookie,
                },
            }
            let response = await axios(config)
            if (await this.checkRes(response) == false) {
                throw new Error("Failed while fetching user data!")
            }
            return `${response.data.id}:${response.data.username+'#'+response.data.discriminator}`
        } catch (e) {
            this.success = false;
            this.errMsg = e.message;
        }
    }

    async find(newMessages, userid) {
        for (let q = 0; q < newMessages.length; q++) {
            if (newMessages[q].content.includes('Congratulations')) {
                if (newMessages[q].content.includes(userid)) {
                    this.winner = true
                    await this.logIt(`${Bright} Congratulations you won!`)
                }
            }
        }
    }

}

module.exports = GiveawayChecker;