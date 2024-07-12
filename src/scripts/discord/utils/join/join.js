
const axios = require("axios");
async function Join(agent,inviteCode,xContentHeader,token,fingerprint,cookie) {
    const config = {
        method: "post",
        httpsAgent: agent,
        url: `https://canary.discord.com/api/v10/invites/${inviteCode}`,
        headers: {
            "authority": "discord.com",
            "path": `/api/v9/invites/${inviteCode}`,
            "X-Context-Properties": xContentHeader,
            "scheme": "https",
            "Connection": "close",
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "Authorization": token,
            "referer": "https://discord.com/channels/@me",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36",
            "X-Fingerprint": fingerprint,
            "DNT": "1",
            "TE": "Trailers",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-orgin",
            "X-Super-Properties": "eyJvcyI6Ik1hYyBPUyBYIiwiYnJvd3NlciI6IlNhZmFyaSIsImRldmljZSI6IiIsInN5c3RlbV9sb2NhbGUiOiJlbi11cyIsImJyb3dzZXJfdXNlcl9hZ2VudCI6Ik1vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzEzXzYpIEFwcGxlV2ViS2l0LzYwNS4xLjE1IChLSFRNTCwgbGlrZSBHZWNrbykgVmVyc2lvbi8xMy4xLjIgU2FmYXJpLzYwNS4xLjE1IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTMuMS4yIiwib3NfdmVyc2lvbiI6IjEwLjEzLjYiLCJyZWZlcnJlciI6IiIsInJlZmVycmluZ19kb21haW4iOiIiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTE3OTE4LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==",
            "Origin": "https://discord.com",
            "cookie": cookie,
        },
    }
    let response = await axios(config);
    return response
}
module.exports = Join