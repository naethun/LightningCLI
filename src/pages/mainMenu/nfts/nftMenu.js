const { Blue, Reset } = require("../../utils/colors")
const inquirer = require("@jokzyz/inquirer");
const Menu = require("../menu");

class NFTMenu extends Menu {
    async prompt() {
        
        console.log(`\n        ${Blue}${"-".repeat(Math.floor(process.stdout.columns)-16)}${Reset}        \n\n`)
        let menuChoice = await inquirer.prompt({
            prefix: `${" ".repeat(7)}${Blue}`,
            name: "Decision",
            type: "list",
            message: "Please choose a NFT module to run!\n",
            choices: ["\tCMV2 Mint", "\tMagicEden Sniper", "\tNFT / Crypto Utilities", "\tConfigure Tasks", "\tPrevious Menu"],
        })
        let decision = menuChoice.Decision.replace(/\t/g, "")
        return decision
    }   
}

module.exports = NFTMenu;