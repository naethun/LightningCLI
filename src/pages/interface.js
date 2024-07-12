const { stdout } = require('process')
const getTime = require('../scripts/utils/getTime.js')
const {
    projectName,
    projectVersion
} = require('../versionData.js')
const Authenticator = require('./authentication/authentication.js')
const Menu = require('./mainMenu/menu.js')
const Start = require('./start.js')
const timeout = require('./utils/timeout.js')
const {
    setTitle,
    createTitle
} = require('./utils/title.js')
const fs = require('fs');
const { Reset } = require('./utils/colors.js')
const { handle } = require('../scripts/log.js')
const Log = require('../scripts/log.js')
const HypeDriver = require('../scripts/discord/accountUtilsDriver.js')
const LeaveDriver = require('../scripts/discord/leaveDriver.js')
const JoinerDriver = require('../scripts/discord/joinerDriver.js')
const GiveawayDriver = require('../scripts/discord/giveawayDriver.js')
const OnlineDriver = require('../scripts/discord/onlineDriver.js')
const CheckerDriver = require('../scripts/discord/checkerDriver.js')
const GiveawayCheckerDriver = require('../scripts/discord/giveawayCheckerDriver.js')
const DiscordMenu = require("./mainMenu/discord/discordMenu.js")
const JoinerMenu = require("./mainMenu/discord/joinerMenu.js")
const AccountUtilitiesMenu = require("./mainMenu/discord/accountUtilitiesMenu.js")
const GiveawayMenu = require("./mainMenu/discord/giveawayMenu.js")
const ActivityMenu = require("./mainMenu/discord/activityMenu.js")
const clearTerminal = require('./utils/clearTerminal.js')
const prompter = require('./mainMenu/prompter.js')

const NFTMenu = require("./mainMenu/nfts/nftMenu")
const NFTInit = require('../scripts/nft-modules/NFT-INIT.js')
const NFTConfigureMenu = require("./mainMenu/nfts/configureMenu.js")
const NFTUtilMenu = require("./mainMenu/nfts/nftUtilsMenu.js")

class Interface {

    key;
    user;
    logFile;

    constructor() {
        this.key = true
        this.user = {
            name: null
        }
        this.logger = new Log()
        this.logger.create("CLI")

    }

    async display(page) {
        clearTerminal()
        setTitle(
            createTitle([
                projectName,
                `v${projectVersion}`,
                `${page} Page`
            ]))
        switch (page) {
            case "Login":
                this.logger.handle("info", "Loading...", false)
                await Start.showPage()
                let check = true
                if(check === true) {
                    this.logger.handle("info", "User Authenticated!", false)
                    await timeout(2500)
                    this.logger.handle("info", "Logging in...", false)
                    this.logger.handle("info", "Displaying Menu!", false)
                    return this.display("Main Menu")
                }
                return true
            case "Main Menu":

                this.logger.handle("info", "Checking files...", false)

                let mainDecision = await prompter(new Menu())
                switch (mainDecision) {
                    case "Discord Modules":
                        let discordDecision = await prompter(new DiscordMenu())
                        switch (discordDecision) {
                            case "Invite Joiner":
                                let joinerDecision = await prompter(new JoinerMenu())
                                switch (joinerDecision) {
                                    case "Basic Joiner":
                                        await new JoinerDriver().init("vanilla", 3)
                                }
                                break   
                                case "Account Utilities":
                                let UtilitiesDecision = await prompter(new AccountUtilitiesMenu())
                                switch (UtilitiesDecision) {
                                    case "Account Checker":
                                        await new CheckerDriver().init("checker", 3)
                                        break;
                                    case "Leave Server(s)":
                                        await new LeaveDriver().init("single", 3)
                                        break;
                                        case "Join Hypesquad":
                                            await new HypeDriver().init("hype", 3)
                                            break;
                                        case "Set Bios":
                                            await new HypeDriver().init("bio", 3)
                                            break;
                                            case "Set Profile Pics":
                                            await new HypeDriver().init("PFP", 3)
                                }
                                break
                                case "Giveaway Utilities":
                                let GiveawayDecision = await prompter(new GiveawayMenu())  
                                switch (GiveawayDecision) {
                                    case "React Giveaway Joiner":
                                        await new GiveawayDriver().init("react", 3)
                                        break;
                                        case "Button Giveaway Joiner":
                                        await new GiveawayDriver().init("button", 3)
                                        break;
                                        case "Check Giveaway Winners":
                                        await new GiveawayCheckerDriver().init("checker", 3)
                                } 
                                case "Activity Utilities":
                                            let ActivityDecision = await prompter(new ActivityMenu()) 
                                            switch (ActivityDecision) { 
                                            case "Set All Tokens Online":
                                        await new OnlineDriver().init("Online", 3)
                                            }
                        }
                        break
                    case "NFT Modules":
                        let nftDecision = await prompter(new NFTMenu())
                        let init = new NFTInit()
                        switch (nftDecision) {
                            case "CMV2 Mint":
                                init.CMV2Mint = true;
                                init.runModules();
                            break   
                            case "MagicEden Sniper":
                                init.MESniper = true;
                                init.runModules()
                            break
                            case "NFT / Crypto Utilities":
                                let nftUtils = await prompter(new NFTUtilMenu())
                                switch (nftUtils) {
                                    case "Candy Machine Tracker":
                                        init.CMTracker = true;
                                        init.runModules()
                                    break
                                    case "Transfer SOL":
                                        init.solTransfer = true;
                                        init.runModules()
                                    break
                                    case "SOL and ETH Wallet Gen":
                                        init.walletGen = true;
                                        init.runModules()
                                    break
                                }
                            break
                            case "Configure Tasks":
                                let configuration = await prompter(new NFTConfigureMenu())

                                switch(configuration){
                                    case "CMV2 Mint":
                                        //require('child_process').exec(`start "" "${dataEXT}\\${projectName}\\CMV2.csv"`);
                                    break   
                                    case "MagicEden Sniper":
                                        //require('child_process').exec(`start "" "${dataEXT}\\${projectName}\\MESniper.csv"`);
                                    break
                                    case "Candy Machine Tracker":
                                        //require('child_process').exec(`start "" "${dataEXT}\\${projectName}\\CMTracker.csv"`);
                                    break
                                    case "Transfer SOL":
                                        //require('child_process').exec(`start "" "${dataEXT}\\${projectName}\\SolTransfer.csv"`);
                                    break
                                }
                            break
                        }
                }
            break
        }
    }

}

module.exports = Interface;