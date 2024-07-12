const fs = require('fs')
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const paths = require("chrome-paths");
const puppeteer = require("puppeteer-extra");

let token = 'OTcwOTYwNDIyMDYyNjg2MjY4.YnDjoA.afQkeLGNY8qG0ToVKqaSPNALAto' //token to user acc


puppeteer.use( pluginStealth());


async function get_proxy() {
    try {
        let data = fs.readFileSync("modules/proxies.txt", "utf-8"); //pulls from proxy folder
        let proxies = data.split("\n").map(line => line.trim()); //splits proxy
        let proxy = proxies[Math.floor(Math.random() * proxies.length)].split(":"); //splits proxy
        // console.log(proxies);
        return {
            host: proxy[0],
            port: proxy[1],
            user: proxy[2],
            pass: proxy[3]
        }
    } catch (err) {
        throw err;
    }
}
async function main(token) {
    let proxy = await get_proxy();
    console.log("Proxy:", proxy);

    let browser = await puppeteer.launch({ //opens browser
        headless: false,
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
    const product_url = "https://discord.com/app"
    await page.goto(product_url);
    login(page,token)
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


main(token)
