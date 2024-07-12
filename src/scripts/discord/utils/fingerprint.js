const axios = require("axios");
async function Fingerprints() {
    let response = await axios.get("https://canary.discord.com/api/v10/experiments");
    return response.data.fingerprint
}
module.exports = Fingerprints