const bs58 = require ('bs58');
const web3 = require ('@solana/web3.js')
const anchor = require ("@project-serum/anchor")
const { Transaction } = require ('@solana/web3.js')
const HTTPUtils = require ("./tlsSupport.js");

const Log = require("../../log");
const { setTitle, createTitle } = require("../../../pages/utils/title");
const { projectName, projectVersion } = require("../../../versionData");
const {Bright, Red} = require('../../../pages/utils/colors.js')
const timeout = require("../../../pages/utils/timeout");

const { awaitTransactionSignatureConfirmation } = require("../cmv2/tsCompiled/candy-machine.js")
const { simulateTransaction } = require("../cmv2/tsCompiled/connection.js")

class MESniper {
    nftData = {};
    logStatus = "";

    constructor(data, tasks, total, good, bad) {
        try {
            this.SECRET_KEY = data.secret_key;
            this.COLLECTION_NAME = data.collection_name;
            this.DELAY = data.delay_requests
            this.WISH_PRICE = data.wish_price
            this.PAYER = anchor.web3.Keypair.fromSecretKey(bs58.decode(this.SECRET_KEY));
            this.SOLANA_CLIENT = new web3.Connection("https://api.mainnet-beta.solana.com");

            this.LOGS = [];
            this.GOOD = good;
            this.BAD = bad;

            this.RUNNING = tasks;
            this.TOTAL = total
        } catch(e) {
            this.logIt(e)
        }
    }

    updateTitle(running, good, bad) {
        setTitle(
            createTitle([
                projectName,
                `v${projectVersion}`,
                `MagicEden Sniper | Running - ${running} | Successful - ${good} | Failed - ${bad}`
            ]))
    }

    async logIt(data) {
        timeout(this.delay)
        let type = this.success == false ? "error" : "info"
        await this.LOGGER.handle(type, `[TASK-${this.RUNNING}] - ${data}`, true, false)
        this.LOGS.push({
            type: type,
            info: `[SNIPER-${this.RUNNING}] - ${data}`
        })
        return
    }

    async SnipeInit() {
        try {
            this.LOGGER = new Log()
            this.LOGGER.create("MagicEden Sniper", false)

            this.updateTitle(this.TOTAL, this.GOOD, this.BAD)

            await this.logIt(`Monitoring for collection: ${this.COLLECTION_NAME}`);

            let nft_info = [];
            let taskInput = this.COLLECTION_NAME

            let monitorHeaders = {
                "accept": "application/json, text/plain, */*",
                "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Google Chrome\";v=\"98\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://www.magiceden.io/",
            }

            let monitorOptions = {
                "referrerPolicy": "strict-origin-when-cross-origin",
                "mode": "cors",
                "credentials": "omit"
            }

            HTTPUtils.tlsHttpGet(
                `https://api-mainnet.magiceden.io/rpc/getListedNFTsByQuery?q={"$match":{"collectionSymbol":"${taskInput}"},"$sort":{"takerAmount":1},"$skip":0,"$limit":20,"status":[]}`,
                monitorHeaders,
                monitorOptions,
                200
            ).then((res) => {
                let json = res.json;
                if (json) {
                    if (json.results.length > 0) {
                        for (let i = 0; i < json.results.length; i++) {
                            let nft = json.results[i]
                            let image = nft.img;
                            let price = nft.price;
                            let name = nft.title;
                            let url = `https://www.magiceden.io/item-details/${nft.mintAddress}`;
        
                            nft_info.push({
                                'image': image,
                                'price': price,
                                'name': name,
                                'url': url
                            });
                            this.getNFTInfo(nft.mintAddress)
                            return;
                        }
                    } else {
                        try{
                            this.logIt("No items found. Retrying...");
                            setTimeout(this.SnipeInit.bind(this), this.DELAY);
                        } catch (e){
                            this.logIt(e.message)
                            this.BAD++
                            setTimeout(this.SnipeInit.bind(this), this.DELAY);
                        }
                    }
                }
                else {
                    this.BAD++
                    setTimeout(this.SnipeInit.bind(this), this.DELAY);
                }
            }).catch((e) => {
                this.logIt(`${e.message}`);
                this.BAD++
                setTimeout(this.SnipeInit.bind(this), this.DELAY);
            });
        } catch (err) {
            this.logIt(`${err.message}`);
            this.BAD++
            setTimeout(this.SnipeInit.bind(this), this.DELAY);
            return;
        }
    }

    async getNFTInfo(mint_address) {
        try {
            let NFTInfoHeaders = {
                "accept": "application/json, text/plain, */*",
                "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Google Chrome\";v=\"98\"",
                "sec-ch-ua-mobile": "?0",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://www.magiceden.io/",
                "Referrer-Policy": "strict-origin-when-cross-origin",
                "origin": "magiceden.io"
            }

            let NFTInfoOptions = {
                "referrer": "https://www.magiceden.io/",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET",
                "mode": "cors",
                "credentials": "omit"
            }

            HTTPUtils.tlsHttpGet(
                "https://api-mainnet.magiceden.io/rpc/getNFTByMintAddress/" + mint_address,
                NFTInfoHeaders,
                NFTInfoOptions,
                200
            ).then((res) => {
                let json = res.json;
                if (json) {
                    this.nftData.mint_token = mint_address;
                    this.nftData.seller = json.results.owner;
                    this.nftData.price = json.results.price;
                    this.nftData.auction_house = json.results.v2.auctionHouseKey;
                    this.nftData.token_ata = json.results.id;
                    this.nftData.seller_referral = json.results.v2.sellerReferral;
                    this.buyNFT();
                }
            }).catch((e) => {
                this.logIt(`${e.message}`);
                this.BAD++
                setTimeout(this.SnipeInit.bind(this), this.DELAY);
            });
        } catch(err) {
            this.logIt(`${err.message}`);
            this.BAD++
            setTimeout(this.SnipeInit.bind(this), this.DELAY);
        }
    }

