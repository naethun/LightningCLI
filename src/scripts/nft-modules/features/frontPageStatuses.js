const web3 = require('@solana/web3.js');
const fetch = require('cross-fetch');

const connection = new web3.Connection("https://api.mainnet-beta.solana.com", "confirmed");

class FrontPageFeatures {
    constructor(data){
        this.KEY = new web3.PublicKey(data.private_key);
    }

    async retrieveBalance () {
        const publicKey = this.KEY;
    
        const balance = await connection.getBalance(publicKey);
    
        let solanaConvert = balance * 0.000000001
        console.log(`\x1b[34mYour Solana balance is: ${solanaConvert} SOL`);
    }
    
    async cryptoPrices () {
        var data = await fetch('https://api.nomics.com/v1/currencies/ticker?key=5dd4044a25cc251fcfa64606786b9cdc771399eb&ids=ETH,SOL&interval=1h&per-page=100&page=1')
    
        await data.json().then(data_ => {
            var eth = parseFloat(data_[0].price).toFixed(2)
            var sol = parseFloat(data_[1].price).toFixed(2)
    
            console.log(`\x1b[34mETH: $ ${eth} SOL: $ ${sol}`)
        })
    }
}

module.exports = FrontPageFeatures