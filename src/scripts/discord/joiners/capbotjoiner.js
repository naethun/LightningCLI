const pluginStealth = require("puppeteer-extra-plugin-stealth");
const paths = require("chrome-paths");
const { createCursor } = require("ghost-cursor")
const puppeteer = require("puppeteer-extra");
const RecaptchaPlugin = require("puppeteer-extra-plugin-recaptcha")
const fetch = require("node-fetch-cjs").default;
const fsz = require('fs')
const fs = require('fs.promises'); //to read files
const axios = require("axios").default; //req lib
const httpsProxyAgent = require('https-proxy-agent'); //for proxies
const arrayChunks = require('array-splitter-chunks');




  let invites = "https://discord.gg/captcha"; //discord invite
  let delay = 500; // delay
  let threads = 1; // amount of threads
  let apikey = "14b8bbd820ffc6d1c3f46002691288ef"; //captcha provider token
  let messagelink = 'https://discord.com/channels/855215899392081971/855226522552893440/893317950273101854' //messages to verify
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
    console.log(`\x1b[33m[Atempting Captcha.bot] \x1b[35m${token} \x1b[34m${await gettime()}`)
    puppeteer.use( pluginStealth());

puppeteer.use(
    RecaptchaPlugin({
      provider: {
        id: '2captcha',
        token: '14b8bbd820ffc6d1c3f46002691288ef' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
      },
      visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
    })
  )
    let proxy = await get_proxy();

    let browser = await puppeteer.launch({ //opens browser
        headless: false,
        executablePath: paths.chrome,
        slowMo: 0,
        args: [
            `--proxy-server=http://${proxy.host}:${proxy.port}`
        ]
    });

    let page = await browser.newPage();
    const cursor = createCursor(page)
    await page.setDefaultNavigationTimeout(0);
    await page.authenticate({
        username: proxy.user,
        password: proxy.pass
    });
    
    const product_url = `https://discord.com/channels/${guild_id}/${channel_id}`
    await page.goto(product_url);
    await login(page,token)
    await page.waitForSelector('[data-name="🤖"]')
    await sleep(2000)
    await page.click('[data-name="🤖"]')
    await sleep(3000)
    let links = await getlink(page)
    await page.goto(links)
    await page.waitForSelector('[src="/img/logo.7aa1f7b0.png"]')
    await sleep(3000)
    let linkdis = await verify(page,token)
    await page.goto(linkdis)
    await page.waitForSelector('[data-text-variant="text-lg/normal"]')
    let auth = await login2(page)
    await page.waitForSelector(`[class="${auth}"]`)
    await cursor.move(`[class="${auth}"]`)
    await cursor.click(`[class="${auth}"]`)
    await page.waitForNavigation();
    await page.waitForSelector('[class="text-center mt-1 text-white"]')
    await cursor.move('[class="text-center mt-1 text-white"]')
    await cursor.click('[class="text-center mt-1 text-white"]')
    // await console.log('done')
}

function login(page,token){
    page.evaluate((token) => {

        function login() { //login
           setInterval(() => {
              document.body.appendChild(document.createElement `iframe`).contentWindow.localStorage.token = `"${token}"`
           }, 50);
           setTimeout(() => {
              location.reload();
           }, 2500);
        }
        login(token)
     },token);
}

async function verify(page,token){
    let linkdis = await page.evaluate(() => {
        for (const a of document.querySelectorAll("a")) {
            if (a.textContent.includes("Login to verify")) {
             console.log(a.href)
             return a.href
            }
}
     });
     return linkdis
}

async function login2(page,token){
    let linkdis = await page.evaluate(() => {
        
for (const a of document.querySelectorAll('[type="button"]')) {
    if (a.textContent.includes("Authorize")) {
     return a.className
    }
}
     });
     return linkdis
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

async function getlink(page){
    let links = await page.evaluate(async() => {

        function link() { //login
         let link = document.querySelector('[title="https://captcha.bot/verify"]').href
        return link
        }
     let links = await link()
        return links
     });
     return links
}

tasks()