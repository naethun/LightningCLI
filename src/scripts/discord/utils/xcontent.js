
const axios = require("axios");
async function Xcontents(agent,inviteCode) {
    let response = await axios({
        method: "get",
        url: `https://discord.com/api/v9/invites/${inviteCode}?inputValue=${inviteCode}&with_counts=true&with_expiration=true`,
        httpsAgent: agent
    })
    
    
    let xcontent = 'XContext' + JSON.stringify({
        Location: "Join Guild",
        LocationGuildID: response.data.guild.id,
        LocationChannelID: response.data.channel.id,
        LocationChannelType: response.data.channel.type,
    })
    
    xcon = btoa(xcontent)
    return xcon
}
module.exports = Xcontents