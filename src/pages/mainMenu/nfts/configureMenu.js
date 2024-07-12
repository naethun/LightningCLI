const { Blue, Reset } = require("../../utils/colors")
const inquirer = require("@jokzyz/inquirer");
const Menu = require("../menu");

class NFTConfigureMenu extends Menu {
    async prompt() {
        
        console.log(`\n        ${Blue}${"-".repeat(Math.floor(process.stdout.columns)-16)}${Reset}        \n\n`)
        let menuChoice = await inquirer.prompt({
            prefix: `${" ".repeat(7)}${Blue}`,
            name: "Decision",
            type: "list",
            message: "Please choose which module you want to make/edit tasks for!\n",
            choices: ["\tCMV2 Mint", "\tMagicEden Sniper", "\tCandy Machine Tracker", "\tTransfer SOL", "\tPrevious Menu"],
        })
        let decision = menuChoice.Decision.replace(/\t/g, "")
        return decision
    }   
}

module.exports = NFTConfigureMenu