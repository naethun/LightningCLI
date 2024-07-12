const axios = require("axios");
async function CaptchaSolver(apikey,data) {
    const solver = new Captcha.Solver(apikey);
    let capData = await solver.hcaptcha(
        "a9b5fb07-92ff-493f-86fe-352a2803b3df",
        "https://discord.com/channels/@me", {
            data: data,
            invisible: 0,
        }
    )
    return capData.data
}
module.exports = CaptchaSolver