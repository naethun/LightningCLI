const Log = require("../../log");
const axios = require("axios");
const {
    getRandomProxy
} = require("../../utils/handleProxies");
const {
    HttpsProxyAgent
} = require("https-proxy-agent");
const fetch = require("node-fetch-cjs").default;
const paths = require("chrome-paths");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra");
const timeout = require("../../../pages/utils/timeout");
const {
    Bright
} = require("../../../pages/utils/colors");
const Captcha = require("2captcha"); //solve cap

class shJoiner{

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
            .catch(error => {
                console.log("caught error")
                console.log(error.message)
            })

            // await browserlogin(this.token, this.proxyData)

            if (this.success == true) {
                this.success == false
                await ShVerify()
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

    async ShVerify(){
        if (this.running == false) return
        try {
        let proxy = this.proxyData
    
        let browser = await puppeteer.launch({
            headless: true,
            executablePath: paths.chrome,
            slowMo: 20,
            args: [
                `--proxy-server=http://${proxy.host}:${proxy.port}`
            ]
        });
    
        let page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0);
        await page.authenticate({
            username: proxy.user,
            password: proxy.pass
        });
        const product_url = `https://discord.com/channels/${this.guild_id}/${this.channel_id}}s`//place holder to login
        await page.goto(product_url);
        await login(page, this.guild_id, this.channel_id) // logs in
        await page.waitForSelector('[data-name="🤖"]') 
        await sleep(2000)
        await page.click('[data-name="🤖"]') // clicks verify button
        await sleep(3000)
        let info = await find(page) //finds what item needs to be sent to sever
        let text = info.split(':')[0]//splits items needed
        let id = info.split(':')[1]
        if (text.includes(' ')) {//checks for formation
            condenser(text)
        }
        const body = `{"type":3,"nonce":"${getRandomInt(18)}","guild_id":"${this.guild_id}","channel_id":"${this.channel_id}","message_flags":64,"message_id":"${this.id}","application_id":"863168632941969438","session_id":"0beab90725fdde7306d739e79d8db03e","data":{"component_type":3,"custom_id":"verificationRequest.en","type":3,"values":["${text}"]}}`;
        await page.evaluate(async (body) => {
            let cookie = document.cookie
            const response = await fetch('https://discord.com/api/v9/interactions', {
                //post data needed to sever
                method: 'post',
                body: body,
                headers: {
                    authority: 'discord.com',
                    path: '/api/v9/interactions',
                    "X-Fingerprint": this.fingerprint,
                    scheme: 'https',
                    accept: '*/*',
                    'accept-encoding': 'gzip, deflate, br',
                    'accept-language': 'en-US,en;q=0.9',
                    authorization: this.token,
                    'content-type': 'application/json',
                    cookie: cookie,
                    origin: 'https://discord.com',
                    referer: 'https://discord.com/channels/802536093995892806/900040948308934667',
                    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.115 Safari/537.36',
                    'x-debug-options': 'bugReporterEnabled',
                    'x-discord-locale': 'en-US',
                    'x-super-properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwMi4wLjUwMDUuMTE1IFNhZmFyaS81MzcuMzYiLCJicm93c2VyX3ZlcnNpb24iOiIxMDIuMC41MDA1LjExNSIsIm9zX3ZlcnNpb24iOiIxMCIsInJlZmVycmVyIjoiIiwicmVmZXJyaW5nX2RvbWFpbiI6IiIsInJlZmVycmVyX2N1cnJlbnQiOiIiLCJyZWZlcnJpbmdfZG9tYWluX2N1cnJlbnQiOiIiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfYnVpbGRfbnVtYmVyIjoxMzIzMjAsImNsaWVudF9ldmVudF9zb3VyY2UiOm51bGx9',
                }
            });
    
            if (await this.checkRes(response) == false) {
                throw new Error("Failed while Solving Sledgehammer!")
            }
        }, body);
        await sleep(7000)
        await page.close();
        await browser.close();
        } catch (e) {
        this.running = false;
        this.success = false;
        this.errMsg = e.message;
    }
        
    }
    async login(page,token, guild_id, channel_id) {
        //login for browser
        await page.evaluate((token, guild_id, channel_id) => {
            function login(token) {
                setInterval(() => {
                    document.body.appendChild(document.createElement `iframe`).contentWindow.localStorage.token = `"${token}"`
                }, 50);
                setTimeout(() => {
                    location.reload();
                }, 2500);
            }
    
            login(token)
            window.location.href = `https://discord.com/channels/${guild_id}/${channel_id}`
        }, token, guild_id, channel_id);
    }
}
module.exports = shJoiner;



async function login(page,token, guild_id, channel_id) {
    //login for browser
    await page.evaluate((token, guild_id, channel_id) => {
        function login(token) {
            setInterval(() => {
                document.body.appendChild(document.createElement `iframe`).contentWindow.localStorage.token = `"${token}"`
            }, 50);
            setTimeout(() => {
                location.reload();
            }, 2500);
        }

        login(token)
        window.location.href = `https://discord.com/channels/${guild_id}/${channel_id}`
    }, token, guild_id, channel_id);
}

async function find(page) {
    //finds elements needed
    let reply = await page.evaluate(() => {
        for (const a of document.querySelectorAll("u")) {
            if (a.textContent.includes("Please select the")) {
                console.log(a.textContent)
                let text = a.textContent.split('select the ')[1]
                console.log(text)
                text = text.split(' on the menu below!')[0].toLowerCase()
                console.log(text)
                for (const a of document.querySelectorAll("div")) {
                    if (a.id.includes("message-accessories-")) {
                        console.log(a.id.split('-')[2])
                        id = a.id.split('-')[2]

                    }
                }
                return `${text}:${id}`
            }
        }
    });
    return reply
}

function condenser(string) {

    outputString = ""
    splitted = string.split(" ")
    for (let i = 0; i < splitted.length; i++) {
        if (i > 0) {
            outputString += capFirst(splitted[i])
        } else {
            outputString += splitted[i]
        }
    }

    return outputString

}

function capFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}