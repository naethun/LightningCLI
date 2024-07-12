const Log = require("../../log");
const axios = require("axios");
const fs = require('fs');
const {
    getRandomProxy
} = require("../../utils/handleProxies");
const {
    projectName,
    projectVersion
} = require("../../../versionData");
const {
    dataEXT
} = require("../../../pages/utils/extraData");
const {
    HttpsProxyAgent
} = require("https-proxy-agent");
const timeout = require("../../../pages/utils/timeout");
const {
    Bright
} = require("../../../pages/utils/colors");
const Fingerprints = require("../utils/fingerprint");
const GetCookie = require("../utils/getcookie");

class BioChange {

    // CONFIG DATA
    taskID;
    delay;
    token;

    // CLASS DATA
    fingerprint;
    cookie;
    proxyData;
    count;
    bio

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
        this.bio


        this.success = true;
        this.errMsg;
        this.running = true;

        this.logger = new Log();
        this.logger.create("BIO", false);

        this.logs = [];
    }

    async logIt(data) {
        timeout(this.delay)
        let type = this.success == false ? "error" : "info"
        await this.logger.handle(type, `[TASK-${this.taskID}] - ${data}`, true, false)
        this.logs.push({
            type: type,
            info: `[BIO-${this.taskID}] - ${data}`
        })
        return
    }

    async init() {
        await this.logIt("Starting task...")
        await this.get_proxy()
            .then(await this.getfingerprint())
            .then(await this.cookies())
            .then(await this.getbios())
            .then(await this.bioChange())
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

    async getbios(){
        try{
        let fetchbios = await fs.promises.readFile(`${dataEXT}\\${projectName}\\bios.txt`)
        fetchbios = fetchbios.toString().split('\n')
        this.bio = fetchbios[Math.floor(Math.random() * fetchbios.length)]
        } catch (e) {
            throw new Error(`Failed while trying to read bios file`)
        }
    }
   async bioChange(){
    if (this.running == false) return
    await this.logIt("Attempting to change bio...")
    try{
    const config = {
        method: "patch",
        url: `https://discord.com/api/v9/users/@me`,
        data:{"bio":this.bio},
        httpsAgent: this.agent,
    headers: {
        authority: 'discord.com',
        scheme: 'https',
        accept: '*/*',
        path: `/api/v9/users/@me`,
        origin: 'https://discord.com',
        referer: `https://discord.com/channels/@me`,
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
        throw new Error("Failed while changing bio!")
    }else{
        await this.logIt(`${Bright}Successfully changed bio to ${this.bio}!`)
    }
} catch (e) {
    this.success = false;
    this.errMsg = e.message;

}
   }
}

module.exports = BioChange;