const fs = require('fs')
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const paths = require("chrome-paths");
const puppeteer = require("puppeteer-extra");
const dataEXT = process.platform === "win32" ? process.env.APPDATA : process.platform === "darwin" ? process.env.HOME : null

const {
    projectName,
    projectVersion
} = require("../../../versionData");

puppeteer.use( pluginStealth());

class CheckerBrowser {

    // CONFIG DATA
    token;
    link

    // CLASS DATA
    constructor(token,link) {
        this.link = link
        this.token = token;

    }

    async init() {

            
                await this.main()
            
            .catch(error => {
                console.log("Caught Unexpected Error")
                console.log(error.message)
            })
    }

    async get_proxy() {
        try {
            let data = fs.readFileSync(`${dataEXT}\\${projectName}\\proxies.txt`, "utf-8"); //pulls from proxy folder
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

    async main(token) {
        let proxy = await this.get_proxy();
    
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
        token = this.token
        await page.evaluate((token) => {
    
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
        await page.goto(this.link)
    }
     async login(page,token){
    }


}

module.exports = CheckerBrowser;