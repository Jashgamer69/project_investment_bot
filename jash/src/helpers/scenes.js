const { send } = require("process");
const { Telegraf, Composer, session, Scenes } = require("telegraf");
const axios = require("axios");
const env = require("../env");
const bot = new Telegraf(env.bot_token);
//const { BaseScene, Stage } = Scenes
const { enter, leave } = Scenes.Stage;
//const stage = new Stage();
//const Scene = BaseScene
const { starter } = require('../functions/starter');
const {adminId,profit, findUser, findUserCallback, sendError, sendInlineError, mustJoin, isNumeric, globalBroadCast, curr} = require("../functions/misc.js");
const { db } = require("../functions/mongoClient");


const calculator = new Scenes.BaseScene("calculator");
const done = new Scenes.BaseScene("done");
const deposit = new Scenes.BaseScene("deposit")
const reply = new Scenes.BaseScene("reply");
const support = new Scenes.BaseScene("support");
const getWallet = new Scenes.BaseScene("getWallet");
const getMsg = new Scenes.BaseScene("getMsg");
const reinvest = new Scenes.BaseScene("reinvest");
const { onWithdraw } = require('../commands/withdraw')

/*const onWithdraw = new Scene('onWithdraw')
stage.register(onWithdraw)*/
reinvest.enter(async(ctx)=>{
  reinvest.on("text",async (ctx)=>{
    if(ctx.message.text == "🍕 Back"){
      await starter(ctx);
    ctx.scene.leave("calculator")
      return;
    }
  if(!isNaN(ctx.message.text)){ 
    var invest = ctx.message.text
    let bal = await db.collection("balance").find({ userId: ctx.from.id }).toArray();
    bal = parseFloat(bal[0].balance)
    if(parseFloat(invest) > bal){
  ctx.replyWithMarkdown("_❌ You Don't Have Enough Balance_",{reply_markup:{keyboard:[["⬅️ Return"]],resize_keyboard:true}});
  ctx.scene.leave("reinvest")
  return}
   const [get,per,plan] =  profit(invest)
    
  ctx.reply(`<b>You will deposit</b> ${invest} TRX <b>and receive a total returns of</b> ${get} TRX <b>at the end of 1 days, and this plan will pay you</b> ${per}.00 % <b>every 1 hours.

📥 Deposit Amount:</b> ${invest} TRX
<b>📈 Investment Plan:</b> ${plan}
<b>✅ Total profits:</b> ${get} TRX

🏪 <i>Your payment will be credited to your account after 24 Hours.</i>`,{
    parse_mode:"html",
reply_markup:{inline_keyboard:[[{text:"✅ Confirm", callback_data:"Confirm "+invest}]]}
})
    ctx.scene.leave("reinvest")
      return}
    ctx.replyWithMarkdown("_⚠️ Send Number Only_");
    ctx.scene.leave("reinvest")
  })
})

calculator.enter(async(ctx)=>{
  
calculator.on('text',async(ctx)=>{
  if(ctx.message.text == "🍕 Back"){
      await starter(ctx);
    ctx.scene.leave("calculator")
      return;
  }
  if(!isNaN(ctx.message.text)){
    var invest = ctx.message.text
    const [get,per,plan] =  profit(invest)
    ctx.reply(`<b>Profit Calculator
You will deposit </b>${ctx.message.text} TRX <b>and receive a total returns of </b>${get} TRX <b>at the end of 1 days, and this plan will pay you</b> ${per}.00 % <b>every 1 hours.</b>

<b>💰 Deposit Amount: </b>${ctx.message.text} TRX<b>
🕵 Investment Plan:</b> ${plan}
<b>💲 Total profits:</b> ${get} TRX

🏪 <i>Your payment will be credited to your account after 24 Hours.</i>`,{parse_mode:"Html",reply_markup:{keyboard:[[{text:"🍕 Back"}]],
resize_keyboard:true}})
    return 
  }
  ctx.replyWithMarkdown("_⚠️ Send Number Only_")
ctx.scene.leave("calculator");
  })
})

