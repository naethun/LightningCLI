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
const Fingerprints = require("../utils/fingerprint");
const GetCookie = require("../utils/getcookie");
const Xcontents = require("../utils/xcontent");
const Join = require("../utils/join/join");
const CaptchaSolver = require("../utils/join/captchasolver");
const JoinCaptcha = require("../utils/join/joinCaptcha");
const CheckVerifcation = require("../utils/join/verifcationgate");

class VanillaJoiner {

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

    logger;
    logs;

    needCaptcha;
    captcha_rqtoken;
    captcha_key;

    constructor(taskNum, invite, delay, token, apiKey) {
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
            .then(async () => {
                await this.join()
            })
            .then(async () => {
                if (this.needCaptcha) await this.joincap()
            })
            .catch(error => {
                console.log("Caught Unexpected Error")
                console.log(error.message)
            })
            if(this.success == true){
                try{
                this.success == false
                let response = await CheckVerifcation(this.token,this.agent,this.inviteCode,this.cookie,this.fingerprint)
                if(response.success){
                    this.logIt(`${Bright}${response.success}`)
                    this.success == true
                }else{
                    throw new Error(`${response.error}`)
                }
            }catch(e){
                this.success = false;
            this.errMsg = e.message;
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
            await this.getfingerprint()
            await this.cookies()
            await this.getXcontent()
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
                    throw new Error(`Failed while joining server: ${response.data}`)
                }
            }
            if (response.data.new_member) {
                this.success = true;
                this.logIt(`${Bright}Successfully joined server!`)
            } else {
                this.success = false;
                throw new Error(`Account already in server!`)
                
            }
        } catch (e) {
            this.success = false;
            this.errMsg = e.message;
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
                throw new Error(`Account already in server!`)
            }
        } catch (e) {
            this.success = false;
            this.errMsg = e.message;
        }
    }

}

module.exports = VanillaJoiner;