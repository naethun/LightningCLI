const axios = require("axios").default; //req lib
const arrayChunks = require('array-splitter-chunks'); //sub array
const fs = require('fs.promises'); //to read files
let httpsProxyAgent = require('https-proxy-agent'); //for proxies

//will pull data from input/config{
let delay = 500; // delay
let threads = 1; // amount of threads
let messagelink = 'https://discord.com/channels/986025451430481941/987978545701716018/988167586636251136' //messages to verify
//}
// varibles used tru out the script{
let fingerprint;
let cookie;
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
    //atempts to join sever with out captcha 
    let proxy = await get_proxy() //grabs proxy
    var agent = new httpsProxyAgent(proxy.proxyurl); //assigns proxy
    const config = {
        method: "post",
        httpsAgent: agent, //proxy here
        url: ` https://discord.com/api/v9/interactions`,
        data:{"type":3,"nonce":`"${getRandomInt(18)}"`,"guild_id": `${guild_id}`,"channel_id":`${channel_id}`,"message_flags":0,"message_id":`${message_id}`,"application_id":"294882584201003009","session_id":"0f3ead8b7b089c5fc9a08f15916cc3d6","data":{"component_type":2,"custom_id":"enter-giveaway"}},
        headers: {
            authority: "discord.com",
            path: `/api/v9/interactions`,
            referer: 'https://discord.com/channels/986025451430481941/987978545701716018',
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
           if(response.data == ''){
            console.log(`\x1b[32m[Joined Giveaway] \x1b[35m${token} \x1b[34m${await gettime()}`)
           }
        })
        .catch(async function(error) {
            if(error.response.data.message == 'Unknown Guild'){
                console.log(`\x1b[31m[Error] Account Not In Sever \x1b[34m${await gettime()}`)
            }else if(error.response.data.message == 'Invalid Form Body'){
                console.log(error.response.data.message)
                console.log(`\x1b[31m[Error] Giveaway Expired \x1b[34m${await gettime()}`)
                   }
                   else if(error.response.data.message == 'Unknown Message'){
                    console.log(`\x1b[31m[Error] Giveaway Not Found \x1b[34m${await gettime()}`)
                       }
                       else if(error.response.data.message == '401: Unauthorized'){
                        console.log(`\x1b[31m[Error] Account Is Disabled \x1b[34m${await gettime()}`)
                           }
                           else if(error.response.data.message == 'You need to verify your account in order to perform this action.'){
                            console.log(`\x1b[31m[Error] Account Is Locked \x1b[34m${await gettime()}`)
                               }
               else{
                console.log( `\x1b[31m[Error] ${error.response.data.message} \x1b[34m${await gettime()}`)
               }
        })
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    
tasks();