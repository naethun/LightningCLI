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

class LeaveGuild {

    // CONFIG DATA
    taskID;
    delay;
    token;
    guild_id;

    // CLASS DATA
    fingerprint;
    cookie;
    proxyData;
    count;

    logger;
    logs;

    constructor(taskNum, delay, token, guild_id) {
        this.taskID = taskNum;
        this.guild_id = guild_id
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
        this.logger.create("LEAVER", false);

        this.logs = [];
    }

    async logIt(data) {
        timeout(this.delay)
        let type = this.success == false ? "error" : "info"
        await this.logger.handle(type, `[TASK-${this.taskID}] - ${data}`, true, false)
        this.logs.push({
            type: type,
            info: `[LEAVER-${this.taskID}] - ${data}`
        })
        return
    }

    async init() {
        await this.logIt("Starting task...")
        await this.get_proxy()
            .then(await this.getfingerprint())
            .then(await this.cookies())
            .then(await this.leave())
            .catch(error => {
                console.log("caught error")
                console.log(error.message)
            })

            // await browserlogin(this.token, this.proxyData)

        if (this.success == true) {
            return {
                success: true,
                logs: this.logs,
            }
        } else {
             await this.logIt(this.errMsg)
            return {
                success: false,
                logs: this.logs,
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
        if (res.status != 204) {
            this.success = false
            this.running = false
            return false
        }
        return true
    }

    async checkRess(res) {
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
    async getinfo(){
        await this.logIt("Attempting to fetch server info...")
        if (this.running == false) return
        try{
        const config = {
            method: "get",
        url: `https://discord.com/api/v9/users/@me/guilds`,
        httpsAgent: this.agent,
        headers: {
            authority: 'discord.com',
            scheme: 'https',
            accept: '*/*',
            path: `/api/v9/users/@me/guilds/${this.guild_id}`,
            origin: 'https://discord.com',
            referer: `https://discord.com/channels${this.guild_id}`,
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
            }
        }
        let name
        let response = await axios(config)
        if (await this.checkRess(response) == false) {
            throw new Error("Failed while fetching server info!")
        }
        for (let i = 0; i < response.data.length; i++) {
            if(response.data[i].id == this.guild_id){
                name = response.data[i].name
            }
        }
        return name
    } catch (e) {
        this.success = false;
        this.errMsg = e.message;
    
    }
    }
    async leave(){
        let name = await this.getinfo()
        await this.logIt(`Attempting to leave ${name}...`)
        if (this.running == false) return
        try{
        const config = {
            httpsAgent: this.agent,
            method: "DELETE",
            url: `https://discord.com/api/v9/users/@me/guilds/${this.guild_id}`,
            data: {"lurking":false},
            headers: {
                authority: 'discord.com',
                scheme: 'https',
                accept: '*/*',
                path: `/api/v9/users/@me/guilds/${this.guild_id}`,
                origin: 'https://discord.com',
                referer: `https://discord.com/channels${this.guild_id}`,
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
            }
        }
        let response = await axios(config)
        if (await this.checkRes(response) == false) {
            throw new Error("Failed while leaving server!")
        }
        await this.logIt(`${Bright}Successfully left ${name}!`)
        return response
    } catch (e) {
        this.success = false;
        this.errMsg = e.message;
    
    }
}
}

module.exports = LeaveGuild;