deposit.enter(async(ctx) => {
  /*deposit.on("text", async(ctx)=>{
    if(ctx.message.text == "🍕 Back"){
      await starter(ctx);
      ctx.scene.leave("deposit")
      return;
    }
  if(!isNaN(ctx.message.text)){
    if(ctx.message.text >= 2){
    */
  var dep = [[{ text: "🛎 Done", callback_data: "/done" }]]
 ctx.reply('*🚦 Kindly Send '+ctx.message.text+' TRX*.\n \n`TUm73AyS8m1xA3YKF4ihcRLFmKR46ScJaU`\n\n_After Paying Click Below Button_. 👇👇\n\n*⚠ If you send less than 2.00000000 TRX, your deposit will be ignored!*',{parse_mode:"markdown",reply_markup:{ inline_keyboard : dep }})
     ctx.scene.leave("deposit")
  /*return}       ctx.replyWithMarkdown("_⚠️ Minimum Deposit Amount is 2 TRX_")
    ctx.scene.leave("deposit")
    return}
    ctx.replyWithMarkdown("_⚠️ Send Number Only_")
    
  })
*/})
  done.enter(async(ctx)=>{
    done.on("text",async(ctx)=>{
      var hashh = await db.collection("hash").find({hash:ctx.message.text}).toArray();
      if(hashh){
      if(hashh.length == 1){
        ctx.replyWithMarkdown("⚠️ _You Cant Use Same Hash Again_")
        ctx.scene.leave();
     return; }}
      var bal = await db.collection("balance").find({userId:ctx.from.id}).toArray()
      
        axios.get("https://apilist.tronscan.org/api/transaction-info?hash="+ctx.message.text).then(response => {
      if(response.data.toAddress == env.address){
        
       let ammo = response.data.contractData.amount.toString()
       let str = ammo.slice(0, -6)
        var amo3 = ammo.replace(str,"")
        var amo = str+'.'+amo3
   
        
        
          if(amo >= 2){
            ctx.replyWithMarkdown("*Your Deposit Received*.\n⭐ Amount: "+amo+"\n\n⚠️Note:- If The Deposited Amount is Less Then 2 TRX Then It Will Not Be Added In Your Balance.")   
bot.telegram.sendMessage(env.paych,"*🍕🍕🍕🍕🍕🍕🍕🍕\nNEW Pizza ADDED\nTokens: "+amo+" TRX\nDuration: 24 hours \nBlockchain TXID:* \n["+response.data.hash+"](https://tronscan.org/#/transaction/"+response.data.hash+")\n\n*BurgerSwap - @"+ctx.botInfo.username+"*",{
    parse_mode:"markdown",
disable_web_page_preview:true})
           
        
db.collection("hash").insertOne({data:"hash",hash:response.data.hash})
            var damo = parseFloat(amo) + parseFloat(bal[0].balance)
            
            db.collection('balance').updateOne({userId: ctx.from.id},{$set:{balance:damo}},{upsert:true});
          
          ctx.scene.leave()
        return
      }}
    ctx.replyWithMarkdown("*Deposit Not Found*")
        ctx.scene.leave()
      }).catch(err => {
        console.log(err)
        sendError(err,ctx)
          ctx.replyWithMarkdown("*You Entered Wrohtmash*")
        ctx.scene.leave()
      })
    })
   })
reply.enter(async (ctx) => {
  reply.on("text", async (ctx)=>{
try{
  const key =  [[{ text: "🎤 Reply To Admin", callback_data: "/support" }]]
    console.log(ctx.message.text)
  bot.telegram.sendMessage(await adminId(), "<b>Message From Admin :</b>\n"+await ctx.message.text,{parse_mode:"html",reply_markup:{inline_keyboard:key},disable_web_page_preview:true}
             )
ctx.scene.leave("reply");
}catch(err){
    sendError(err, ctx);
}
    
})

});

