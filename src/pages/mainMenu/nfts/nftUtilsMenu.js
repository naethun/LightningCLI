const { Blue, Reset } = require("../../utils/colors")
const inquirer = require("@jokzyz/inquirer");
const Menu = require("../menu")

class NFTUtilMenu extends Menu {
    async prompt() {
        
        console.log(`\n        ${Blue}${"-".repeat(Math.floor(process.stdout.columns)-16)}${Reset}        \n\n`)
        let menuChoice = await inquirer.prompt({
            prefix: `${" ".repeat(7)}${Blue}`,
            name: "Decision",
            type: "list",
            message: "Please choose a NFT feature to run!\n",
            choices: ["\tCandy Machine Tracker", "\tTransfer SOL", "\tSOL and ETH Wallet Gen", "\tPrevious Menu"],
        })
        let decision = menuChoice.Decision.replace(/\t/g, "")
        return decision
    }   
}

module.exports = NFTUtilMenu;