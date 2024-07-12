// const request = require("request-promise").defaults({gzip: true});

// async function loginWebhook(user, key) {
//     const results = await request({
//         method: "POST",
//         url: `http://localhost:3000/newLogin`,
//         json: true,
//         body: {
//             "user": user,
//             "key": key,
//             "time": Date.now()
//         }
//     }).then(async (res) => {
//         return "success"
//     }).catch(async (err) => {
//         return "error"
//     })
// }

// async function loginFailed(key) {
//     const results = await request({
//         method: "POST",
//         url: `http://localhost:3000/errorLogin`,
//         json: true,
//         body: {
//             "key": key,
//             "time": Date.now()
//         }
//     }).then(async (res) => {
//         return "success"
//     }).catch(async (err) => {
//         return "error"
//     })
// }

// module.exports = {loginWebhook, loginFailed}