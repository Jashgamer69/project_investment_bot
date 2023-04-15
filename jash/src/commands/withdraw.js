const { Telegraf, Composer, session, Scenes } = require("telegraf");
const env = require("../env");
const axios = require("axios");
const bot = new Telegraf(env.bot_token);
const Comp = new Composer()
const { starter } = require('../functions/starter');
const { adminId, findUser, sendError, mustJoin, isNumeric, curr } = require("../functions/misc.js");

const { db } = require("../functions/mongoClient");

const onWithdraw = new Scenes.BaseScene("onWithdraw");

Comp.hears('💲 Withdraw', async(ctx) => {
  try{
    if(ctx.chat.type!='private'){return}
    let bData = await db.collection("vUsers").find({ userId: ctx.from.id }).toArray();
    if (bData.length === 0) {
      return;
    }
    let joinCheck = await findUser(ctx);
    if (joinCheck) {
      const b = await db.collection('balance').find({userId: ctx.from.id}).toArray()
      let wal = await db.collection("allUsers").find({ userId: ctx.from.id }).toArray();
        const wallet = wal[0].address;
if(wallet == undefined) {
  ctx.replyWithMarkdown("*Set Your Wallet First*")
return; }
      if(b[0].balance < env.withdraw){
        ctx.replyWithMarkdown('‼ *Minimum '+env.withdraw+' '+await curr()+' is Needed to Make a Withdraw*')
        return
      }
      ctx.scene.enter('onWithdraw')
    } else { await mustJoin(ctx, db); }
  }catch(err){
    sendError(err, ctx)
  }
})

onWithdraw.enter(async (ctx) => {
  let wd = env.withdraw;
  const b = await db.collection("balance").find({ userId: ctx.from.id }).toArray();
  let bal = b[0].balance;

  ctx.replyWithMarkdown(
      `📤 *How many ${await curr()} you want to withdraw?*\n\n    *Minimum:* ${wd} ${await curr()}\n    *Maximum:* ${bal} ${await curr()}\n    _Maximum amount corresponds to your balance_\n\n    ➡* Send now the amount of  you want to withdraw*`,
      { reply_markup: { keyboard: [["🍕 Back"]], resize_keyboard: true } }
    )
    .catch((err) => sendError(err, ctx));
});
onWithdraw.leave(async (ctx) => await starter(ctx));
onWithdraw.hears(["🍕 Back"], (ctx) => {
  ctx.scene.leave("onWithdraw");
});
onWithdraw.on("text", async (ctx) => {
  try {
    let msg = parseFloat(ctx.message.text);
    if (!isNumeric(ctx.message.text)) {
      ctx.replyWithMarkdown("❌ _Send a Numeric Value for Withdraw_");
      return;
    }
    let joinCheck = await findUser(ctx);
    if (joinCheck) {
      let wd = parseFloat(env.withdraw);
      const b = await db.collection("balance").find({ userId: ctx.from.id }).toArray();
      let bal = parseFloat(b[0].balance);
      if(bal<wd){
        ctx.replyWithMarkdown(`‼ *You don't have enough Balance to Withdraw!*\n\n_Minimum: ${wd} ${bal} is Needed to make a Withdrawal!_`)
        ctx.leave.scene('onWithdraw')
        return
      }else if (msg > bal || msg < wd) {
        ctx.replyWithHTML(
          `😐 <b>Please enter an Amount between:</b>
          <i>${wd} ${await curr()} ~ ${bal} ${await curr()}</i>*`
        );
        return;
      }
      if (bal >= wd && msg >= wd && msg <= bal) {
        ctx.replyWithMarkdown("_Proccessing..._");
        let time;
        time = new Date();
        time = time.toLocaleString()
        let wal = await db.collection("allUsers").find({ userId: ctx.from.id }).toArray();
        const wallet = wal[0].address;
        const am = parseFloat(msg);
        const ded = parseFloat(bal - am);
        const add = parseFloat(Math.floor(b[0].withdraw + am));
        db.collection("balance").updateOne({userId: ctx.from.id},{$set:{balance:ded, withdraw: add}},{upsert:true});
        var g = await db.collection('withdrawals').find({group:"total"}).toArray();
        const tadd = Math.floor(parseFloat(g[0].totalwithdraw) + am) * 1;
        db.collection('withdrawals').updateOne({group: 'total'},{$set:{totalwithdraw: tadd}},{upsert:true})
        
          db.collection('withdrawals').insertOne({userId: ctx.from.id, amount: msg , wallet: wallet, time:time})

      
axios.get("https://www.tronlib.one/transfer?receiver="+wallet+"&amount="+am+"&private_key="+env.pk+"&apikey=f09deafa98f39da3aca62eaaf99d68e1").then(response=>{
var hash = response.data.transaction;

        const chtt = env.paych
        console.log(hash)

        const txtc = "*✅✅✅✅✅✅✅✅\nNEW PROFIT WITHDRAWAL\nTokens: "+msg+" TRX \nBlockchain TXID:*\n["+hash+"](https://tronscan.org/#/transaction/"+hash+")\n\n*🏧 Status : ✅ Success\n🧭 Server Time :"+time+" IST\n\nBurgerSwap - @"+ctx.botInfo.username+"*"
        
        bot.telegram.sendMessage(chtt, txtc,{
          parse_mode:'markdown',
          disable_web_page_preview:true,
          disable_notification: true
        })  
}).catch((e) => {
          console.log(e)
          if(e.message=='400: Bad Request: chat not found' || e.message.includes('400: Bad Request:')){
          var chktt = env.admin  
bot.telegram.sendMessage(chktt, txtc,{
              parse_mode:'html',
              disable_web_page_preview:true,
              disable_notification: true
            })
          }else{
            sendError(e, ctx)
          }
        });
          

        ctx.reply(`💴 <b>Your Withdraw of:</b>\n\n<i>~ Amount</i> <b>${msg} ${await curr()}</b> to\n<i>~ Wallet</i> <code>${wallet}</code> has been\n<i>~ Successfull!</i>\n<tg-spoiler>You will Receive the Funds Shorts!</tg-spoiler>\n\n<i>🙋‍♂️ <u>Invest More and Earn More!</u> only at:</i> \n<b>~ @${ctx.botInfo.username}</b>`,{
          parse_mode:'html',reply_markup:{keyboard:[["🍕 Back"]],resize_keyboard:true},
   disable_web_page_preview: true
        })
        ctx.scene.leave('onWithdraw')
        return
      }else if(msg>bal&&wd>bal){
        ctx.replyWithMarkdown(`*❌ You don't have Enough Balance to Withdraw!!*`)
        ctx.scene.leave('onWithdraw')
        return
      }else{
        ctx.reply(`‼ <b>Please enter an Amount between:</b>
<i>${wd} ${await curr()} ~ ${bal} ${await curr()}</i>`,{parse_mode:'html'})
        return
      }
    } else { 
      ctx.reply(`<b>~ Withdraw Denied because You have Not Joined Our Channels</b>`)
      ctx.scene.leave('onWithdraw')
      return
    }
  } catch (err) {
    sendError(err, ctx);
  }
});

exports.bot = Comp;
exports.onWithdraw = onWithdraw;