support.enter(async (ctx) => {
 support.on("text", async (ctx)=>{
try{
  if(ctx.message.text.length >= 15){
// const key =  [ [{ text: "🎤 Reply To User", callback_data: "Reply "+ctx.from.id}]]

  
    ctx.replyWithMarkdown("*✅ Message Sent To Administrator:\n*"+ctx.message.text,{reply_markup:{
    keyboard:[['🍕 Back']],resize_keyboard:true
  }})
  
  bot.telegram.sendMessage(env.admin, "<b>Support Message From :</b>\n<a href='tg://user?id="+ctx.from.id+"'>@"+ctx.from.username+"</a>\n\nMessage:"+ctx.message.text,{parse_mode:"html"//,reply_markup:{inline_keyboard:key  }
  ,disable_web_page_preview:true}
             )
ctx.scene.leave("support");
return}
  ctx.replyWithMarkdown("*⚠️ Please, send a longer message!*\nTry to explain better what you need, as much as you can in a single message!",{reply_markup:{
    keyboard:[['🍕 Back']],resize_keyboard:true
  }})
  ctx.scene.leave("support")
} catch (err) {
    sendError(err, ctx);
  }
})});
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//getWallet.enter(async (ctx) => await ctx.replyWithMarkdown( `🏁 Please also submit your <b>Polygon (Matic)</b> wallet address. (Format should be 0x + 40 characters hexadecimal)\n\n<b>Note:</b> Please do not use any exchange wallet address.`, { parse_mode: "html", reply_markup: { hide_keyboard: true } } )  .catch((err) => sendError(err, ctx))              );getWallet.leave(async (ctx) => await starter(ctx));getWallet.hears("🔙 back", (ctx) => {ctx.scene.leave("getWallet");});

getWallet.enter( async (ctx) => {
 
   getWallet.on("text",async(ctx) =>{
     try{
      
    const msg = ctx.message.text;

if(msg == "/start"){
  await starter(ctx);
  ctx.scene.leave("getWallet");
return;}
    if (ctx.message.text.length >= 15) {
      let tr = await db
        .collection("allUsers")
        .find({ address: msg }).toArray();
      
      let cr = await db
        .collection("allUsers")
        .findOne({ userId: ctx.from.id });
      if (await tr.length == 0 || await tr?.userId == await ctx.from.id) {
        
        
        db.collection("allUsers").updateOne(
          { userId: ctx.from.id },
          { $set: { address: msg } },
          { upsert: true }
        );

let key = [
        ["🍕 Back"]
      ]
       await  ctx.reply("*📥 Wallet Set* :\n"+msg,{
     parse_mode:"Markdown",
        reply_markup:{
          keyboard:key,
          resize_keyboard: true,}
      })
     ctx.scene.leave("getWallet");   
      } else {
        ctx.replyWithMarkdown(
          "❌ The Entered Address is Already in Use by Other User! *Please Enter Your Own Address*"
        );
      }
    } else {
      await ctx.replyWithMarkdown("⛔ *Not Valid Address* \n_Send /start to Return To The Menu,\nOr Send a Correct Address_");}
  }catch (err) {
    sendError(err, ctx);
}
})
});

//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭

getMsg.enter(async (ctx) => {
  if (ctx.from.id != env.admin) {
    ctx.scene.leave("getMsg");
    return;
  }
  await ctx.replyWithMarkdown(
    " *Okay Admin 👮‍♂, Send your broadcast message*",
    { reply_markup: { keyboard: [["⬅️ Back"]], resize_keyboard: true } }
  );
});

getMsg.leave(async (ctx) => await starter(ctx));

getMsg.hears("⬅️ Back", (ctx) => {
  ctx.scene.leave("getMsg");
});

getMsg.on("text", async (ctx) => {
  ctx.scene.leave("getMsg");
  if (ctx.from.id != env.admin) {
    return;
  }

  let admin = env.admin;

  let postMessage = ctx.message.text;
  if (postMessage.length > 3000) {
    return ctx.reply(
      "Type in the message you want to sent to your subscribers. It may not exceed 3000 characters."
    );
  } else {
    globalBroadCast(ctx, admin);
  }
});

//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭


const stage = new Scenes.Stage(
  [ calculator, done, deposit, reply, support, getWallet, getMsg, reinvest, onWithdraw ],
  {
    ttl: 600,
  }
);

exports.stages = stage.middleware();