    async buyNFT() {
        try {
            if (this.nftData.price > this.WISH_PRICE) {
                try{
                    this.logIt("No items found. Retrying...");
                    setTimeout(this.SnipeInit.bind(this), this.DELAY);
                } catch (e){
                    this.logIt(e)
                    this.BAD++
                    setTimeout(this.SnipeInit.bind(this), this.DELAY);
                }
            } else {
                if (this.nftData.price < this.WISH_PRICE) {
                    this.logIt(`Found a cheaper listing than ${this.WISH_PRICE}`);
                }

                let NFTBuyHeaders = {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Google Chrome\";v=\"98\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                    "Referer": "https://www.magiceden.io/",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                }

                let NFTBuyOptions = {
                    "mode": "cors",
                    "credentials": "omit"
                }

                HTTPUtils.tlsHttpGet(
                    "https://api-mainnet.magiceden.io/v2/instructions/buy_now?buyer=" + this.PAYER.publicKey + "&seller=" +  this.nftData.seller + "&auctionHouseAddress=" +  this.nftData.auction_house + "&tokenMint=" +  this.nftData.mint_token + "&tokenATA=" +  this.nftData.token_ata + "&price=" +  this.nftData.price + "&sellerReferral=" +  this.nftData.seller_referral + "&sellerExpiry=-1",
                    NFTBuyHeaders,
                    NFTBuyOptions,
                    200
                ).then((res) => {
                    let json = res.json;
                    if (json) {
                        let TXData = json.txSigned.data;
                        this.getAndSendTX(TXData);
                    }
                }).catch((e) => {
                    this.logIt("Error with snipe: " + e.message);
                    this.BAD++
                    setTimeout(this.SnipeInit.bind(this), this.DELAY);
                });
            }
        } catch(err){
            this.logIt("Error with snipe: " + err.message);
            this.BAD++
            setTimeout(this.SnipeInit.bind(this), this.DELAY);
        }
    }
    
    
    async getAndSendTX(data) {
        try {
            this.logIt("Signing the transaction...");
    
            var TX = Transaction.from(data);
            TX.partialSign(this.PAYER);
        
            var TXN = TX.serialize({
                requireAllSignatures: false,
                verifySignatures: false,
            });
    
            const startTime = this.getUnixTs();
            let slot = 0;
    
            const txid = await this.SOLANA_CLIENT.sendRawTransaction(TXN, {
                skipPreflight: true,
            });
    
            this.logIt(`${Bright}Confirming the transaction for ${txid}`);
        
            let done = false;
            let timeout = 300000;
    
            (async () => {
                while (!done && this.getUnixTs() - startTime < timeout) {
                    this.SOLANA_CLIENT.sendRawTransaction(TXN, {
                        skipPreflight: true,
                    });
                    await this.sleep(300);
                  }
            })();

            try {
                const confirmation = await awaitTransactionSignatureConfirmation(
                    txid,
                    timeout,
                    this.SOLANA_CLIENT,
                    "recent",
                    true
                  );
            
                  if (!confirmation)
                  this.logIt("Timed out awaiting confirmation on transaction");
            
                  if (confirmation.err) {
                    this.logIt("Transaction failed: Custom instruction error" , confirmation.err);
                  }
            
                  slot = confirmation?.slot || 0;
            } catch (err) { 
                let status = JSON.stringify(err)

                if (err.timeout) {
                    this.logIt("Timed out awaiting confirmation on transaction");
                }
    
                let simulateResult = null;
    
                try {
                    simulateResult = (
                        await simulateTransaction(this.SOLANA_CLIENT, signedTransaction, "single")
                    ).value;
                } catch (e) { }
    
                if (simulateResult && simulateResult.err) {
                    if (simulateResult.logs) {
                        for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
                            const line = simulateResult.logs[i];
                            if (line.startsWith("Program log: ")) {
                                this.logIt("Transaction failed: " + line.slice("Program log: ".length));
                            }
                          }
                      }
                    
                      this.logIt(JSON.stringify(simulateResult.err));
                }

                if(status === '{"InstructionError":[4,{"Custom":6008}]}'){
                    this.success = false;
                    this.logIt("Insufficient funds in your Solana Wallet!")
                    this.BAD++
                    setTimeout(this.MintInit.bind(this), 1500)
                } else if (status = "{}") {
                    this.logIt(`${Bright}Successfully sniped!`)
                    this.GOOD++
                } else {
                    this.success = false;
                    this.logIt("Sniping failed, retrying...")
                    this.BAD++
                    setTimeout(this.MintInit.bind(this), 1500)
                } 
            } finally {
              done = true;
            }
        } catch (err) {
            if (err.message.includes("Blockhash not found")) {
                setTimeout(this.buyNFT.bind(), 3000);
            } else {
                this.logIt(`${err}`);
            }
        }
    }
    
    getUnixTs = () => new Date().getTime() / 1000;
    
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

module.exports = MESniper