const axios = require("axios");
async function JoinCaptcha(agent,inviteCode,captcha_key,captcha_rqtoken,xContentHeader,token,fingerprint,cookie) {
    const config = {
        method: "post",
        httpsAgent: agent,
        url: `https://canary.discord.com/api/v10/invites/${inviteCode}`,
        data: {
            captcha_key: captcha_key, //solved captcha token
            captcha_rqtoken: captcha_rqtoken, // captcha token
        },
        headers: {
            "authority": "discord.com",
            "path": `/api/v9/invites/${inviteCode}`,
            "X-Context-Properties": xContentHeader,
            "scheme": "https",
            "Connection": "close",
            "accept": "*/*",
            "Authorization": token,
            "referer": "https://discord.com/channels/@me",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36",
            "X-Fingerprint": fingerprint,
            "DNT": "1",
            "TE": "Trailers",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-orgin",
            "Origin": "https://discord.com",
            "cookie": cookie,
            "Content-Type": "application/json",
            "X-Discord-Locale": "en-US",
            "Accept-Language": "en-IN",
            "X-Debug-Options": "bugReporterEnabled",
            "X-Super-Properties": "TW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTBfMTVfNykgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgZGlzY29yZC8wLjAuNjEgQ2hyb21lLzkxLjAuNDQ3Mi4xNjQgRWxlY3Ryb24vMTMuNi42IFNhZmFyaS81MzcuMzYiLCAiZXlKdmN5STZJazFoWXlCUFV5QllJaXdpWW5KdmQzTmxjaUk2SWtScGMyTnZjbVFnUTJ4cFpXNTBJaXdpY21Wc1pXRnpaVjlqYUdGdWJtVnNJam9pY0hSaUlpd2lZMnhwWlc1MFgzWmxjbk5wYjI0aU9pSXdMakF1TmpFaUxDSnZjMTkyWlhKemFXOXVJam9pTWpFdU5DNHdJaXdpYjNOZllYSmphQ0k2SW1GeWJUWTBJaXdpYzNsemRHVnRYMnh2WTJGc1pTSTZJbVZ1TFZWVElpd2lZMnhwWlc1MFgySjFhV3hrWDI1MWJXSmxjaUk2TVRJM016QTNMQ0pqYkdsbGJuUmZaWFpsYm5SZmMyOTFjbU5sSWpwdWRXeHNmUT09",
            "X-Track": "eyJvcyI6Ik1hYyBPUyBYIiwiYnJvd3NlciI6IlNhZmFyaSIsImRldmljZSI6IiIsInN5c3RlbV9sb2NhbGUiOiJlbi11cyIsImJyb3dzZXJfdXNlcl9hZ2VudCI6Ik1vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzEzXzYpIEFwcGxlV2ViS2l0LzYwNS4xLjE1IChLSFRNTCwgbGlrZSBHZWNrbykgVmVyc2lvbi8xMy4xLjIgU2FmYXJpLzYwNS4xLjE1IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTMuMS4yIiwib3NfdmVyc2lvbiI6IjEwLjEzLjYiLCJyZWZlcnJlciI6IiIsInJlZmVycmluZ19kb21haW4iOiIiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTEzNTQ5LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==",
        },
    }
    let response = await axios(config);
    return response
}
module.exports = JoinCaptcha