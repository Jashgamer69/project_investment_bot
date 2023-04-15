const env = require('../env')
const { Telegraf } = require("telegraf");
const bot = new Telegraf(env.bot_token);
const { adminId, findUser, findUserCallback, sendError, sendInlineError, mustJoin, curr } = require("./misc.js");

const { db } = require("./mongoClient");
async function menuText(ctx) {
  return `<b>🍕 PizzaSwap - Mining rewards for liquidity providers</b>
PizzaSwap is an open-source automated market maker (AMM) running on the Tron (TRX). It is the first decentralized protocol on the chain boasting a democratic autonomy swap. PizzaSwap Telegram is connected directly to You via their OpenApi and Cross-chain Bridge to add liquidity directly to the pool. 
<b>🔆 No minimum period, can be withdrawn anytime
♻️ Double your investments in 24 hours, up to 200%
💸 Earn up to 20% from your referrals, unlimited earnings</b>
〽️ <u>Add liquidity to pool and start yield farming</u>
🍕 1-200 TRX (5% / Day)
🍕 200-500 TRX (6% / Day)
🍕 500-10000 TRX (8% / Day)
<i>This is the only PizzaSwap Telegram, beware of scams.</i>`;
}

async function startedBot(ctx) {
  try {
    let pData = await db.collection("pendUsers").find({ userId: ctx.from.id }).toArray();
    let dData = await db.collection("allUsers").find({ userId: ctx.from.id }).toArray();

    if ("inviter" in pData[0] && !("referred" in dData[0])) {
      let bal = await db.collection("balance").find({ userId: pData[0].inviter }).toArray();
 const ref_bonus = env.refer === 0 || !env.refer ? "Not Set" : env.refer;
db.collection("allUsers").updateOne({ userId: ctx.from.id },{ $set: { inviter: pData[0].inviter, referred: "done" } },{ upsert: true });
      let msg;
      const xData = await db.collection('pendingRef').find({userId: pData[0].inviter, ref:ctx.from.id}).toArray()
      if(ref_bonus=='Not Set'&&xData.length===0){
        db.collection('pendingRef').insertOne({userId: pData[0].inviter, ref: ctx.from.id, state:'unpaid'})
        msg = `💁‍♂️ Referral Amount is not configured by Admin, You will Receive your Ref Amount once the Admin set the Amount`
      }else{
        var cal = bal[0].balance * 1;
        var sen = ref_bonus * 1;
        var see = cal + sen;
        msg = `➕ <b>Amount :</b> ${ref_bonus} ${await curr()} <b>Added to Balance</b>` 
        db.collection("balance").updateOne({ userId: pData[0].inviter },{ $set: { balance: see } },{ upsert: true });
      }
      let totRefs = await db.collection("allUsers").find({ inviter: ctx.from.id }).toArray();
      await bot.telegram.sendMessage(
        pData[0].inviter,
        `➕ <b>New User Attracted by Your Referral link</b>\n\n🙋 <b>User :</b> <a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>\n\n${msg}\n\n📟 <b>Total Invited :</b> <i>${totRefs.length} User(s)</i>`,
        { parse_mode: "html" }
      );
      
      ctx.reply(`🙋‍♂️ <b>You were Invited to This Bot by:</b> <a href='tg://user?id=${pData[0].inviter}'>${pData[0].inviter}</a>`,
    {parse_mode:"html"})
      db.collection('vUsers').updateOne({ userId: ctx.from.id}, {$set:{stage:'old'}},{upsert: true})
    }
    
    const bal = await db.collection("balance").find({ userId: ctx.from.id }).toArray();
      
      await ctx.reply(`<b>${await menuText(ctx)}</b>`, {
        parse_mode: "html",
        reply_markup: {
keyboard: [
          ["🍕 Deposit"],
          ["💱 Re-invest", "💲 Withdraw ", "📢 Referrals"],
          ["🏛 Account", "💢 Calculator", "🚀 Others.."]
        ],
        resize_keyboard: true,
      },
      });
    
  }catch (err){
    sendError(err, ctx);
}}



exports.starter = startedBot;