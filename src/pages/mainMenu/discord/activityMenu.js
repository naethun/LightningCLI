const {
    projectBanner
} = require("../../../versionData")
const alternateColor = require("../../utils/alternateColor")
const center = require("../../utils/center")
const {
    Blue,
    Reset
} = require("../../utils/colors")
const inquirer = require("@jokzyz/inquirer");
const Menu = require("../menu");


class ActivityMenu extends Menu {
    async prompt() {

        console.log(`\n        ${Blue}${"-".repeat(Math.floor(process.stdout.columns)-16)}${Reset}        \n\n`)
        let menuChoice = await inquirer.prompt({
            prefix: `${" ".repeat(7)}${Blue}`,
            name: "Decision",
            type: "list",
            message: "Please choose an Activity Utilities module to run!\n",
            choices: ["\tSet All Tokens Online", "\tAdvanced Chatting Bot", "\tOpen Account In Browser"],
        })
        let decision = menuChoice.Decision.replace(/\t/g, "")
        return decision
    }
}

module.exports = ActivityMenu;