const { projectBanner } = require("../../../versionData")
const alternateColor = require("../../utils/alternateColor")
const center = require("../../utils/center")
const { Blue, Reset } = require("../../utils/colors")
const inquirer = require("@jokzyz/inquirer");
const Menu = require("../menu");


class JoinerMenu extends Menu {
    async prompt() {
        
        console.log(`\n        ${Blue}${"-".repeat(Math.floor(process.stdout.columns)-16)}${Reset}        \n\n`)
        let menuChoice = await inquirer.prompt({
            prefix: `${" ".repeat(7)}${Blue}`,
            name: "Decision",
            type: "list",
            message: "Please choose an invite joiner module to run!\n",
            choices: ["\tBasic Joiner", "\tCapBot Joiner (Needs maintenance)", "\tReact Joiner", "\tWick Joiner", "\tSledgehammer Joiner", "\tPrevious Menu"],
        })
        let decision = menuChoice.Decision.replace(/\t/g, "")
        return decision
    }   
}

module.exports = JoinerMenu;