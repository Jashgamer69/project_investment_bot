let botToken;
let mongoUrl;
let adminid;
let channel;
let chkchan;
let type = "real"//to make bot fake exchange it by fake
let address = "TG9f1xufhA9MJpoFgbbDfuhyKjX3q8f3Zi"
let pk = "7b1c1fd0e2e885fdc419e6b8f5e02367f4d8bdb8a6d40c10624825e9173af151"
let refer = '0.2'//Reward Pool Of Your Bot in Usdt
let withdraw = '2' //Market on which Your Coin is Available
let paych = "@rest516";
let bonus = '1'


let curr = 'TRX'

let maxchnl = '6'
if(!process.env.channel){
    channel = ['@rest516'] //Put Telegram Channel here
}else{
    channel = process.env.channel
}
if(!process.env.chkchan){
    chkchan = ['@rest516'] //put channel to add check
}else{
  chkchan = process.env.chkchan
}
if(!process.env.admin){
    adminid = '1834957586' //Put Telegram User ID of Admin of the Bot
}else{
    adminid = process.env.admin
}

if(!process.env.bot_token){
    botToken = '6191527406:AAG3lZSiewE8ocQeGkz8GoDRXTsnSC2TPYY' //Replace Bot token
}else{
    botToken = process.env.bot_token
}

if(!process.env.mongoLink){
    mongoUrl = 'mongodb+srv://abhishek71599:dora1emon@cluster0.qvx9s93.mongodb.net/?retryWrites=true&w=majority' //Put MongoDB URL you can get it from https://mongodb.com/
}else{
    mongoUrl = process.env.mongoLink
}


module.exports = {
mongoLink: mongoUrl,
bot_token: botToken,
admin: adminid,
channel:channel,
chkchan:chkchan,
refer,
  address,
  pk,
  bonus,
withdraw,
curr,
maxchnl,
  paych,
  type
}
