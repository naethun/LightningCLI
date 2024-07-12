const { projectBanner } = require("../../../versionData")
const alternateColor = require("../../utils/alternateColor")
const center = require("../../utils/center")
const { Blue, Reset } = require("../../utils/colors")
const inquirer = require("@jokzyz/inquirer");
const Menu = require("../menu");


class DiscordMenu extends Menu {
    async prompt() {
        
        console.log(`\n        ${Blue}${"-".repeat(Math.floor(process.stdout.columns)-16)}${Reset}        \n\n`)
        let menuChoice = await inquirer.prompt({
            prefix: `${" ".repeat(7)}${Blue}`,
            name: "Decision",
            type: "list",
            message: "Please choose a discord module to run!\n",
            choices: ["\tInvite Joiner", "\tAccount Utilities", "\tGiveaway Utilities", "\tActivity Utilities", "\tPrevious Menu"],
        })
        let decision = menuChoice.Decision.replace(/\t/g, "")
        return decision
    }   
}

module.exports = DiscordMenu;