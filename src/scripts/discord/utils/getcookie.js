const axios = require("axios");
async function GetCookie(agent) {
    let response = await axios.get('https://discord.com', {
        httpsAgent: agent
    })
    let cookie = `${response.headers["set-cookie"][0].split(";")[0]}; ${
            response.headers["set-cookie"][1].split(";")[0]
        }; locale=us`;
        return cookie
}
module.exports = GetCookie