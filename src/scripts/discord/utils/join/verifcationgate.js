const axios = require("axios");
async function CheckVerifcation(token,agent,inviteCode,cookie,fingerprint) {
    try{
    let code = await axios({
        method: "get",
        httpsAgent: agent,
        url: `https://discord.com/api/v9/invites/${inviteCode}?inputValue=${inviteCode}&with_counts=true&with_expiration=true`,
    })
    let guild_id = code.data.guild.id

    const config = {
        method: 'get',
        httpsAgent: agent,
        url: `https://discord.com/api/v9/guilds/${guild_id}/member-verification`,
        headers: {
            authority: 'discord.com',
            scheme: 'https',
            accept: '*/*',
            path: `/api/v9/guilds/${guild_id}/member-verification`,
            origin: 'https://discord.com',
            referer: `https://discord.com/channels/@me`,
            'sec-ch-ua-platform': "Windows",
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
            'x-debug-options': 'bugReporterEnabled',
            'x-discord-locale': 'en-US',
            'x-super-properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwMi4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTAyLjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjEzMjgzMSwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=',
            Authorization: token,
            "X-Fingerprint": fingerprint,
            "cookie": cookie,

        }

    }
    let response = await axios(config)
    let data = response.data
    delete data['description']
    data.response = true


    const config2 = {
        method: 'put',
        data: response.data,
        httpsAgent: agent,
        url: `https://discord.com/api/v9/guilds/${guild_id}/requests/@me`,
        headers: {
            authority: 'discord.com',
            scheme: 'https',
            accept: '*/*',
            path: `/api/v9/hypesquad/online`,
            origin: 'https://discord.com',
            referer: `https://discord.com/channels/@me`,
            'sec-ch-ua-platform': "Windows",
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
            'x-debug-options': 'bugReporterEnabled',
            'x-discord-locale': 'en-US',
            'x-super-properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwMi4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTAyLjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjEzMjgzMSwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=',
            Authorization: token,
            "X-Fingerprint": fingerprint,
            "cookie": cookie,
        }

    }
    let response2 = await axios(config2)
    return{
        success:'Successfully solved verifcation gate!'
    }
}catch(e){
    if(e.response.status == '404'){
        return{
            success:'No verifcation gate found!'
        }
    }else{
        return{
            error:'Unkown error while attempting to solve verifcation gate!'
        }
    }
}
}
module.exports = CheckVerifcation