const { Bright, Blue, Reset, Blink } = require("./colors");

function alternateColor(line) {
    let light = false;
    for (let j = 0; j < line.length; j++) {

        if (line[j] == "*") {

            light ? process.stdout.write(Blink + Bright + Blue + line[j] + Reset) 
            : process.stdout.write(Blink + Blue + line[j] + Reset)
            light = !light            
        } else {
            light ? process.stdout.write(Bright + Blue + line[j] + Reset) 
            : process.stdout.write(Blue + line[j] + Reset)
            light = !light
        }
    }
}

module.exports = alternateColor