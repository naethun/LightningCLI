const { Blink, Blue, Reset } = require("./colors")
const { logoWidth } = require("./extraData")
const typer = require("./typeOut")

function showInfo(info) {
    let left = Math.floor((process.stdout.columns - logoWidth) / 6) + logoWidth
    process.stdout.write('\x1B[' + 15 + ';' + left + 'H')
    typer(Blink + Blue + info + Reset, 20)       
}

module.exports = showInfo