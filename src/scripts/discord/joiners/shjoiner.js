const fetch = require("node-fetch-cjs").default;
const fsz = require('fs')
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const paths = require("chrome-paths");
const fs = require('fs.promises'); //to read files
const axios = require("axios").default; //req lib
const puppeteer = require("puppeteer-extra");
const httpsProxyAgent = require('https-proxy-agent'); //for proxies
const arrayChunks = require('array-splitter-chunks');

let invites = "https://discord.gg/5bTsAPnfje"; //discord invite
let delay = 500; // delay
let threads = 1; // amount of threads
let apikey = "14b8bbd820ffc6d1c3f46002691288ef"; //captcha provider token
let messagelink = 'https://discord.com/channels/802536093995892806/900040948308934667/900041502636515328' //messages to verify
//}
// varibles used tru out the script{
let fingerprint;
let cookie;
let invitecode;
let xcontentheader
let count = 0
let guild_id = messagelink.split('/')[4]
let channel_id = messagelink.split('/')[5]
let message_id = messagelink.split('/')[6]
//}
function gettime() {
    var date = new Date(new Date().toLocaleString('en-US'));
    var hr = date.getHours() + '';
    var min = date.getMinutes() + '';
    var sec = date.getSeconds() + '';



    if (hr.length == 1) {
        hr = '0' + hr;
    }

    if (min.length == 1) {
        min = '0' + min;
    }

    if (sec.length == 1) {
        sec = '0' + sec;
    }
    let time = `[${hr}:${min}:${sec}]`
    return time
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

async function tasks() {
    //gets tokens and splits them in an array then sub arrays
    const fileName = 'config/tokens.txt';
    token = await fs.readFile(fileName, 'utf8');
    token = token.split('\n')
    tokens = []
    token.forEach(element => {
        if (element.length > 1) {
            tokens.push(element.trim())
        }
    });
    token = tokens
    let num = Math.floor(token.length / threads)
    arrayChunks(token, num, function(err, chunks) {
        console.log('\x1b[36mStarting Task...')
        console.log('\x1b[36mAtempting To Connect To Proxy...')
        let i = 0
        while (i < chunks.length) {
            let tokenlist = chunks[i]
            startjoin(tokenlist)
            i++
        }
    });
}


async function startjoin(tokenlist) {
    //takes list and splits it and sends in value
    let i = 0
    while (i < tokenlist.length) {
        token = tokenlist[i]
        await invite()
        await getfingerprint()
        await cookies()
        await getXcontent()
        await join(token)
        await sleep(delay)
        i++
    }
}
async function get_proxy() {
    //This func gets a proxy and splits it to what is needed
    try {
        let data = await fs.readFile("config/proxies.txt", "utf-8");
        let proxies = data.split("\n").map(line => line.trim());
        let proxy = proxies[Math.floor(Math.random() * proxies.length)].split(":");
        return {
            host: proxy[0],
            port: proxy[1],
            user: proxy[2],
            pass: proxy[3],
            proxyurl: `http://${proxy[2]}:${proxy[3]}@${proxy[0]}:${proxy[1]}`
        }
    } catch (err) {
        throw err;
    }
}


async function invite() {
    //splits invite link to code
    invitecode = invites.split("/")[3];
}


async function getfingerprint() {
    //request to discord to get a valid fingerprint
    let print = await (await axios.get("https://canary.discord.com/api/v10/experiments")).data.fingerprint;
    fingerprint = print;
}




async function cookies() {
    //Gets disord Cookie then formats 
    let proxy = await get_proxy() //grabs proxy
    var agent = new httpsProxyAgent(proxy.proxyurl); //assigns proxy

    var config = {
        url: 'https://discord.com',
        httpsAgent: agent
    }

    await axios(config)
        .then(function(response) {
            cookie = `${response.headers["set-cookie"][0].split(";")[0]}; ${
                response.headers["set-cookie"][1].split(";")[0]
            }; locale=us`;
        })
        .catch(function(error) {
            console.log("\x1b[31mFailed Getting Cookies");
        });

}


async function getXcontent() {
    //request to discord to get a Xcontent info 

    let proxy = await get_proxy() //grabs proxy
    var agent = new httpsProxyAgent(proxy.proxyurl); //assigns proxy


    let xcon = await axios({
        method: "get",
        url: `https://discord.com/api/v9/invites/${invitecode}?inputValue=${invitecode}&with_counts=true&with_expiration=true`,
        httpsAgent: agent
    })
    guildID = xcon.data.guild.id //grabs guild id
    channelID = xcon.data.channel.id //grabs channel id
    channelType = xcon.data.channel.type //grabs channel type

    let xtext = { //strings data
        Location: "Join Guild",
        LocationGuildID: guildID,
        LocationChannelID: channelID,
        LocationChannelType: channelType,
    }
    xtext = JSON.stringify(xtext)

    xcontent = 'XContext' + xtext

    //b64 encodes xcontent header
    xcontentheader = btoa(xcontent)
}


async function join(token) {
    //atempts to join sever with out captcha 
    let proxy = await get_proxy() //grabs proxy
    var agent = new httpsProxyAgent(proxy.proxyurl); //assigns proxy
    const config = {
        method: "post",
        httpsAgent: agent, //proxy here
        url: `https://canary.discord.com/api/v10/invites/${invitecode}`,
        headers: {
            authority: "discord.com",
            path: `/api/v9/invites/${invitecode}`,
            "X-Context-Properties": xcontentheader,
            scheme: "https",
            Connection: "close",
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            Authorization: token,
            referer: "https://discord.com/channels/@me",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36",
            "X-Fingerprint": fingerprint,
            "DNT": "1",
            "TE": "Trailers",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-orgin",
            "X-Super-Properties": "eyJvcyI6Ik1hYyBPUyBYIiwiYnJvd3NlciI6IlNhZmFyaSIsImRldmljZSI6IiIsInN5c3RlbV9sb2NhbGUiOiJlbi11cyIsImJyb3dzZXJfdXNlcl9hZ2VudCI6Ik1vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzEzXzYpIEFwcGxlV2ViS2l0LzYwNS4xLjE1IChLSFRNTCwgbGlrZSBHZWNrbykgVmVyc2lvbi8xMy4xLjIgU2FmYXJpLzYwNS4xLjE1IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTMuMS4yIiwib3NfdmVyc2lvbiI6IjEwLjEzLjYiLCJyZWZlcnJlciI6IiIsInJlZmVycmluZ19kb21haW4iOiIiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTE3OTE4LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==",
            Origin: "https://discord.com",
            cookie: cookie,
        },
    }
    await axios(config).then(async function(response) {
            if (response.data.new_member) {
                count = count + 1
                console.log(`\x1b[32m[Successfully Joined] \x1b[35m${token} \x1b[34m${await gettime()}`)
                main(token)
            } else {
                console.log(`\x1b[31m[Error] Account Already In Sever Or Disabled \x1b[34m${await gettime()}`)
            }
        })
        .catch(async function(error) {
            if (error.response.data.captcha_key) {

                console.log(`\x1b[33m[Needs Captcha] Solving \x1b[35m${token} \x1b[34m${await gettime()}`)

                let captoken = error.response.data.captcha_rqtoken;
                const solver = new Captcha.Solver(apikey);

                let solved = await solver.hcaptcha(
                        "a9b5fb07-92ff-493f-86fe-352a2803b3df",
                        "https://discord.com/channels/@me", {
                            data: error.response.data.captcha_rqdata,
                            invisible: 0,
                        }
                    )
                    .then(async (solved) => {
                        solved = solved.data
                        await getfingerprint() //gens new fingerprint
                        await cookies() // gets new cookie
                        await joincap(solved, captoken, token) //join but with captcha
                    })
            }
        }).catch(async function(error) {
            console.log("\x1b[31m Proxy Error Restarting")
            tasks()
        });
}


async function joincap(solved, captoken, token) {
    //join sever if captcha

    let proxy = await get_proxy() //grabs proxy
    var agent = new httpsProxyAgent(proxy.proxyurl); //assigns proxy

    axios({
            method: "post",
            url: `https://canary.discord.com/api/v10/invites/${invitecode}`,
            data: {
                captcha_key: solved, //solved captcha token
                captcha_rqtoken: captoken, // captcha token
            },
            httpsAgent: agent, //proxy here
            headers: {
                authority: "discord.com",
                path: "path",
                "X-Fingerprint": fingerprint,
                "X-Context-Properties": xcontentheader,
                scheme: "https",
                Connection: "close",
                "Content-Type": "application/json",
                "X-Discord-Locale": "en-US",
                "Accept-Language": "en-IN",
                "X-Debug-Options": "bugReporterEnabled",
                "DNT": "1",
                "TE": "Trailers",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-orgin",
                accept: "*/*",
                "accept-language": "en-US,en;q=0.9",
                Authorization: token,
                referer: "https://discord.com/channels/@me",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36",
                "X-Super-Properties": "TW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTVfNykgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgZGlzY29yZC8wLjAuNjEgQ2hyb21lLzkxLjAuNDQ3Mi4xNjQgRWxlY3Ryb24vMTMuNi42IFNhZmFyaS81MzcuMzYiLCAiZXlKdmN5STZJazFoWXlCUFV5QllJaXdpWW5KdmQzTmxjaUk2SWtScGMyTnZjbVFnUTJ4cFpXNTBJaXdpY21Wc1pXRnpaVjlqYUdGdWJtVnNJam9pY0hSaUlpd2lZMnhwWlc1MFgzWmxjbk5wYjI0aU9pSXdMakF1TmpFaUxDSnZjMTkyWlhKemFXOXVJam9pTWpFdU5DNHdJaXdpYjNOZllYSmphQ0k2SW1GeWJUWTBJaXdpYzNsemRHVnRYMnh2WTJGc1pTSTZJbVZ1TFZWVElpd2lZMnhwWlc1MFgySjFhV3hrWDI1MWJXSmxjaUk2TVRJM016QTNMQ0pqYkdsbGJuUmZaWFpsYm5SZmMyOTFjbU5sSWpwdWRXeHNmUT09",
                Origin: "https://discord.com",
                cookie: cookie,
                "X-Track": "eyJvcyI6Ik1hYyBPUyBYIiwiYnJvd3NlciI6IlNhZmFyaSIsImRldmljZSI6IiIsInN5c3RlbV9sb2NhbGUiOiJlbi11cyIsImJyb3dzZXJfdXNlcl9hZ2VudCI6Ik1vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzEzXzYpIEFwcGxlV2ViS2l0LzYwNS4xLjE1IChLSFRNTCwgbGlrZSBHZWNrbykgVmVyc2lvbi8xMy4xLjIgU2FmYXJpLzYwNS4xLjE1IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTMuMS4yIiwib3NfdmVyc2lvbiI6IjEwLjEzLjYiLCJyZWZlcnJlciI6IiIsInJlZmVycmluZ19kb21haW4iOiIiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTEzNTQ5LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==",
            },
        })
        .then(async function(response) {
            if (response.data.new_member) {
                count = count + 1
                console.log(`\x1b[32m[Successfully Joined] \x1b[35m${token} \x1b[34m${await gettime()}`)
                main(token)
            } else {
                console.log(`\x1b[31m[Error] Account Already In Sever Or Disabled \x1b[34m${await gettime()}`)
            }
        })
        .catch(async function(error) {
            console.log(`\x1b[31m[Error] Account Already In Sever Or Disabled \x1b[34m${await gettime()}`)
        });
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}


puppeteer.use(pluginStealth());

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

async function get_proxy() {
    try {
        let data = fsz.readFileSync("modules/proxies.txt", "utf-8");
        let proxies = data.split("\n").map(line => line.trim());
        let proxy = proxies[Math.floor(Math.random() * proxies.length)].split(":");
        // console.log(proxies);
        return {
            host: proxy[0],
            port: proxy[1],
            user: proxy[2],
            pass: proxy[3],
            proxyurl: `http://${proxy[2]}:${proxy[3]}@${proxy[0]}:${proxy[1]}`
        }
    } catch (err) {
        throw err;
    }
}

async function main(token) {
    console.log(`\x1b[33m[Atempting Sledgehammer] \x1b[35m${token} \x1b[34m${await gettime()}`)
    let proxy = await get_proxy();

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
    const product_url = `https://discord.com/channels/${guild_id}/${channel_id}}s`//place holder to login
    await page.goto(product_url);
    await login(page, token) // logs in
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
    await getfingerprint()
    const body = `{"type":3,"nonce":"${getRandomInt(18)}","guild_id":"${guild_id}","channel_id":"${channel_id}","message_flags":64,"message_id":"${id}","application_id":"863168632941969438","session_id":"0beab90725fdde7306d739e79d8db03e","data":{"component_type":3,"custom_id":"verificationRequest.en","type":3,"values":["${text}"]}}`;
    await page.evaluate(async (token, fingerprint, body) => {
        let cookie = document.cookie
        const response = await fetch('https://discord.com/api/v9/interactions', {
            //post data needed to sever
            method: 'post',
            body: body,
            headers: {
                authority: 'discord.com',
                path: '/api/v9/interactions',
                "X-Fingerprint": fingerprint,
                scheme: 'https',
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.9',
                authorization: token,
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

        if (response.status == 204) {
            console.log('complete')
        }
    }, token, fingerprint, body);
    await sleep(7000)
    await page.close()
    console.log(`\x1b[32m[Solved Sledgehammer] \x1b[35m${token} \x1b[34m${await gettime()}`)
    await browser.close();
}

async function login(page) {
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
tasks();