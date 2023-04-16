const { Telegraf, session, Markup, Scenes } = require("telegraf");
const env = require("./src/env");
const admin = env.admin;
const bot = new Telegraf(env.bot_token);
//Connect to Mongodb and then Launch Bot:

const mongo = require("./src/functions/mongoClient");
bot.launch().then(console.log("Bot Launched"));
const { db } = require("./src/functions/mongoClient");
const { starter } = require('./src/functions/starter');
const { compChnl } = require("./src/commands/channels.js");

const { mathCaptcha } = require("./src/functions/math-captcha.js");
const { profit, adminId, curr, findUser, findUserCallback, sendError, sendInlineError, mustJoin, isNumeric, globalBroadCast } = require("./src/functions/misc.js");

const { stages } = require("./src/helpers/scenes");
const withComp = require('./src/commands/withdraw').bot

bot.use(session());
bot.use(stages);
bot.use(withComp);
bot.use(compChnl);

const rateLimit = require("telegraf-ratelimit");

const buttonsLimit = {
  window: 1000,
  limit: 1,
  onLimitExceeded: (ctx, next) => {
    if ("callback_query" in ctx.update)
      ctx.answerCbQuery("✋ Don't Press Buttons Quickly , Try Again...", { show_alert: true })
        .catch((err) => sendInlineError(err, ctx));
  },
  keyGenerator: (ctx) => {
    return ctx.callbackQuery ? true : false;
  },
};
bot.use(rateLimit(buttonsLimit));

  
  
bot.command('stopbot', ctx => { ctx.scene.enter('notfound') })

function sleep(m) {
  return new Promise((r) => setTimeout(r, m));
}

//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭


  botStart = async (ctx) => {
  try {
    if (ctx.message.chat.type != "private") {
      return;
    }
    let dbData = await db.collection("allUsers").find({ userId: ctx.from.id }).toArray();
    let bDa = await db.collection("vUsers").find({ userId: ctx.from.id }).toArray();
    let totalw = await db.collection("withdrawals").find({group:"total"}).toArray()
    let Bal = await db.collection("balance").find({ userId: ctx.from.id }).toArray();
    let PendA = await db.collection("pendUsers").find({ userId: ctx.from.id }).toArray();
    if (dbData.length === 0 && bDa.length === 0) {
      if (ctx.startPayload && ctx.startPayload != ctx.from.id && isNumeric(ctx.startPayload)) {
        let ref = ctx.startPayload * 1;
        if (PendA.length === 0) {
          await db.collection("pendUsers").insertOne({ userId: ctx.from.id, inviter: ref });
        }
      } else {
        if (PendA.length === 0) {
          db.collection("pendUsers").insertOne({ userId: ctx.from.id });
        }
      }
      if (dbData.length === 0) {
        let lName = ctx.from.last_name;
        if (!ctx.from.last_name) {
          lName = "null";
        }
        await db.collection("allUsers").insertOne({ userId: ctx.from.id, firstName: ctx.from.first_name, lastName: lName, paid: false, stage: 'new' });
        if(totalw.length === 0){
db.collection("withdrawals").insertOne({ group: "total", totalwithdraw: 0,totald:0});
        }
        if (Bal.length === 0) {
          await db.collection("balance").insertOne({ userId: ctx.from.id, balance: 0, withdraw: 0 });
        }
      }
      let tData = await db.collection("allUsers").find({}).toArray();

      let linkk = "<a href='tg://user?id=" + ctx.from.id + "'>@" + ctx.from.username + "</a>";
      if (!ctx.from.username) {
        linkk = "<a href='tg://user?id=" + ctx.from.id + "'>Click Here</a>";
      }
      await bot.telegram.sendMessage(
        admin,
        `➕ <b>New User Notification ➕</b>\n\n👤<b>User:</b> <a href='tg://user?id=${ctx.from.id}'>${ctx.from.first_name}</a>\n\n🆔 <b>ID :</b> <code>${ctx.from.id}</code>\n\n<b> Link :</b> ${linkk}\n\n🌝 <b>Total User's Count: ${tData.length}</b>`,
        {
          parse_mode: "html"
        }
      );
      mathCaptcha(ctx);
    } else if (bDa.length === 0) {
      mustJoin(ctx, db);
    } else {
      if (ctx.startPayload && ctx.startPayload == ctx.from.id) {
        ctx.reply('🤦‍♂️ <i>Do not Use Your Referral Link Your self, Share it to Your Friends!</i>', { parse_mode: 'html', reply_markup: { inline_keyboard: [[{ text: '🔀 Share Link', url: 'https://t.me/share/url?text=https://t.me/' + ctx.botInfo.username + '?start=' + ctx.from.id }]] } })
      } else if (ctx.startPayload) {
        ctx.reply('🎭 <i>You Were Already Attracted!</i>', { parse_mode: 'html' })
      }
      let joinCheck = await findUser(ctx, db);
      if (joinCheck) {
        let joingDa = await db.collection("joinedUsers").find({ userId: ctx.from.id }).toArray();
        if (joingDa.length === 0) {
          db.collection("joinedUsers").insertOne({ userId: ctx.from.id, join: true, });
        } else {
          db.collection("joinedUsers").updateOne({ userId: ctx.from.id }, { $set: { join: true } }, { upsert: true });
        }
       
        await starter(ctx);
      } else {
        await mustJoin(ctx, db);
      }
    }
  } catch (err) {
    sendError(err, ctx)
  }
}

bot.start(botStart);
bot.hears(["🍕 Back", "⬅️ Return"], botStart);
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
async function afterCaptcha(ctx) {
  try {
    let vData = await db.collection("vUsers").find({ userId: ctx.from.id }).toArray();
    if (ctx.from.last_name) {
      valid = ctx.from.first_name + " " + ctx.from.last_name;
    } else {
      valid = ctx.from.first_name;
    }
    if (vData.length === 0) { await db.collection("vUsers").insertOne({ userId: ctx.from.id, name: valid, stage: 'new' }); }
    await ctx.deleteMessage();

    let joinCheck = await findUser(ctx);
    if (joinCheck) {
      let joinDal = await db.collection("joinedUsers").find({ userId: ctx.from.id }).toArray();
      if (joinDal.length === 0) {
        db.collection("joinedUsers").insertOne({ userId: ctx.from.id, join: true, });
      } else {
        db.collection("joinedUsers").updateOne({ userId: ctx.from.id }, { $set: { join: true } }, { upsert: true });
      }
    
      await starter(ctx);
    } else {
      await mustJoin(ctx, db);
    }
  } catch (err) {
    sendInlineError(err, ctx, db);
  }
}
/////////////////////////////////////////////////

bot.action("/joined", async (ctx) => {
  try {

    let bData = await db.collection("vUsers").find({ userId: ctx.from.id }).toArray();

    if (bData.length === 0) {
      console.log("u")
      return;
    }
    if (ctx.update.callback_query.message.chat.type != "private") {
      ctx.leaveChat();
      return;
    }

    let joinCheck = await findUserCallback(ctx, db);
    if (joinCheck) {
      let joinnDa = await db.collection("joinedUsers").find({ userId: ctx.from.id }).toArray();
      if (joinnDa.length === 0) {
        db.collection("joinedUsers").insertOne({ userId: ctx.callbackQuery.from.id, join: true, });
      } else {
        db.collection("joinedUsers").updateOne({ userId: ctx.callbackQuery.from.id }, { $set: { join: true } }, { upsert: true });
      }
      await ctx.deleteMessage();
    
      await starter(ctx);

    } else {
      await ctx.deleteMessage();
      await ctx.answerCbQuery("⛔ Must Join All Channels", {
        show_alert: true,
      });
      await mustJoin(ctx, db);
    }
  } catch (err) {
    sendInlineError(err, ctx, db);
  }
});
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭

bot.command("broadcast", async (ctx) => {

  if (ctx.from.id == env.admin) {
    ctx.scene.enter("getMsg");
  }
});
bot.action("/broadcast", async (ctx) => {
  let admin;

  await ctx.answerCbQuery();
  admin = env.admin
  if (ctx.from.id == admin) {
    ctx.scene.enter("getMsg");
  }
});

//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
bot.action(/^\Reply/, async (ctx) => {
  const callbackData = ctx.callbackQuery.data
  const params = callbackData.split(' ')
  ctx.replyWithMarkdown("Enter Message", {
    reply_markup: {
      keyboard: [["⛔ Cancel"]],
      resize_keyboard: true
    }
  })
  ctx.scene.enter('reply')

})

bot.hears("🆘 Support",
  ctx => {
    ctx.reply(
      "*⁉️ Contact Helpdesk*\n_Kindly Leave The Message and Our Support Team Will Reach Within Sometime_.", { parse_mode: "markdown" }
    )
    ctx.scene.enter("support");

  })


bot.hears("/give", async (ctx) => {
  db.collection('balance').updateOne({ userId: ctx.from.id }, { $set: { balance: 10 } }, { upsert: true });
})
bot.hears("🏛 Account", async (ctx) => {
  try {
    if (ctx.message.chat.type != "private") {
      return;
    }
    var valid = !ctx.from.last_name ? ctx.from.first_name : ctx.from.first_name + " " + ctx.from.last_name;

    let bData = await db.collection("vUsers").find({ userId: ctx.from.id }).toArray();

    if (bData.length === 0) {
      return;
    }
    let joinCheck = await findUser(ctx);
    if (joinCheck) {
      let thisUsersData = await db.collection("balance").find({ userId: ctx.from.id }).toArray();

      let sum = thisUsersData[0].balance;
       
                   const bs = await db.collection('withdrawals').find({ userId: ctx.from.id }).toArray();
             let x = 0;
    for (var i = 0; i < bs.length; i++) {
      x += bs[i].amount}

      await ctx.reply(
        `<b>🍕 Account Information

🏧 My Balance:</b> ${sum} ${await curr()}
<b>👛 Available for Withdrawal: </b>${sum} ${await curr()}

<b>Earning Report
📤 Total Withdrawn:</b> ${x} TRX
      `,
        {
          parse_mode: "html"
        }
      );
    } else { await mustJoin(ctx, db); }
  } catch (err) {
    sendError(err,ctx);
  }
});
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
bot.hears("🔃 Trx Wallet",
  async (ctx) => {
    var key = [[{ text: "🚀 Set/Change Wallet 💼", callback_data: "/set" }]]
    let wal = await db.collection("allUsers").find({ userId: ctx.from.id }).toArray();
    let wallet;
    wallet = wal === undefined || !wal ? "null" : wal[0].address;
    await ctx.reply(
      "*💡 Your currently set TRX wallet is : *'`" + wallet + "`'\n\n💎 It will be used for all future withdrawals.",
      {
        parse_mode: "markdown",
        reply_markup: { inline_keyboard: key }
      }
    )
  })
bot.action("/set", async (ctx) => {
  try {
    await ctx.deleteMessage();
    await ctx.reply("✏️* Enter Your " + await curr() + " address to use it in future withdrawals.*\n\n⚠️ _This wallet Will be used for withdrawals !!_",
      {
        parse_mode: "Markdown",

      })
    ctx.scene.enter("getWallet");
  } catch (err) {
    sendInlineError(err, ctx, db);
  }
})
bot.hears("🚀 Others..", async (ctx) => {
  try {
    ctx.replyWithMarkdown("_💡 Lets Explore Hidden Features 💡_", {
      reply_markup: {
        keyboard: [["🔃 Trx Wallet"], ["🛰 Liquidity", "🆘 Support", "🌟 History"], ["🍕 Back"]]
        , resize_keyboard: true
      }
    })
  } catch (err) {
    sendError(err, ctx)
  }
})
bot.hears("💢 Calculator", async (ctx) => {
  try {
    ctx.reply(`<b>Profit Calculator</b>
<i>This is a tool which enable to calculate the actual interests earned on your investments.</i>

<b>Send the amount of TRX you wish to deposit to see the expected returns.</b>`, {
      parse_mode: "html"
    })
    ctx.scene.enter("calculator")
  } catch (err) {
    sendError(err, ctx)
  }
})
bot.hears("🍕 Deposit", async (ctx) => {
  try {
    var depo = [[{ text: "TRX", callback_data: "/deposit" }]]
    ctx.reply(`➕ Add liquidity to pool and start yield farming
BurgerSwap Basic Daily
        🍕 Earn 120% returns daily
        🍕 5% returns paid out every hour
        🍕 Min. Investment: 1 TRX
        🍕 Max. Investment: 200 TRX

BurgerSwap Advance Daily
        🍕 Earn 250% returns daily
        🍕 6% returns paid out every hour
        🍕 Min. Investment: 200 TRX
        🍕 Max. Investment: 500 TRX

BurgerSwap Ultimate Daily
        🍕 Earn 250% returns daily
        🍕 8% returns paid out every hour
        🍕 Min. Investment: 500 TRX
        🍕 Max. Investment: Unlimited

🎇 You can earn up to 20% from your referrals, there is no limit to the amount you can earn from it.`, { reply_markup: { inline_keyboard: depo } })
  } catch (err) {
    sendError(err, ctx)
  }
})
bot.action("/deposit", async (ctx) => {
  await ctx.deleteMessage();
  var dep = [[{ text: "🛎 Done", callback_data: "/done" }]]
 ctx.reply('*🚦 Kindly Send  TRX To*.\n\n`'+env.address+'`\n\n_After Paying Click Button_👇👇\n\n*⚠ If you send less than 2.00 TRX, your deposit will be ignored!*',{parse_mode:"markdown",reply_markup:{ inline_keyboard : dep }})
     
})
bot.action("/done", async (ctx) => {
  try {
    ctx.deleteMessage();
    ctx.reply("🤗 Kindly Send The Transaction Hash")
    ctx.scene.enter("done")
  } catch (err) {
    sendError(err);
  }
})
bot.hears("g", async (ctx) => {
  try {
    const app = await db.collection("admin").findOne({ group: "global" });
    if (app.length === 0 || !app.dailybonus || app.dailybonus === "0") {
      return;
    }
    let joinCheck = await findUser(ctx);
    if (joinCheck) {
      var duration_in_hours;

      var tin = new Date().toISOString();
      let dData = await db.collection("bonusforUsers").find({ userId: ctx.from.id }).toArray();

      if (dData.length === 0) {
        db.collection("bonusforUsers").insertOne({ userId: ctx.from.id, bonus: new Date(), });
        duration_in_hours = 99;
      } else {
        duration_in_hours =
          (new Date() - new Date(dData[0].bonus)) / 1000 / 60 / 60;
      }
      if (duration_in_hours >= 24) {
        let bal = await db.collection("balance").find({ userId: ctx.from.id }).toArray();

        let dBon = app.dailybonus;
        let ran = dBon;
        let rann = ran * 1;
        var adm = bal[0].balance * 1;
        var addo = adm + rann;

        db.collection("balance").updateOne({ userId: ctx.from.id }, { $set: { balance: addo } }, { upsert: true });

        db.collection("bonusforUsers").updateOne({ userId: ctx.from.id }, { $set: { bonus: tin } }, { upsert: true });

        await ctx.replyWithMarkdown(
          "*🎁 Congratulations \n\n😊 You Received " + dBon + " " + await curr() + " in Daily Bonus*"
        )
        await sleep(2500);
      } else {
        var duration_in_hour = Math.abs(duration_in_hours - 24);
        var hours = Math.floor(duration_in_hour);
        var minutes = Math.floor((duration_in_hour - hours) * 60);
        var seconds = Math.floor(((duration_in_hour - hours) * 60 - minutes) * 60);
        await ctx.replyWithMarkdown(`*⚠️You Already Claimed Bonus In Last 
   
  Remain Time Left -  ${hours} Hour ${minutes} Minutes ${seconds} Seconds \n\n\n🧭 Check-In After 24 Hours*`)
      }
    } else { await mustJoin(ctx, db); }
  } catch (err) {
    sendError(err, ctx)
  }
});
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
bot.hears("🛰 Liquidity",
  async (ctx) => {
    try {
      const dep = await db.collection('withdrawals').find({ group: "total" }).toArray();
      const bs = await db.collection('reinvest').find({ group:"invest" }).toArray();
let x = ""

      for (var i = 0; i < bs.length; i++) {
      x += parseFloat(bs[i].amount)}
      let tData = await db.collection("allUsers").find({}).toArray();
      ctx.reply(`<b>Current Statistics</b>
This page shows the current status of the entire project, including how many users are there and the total amount deposited and withdrawn so far.

<b>Current Status:</b> ✅ Paying
<b>Withdrawal Status:</b> ✅ Automatic

<b>👥 Total Users</b>
${tData.length} users registered 

<b>📥 Total Investments (TRX)</b>
${x} TRX deposited 

<b>📤 Total Withdrawn (TRX)</b>
${dep[0].totalwithdraw} TRX withdrawn`, { parse_mode: "html", })
    } catch (err) {
      sendError(err, ctx)
    }
  })
bot.hears("📢 Referrals", async (ctx) => {
  try {
    if (ctx.message.chat.type != "private") {
      return;
    }
    let bData = await db.collection("vUsers").find({ userId: ctx.from.id }).toArray();
    if (bData.length === 0) {
      return;
    }
    let joinCheck = await findUser(ctx);
    if (joinCheck) {
      const pref = env.refer
      let allRefs = await db.collection("allUsers").find({ inviter: ctx.from.id }).toArray(); // all invited users
      await ctx.reply(
        `<b>🍕 PizzaSwap - Mining rewards for liquidity providers</b>
<i>PizzaSwap is an open-source automated market maker (AMM) running on the Tron (TRX). It is the first decentralized protocol on the chain boasting a democratic autonomy swap. PizzaSwap Telegram is connected directly to You via their OpenApi and Cross-chain Bridge to add liquidity directly to the pool</i>. 

<b>🔆 No minimum period, can be withdrawn anytime
♻️ Double your investments in 24 hours, up to 200%
💸 Earn up to 20% from your referrals, unlimited earnings


☢️ Status: 🔝 Paying
📆 Date Started: 22/9/2021

🍕 Pizza Plans:
✔️ 120% Daily For 1 Days
✔️ 150% Daily For 1 Days
✔️ 200% Daily For 1 Days (DOUBLE UP)

⬇️ Minimum Deposit: 2 TRX
⬆️ Minimum Withdraw: 10 TRX
✅ Instant Withdrawal
👩‍👩‍👧‍👧 Referral Bonus: 20%
🗣 Invite Bonus: 0.2

✅ Deposit Method: TRX
☑️ Payment Method: TRX

🍕 Join Now: https://t.me/${ctx.botInfo.username}?start=${ctx.from.id}
   </b> `, { parse_mode: "html", });
      ctx.reply(`<b>~~~~~~~~~~~~
You will receive referral bonus when you share your referral link or when your referral deposits.</b>

<u>Your Referral Link</u>
https://t.me/${ctx.botInfo.username}?start=${ctx.from.id}`, {
        parse_mode: "Html", reply_markup: { inline_keyboard: [[{ text: '📠 Detailed Report', callback_data: '/referreport' }]] }
      })
    } else { await mustJoin(ctx, db); }
  } catch (err) {
    sendError(err, ctx, db);
  }
});

bot.action('/referreport', async (ctx) => {
  try {
    const cap = await db.collection('allUsers').find({ inviter: ctx.from.id }).toArray();
    let x = "";
    for (var i = 0; i < cap.length; i++) {
      x += "\n" + Math.floor(i + 1) + ") <a href='tg://user?id=" + cap[i].userId + "'>" + cap[i].firstName + "</a>"
    }
    var msg = (cap.length === 0) ? `📑 Advanced Active Referrals Report
    
    <b> No any Referrals</b>` : `📑<b> Advanced Active Referrals Report</b>${x}
    `
    ctx.reply(msg, { parse_mode: 'html' });
  } catch (err) {
    sendInlineError(err, ctx)
  }
})
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭


//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭

bot.hears("💱 Re-invest", async (ctx) => {
  try {
    ctx.reply(`<b>➕ Add liquidity to pool and start yield farming
PizzaSwap Basic Daily
        🍕 Earn 120% returns daily
        🍕 5% returns paid out every hour
        🍕 Min. Investment: 1 TRX
        🍕 Max. Investment: 200 TRX

PizzaSwap Advance Daily
        🍕 Earn 150% returns daily
        🍕 6% returns paid out every hour
        🍕 Min. Investment: 200 TRX
        🍕 Max. Investment: 500 TRX

PizzaSwap Ultimate Daily
        🍕 Earn 200% returns daily
        🍕 8% returns paid out every hour
        🍕 Min. Investment: 500 TRX
        🍕 Max. Investment: Unlimited

🔥 You can earn up to 20% from your referrals, there is no limit to the amount you can earn from it.</b>`, { parse_mode: "html" })

    let bal = await db.collection("balance").find({ userId: ctx.from.id }).toArray();

    if (parseFloat(bal[0].balance) >= 1) {
      ctx.replyWithMarkdown("*✅ Send the amount you want to reinvest, between 1 and " + bal[0].balance + " TRX*\nChoose one of the following amounts, or send a *custom value*", { reply_markup: { keyboard: [["1", bal[0].balance.toString()],["🍕 Back"]], resize_keyboard: true } })
      ctx.scene.enter("reinvest");
      return
    }
    ctx.replyWithMarkdown("*❌ You can not reinvest right now: You need at least 1 TRX to reinvest!*", {
      reply_markup: {
        keyboard: [["⬅️ Return"]],
        resize_keyboard: true
      }
    })
  } catch (err) {
    sendError(err, ctx)
  }
})

bot.action(/^\Confirm/, async (ctx) => {
  try {
    const callbackData = ctx.callbackQuery.data
    const params = callbackData.split(' ')
    const invest = params[1]
    const [get, per] = profit(invest)
    ctx.deleteMessage()
    let bal = await db.collection("balance").find({ userId: ctx.from.id }).toArray();
                var g = await db.collection('withdrawals').find({group:"totald"}).toArray();
    var tadd = parseFloat(g + invest)
db.collection('withdrawals').updateOne({group: 'total'},{$set:{totald: tadd}},{upsert:true})
    var ded = parseFloat(bal[0].balance) - parseFloat(invest)
    db.collection('balance').updateOne({ userId: ctx.from.id }, { $set: { balance: ded } }, { upsert: true });
    let time;
    time = new Date();
    time = time.toLocaleString()
    db.collection('reinvest').insertOne({ group:"invest",userId: ctx.from.id, amount: invest, time: time })
bot.telegram.sendMessage(env.paych,`<b>INTERNAL TRANSACTION </b>
Tokens: <b>${invest} TRX</b>
Duration: <b>24 hours </b>
🏧 Status : <b>✅ Success</b>
🧭 Server Time :<b>${time} IST

PizzaSwap - @${ctx.botInfo.username}</b>`,{parse_mode:"html"})
setTimeout(()=>{ctx.replyWithMarkdown("*➕ Investment Accrual:* +"+get+" TRX")
    
      

  var gett = parseFloat(bal[0].balance) - parseFloat(get) ;
db.collection('balance').updateOne({ userId: ctx.from.id }, { $set: { balance: gett } }, { upsert: true });
               }, 24 * 60 * 60 * 1000);

    ctx.reply(`<b>✅ New Investment Started in Bot</b>

<b>📆 Total Investment Duration: 1 days, for a daily</b> ${per * 24}%

<b>🗒 Get paid on Every Day

⏱ Payment</b> ${per}.00% <b>every 1 hours

💴 Invested Amount:</b>${invest} TRX

<b>🧮 Expected Return:</b> ${get} TRX`, { parse_mode: "Html",reply_markup:{keyboard:[["🍕 Back"]],resize_keyboard:true}})
  } catch (err) {
    sendInlineError(err, ctx);
  }
})
bot.hears("h", async (ctx) => {
  try {
  } catch (err) {
    sendInlineError(err, ctx, db)
  }
})



//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
bot.hears('🌟 History', async (ctx) => {
  try {
    const bs = await db.collection('reinvest').find({ userId: ctx.from.id }).toArray();
    let x = "";
    for (var i = 0; i < bs.length; i++) {
      x += `\n<b>${Math.floor(i + 1)}) ${bs[i].amount} ${await curr()}</b>\n⏲️ ${bs[i].time}`
    }

    if (x == undefined) {

      var msg = "<b>💹 No Payments Found </b>"
      ctx.reply(msg, { parse_mode: 'html' });
    } else {
      var msg = '💹 <b>Last 20 Investments</b>\n' + x
      ctx.reply(msg, { parse_mode: 'html' });
    }
  } catch (err) {
    sendError(err, ctx)
  }
})

//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭

//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭



//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭

bot.action(/.*/, async (ctx) => {
  try {
    var msg = ctx.update.callback_query.data;
    if (/^\/checkMathAnswer/) {
      var correctAnswer = msg.split(" ")[1];
      var userAnswer = msg.split(" ")[2];
      if (userAnswer != correctAnswer) {
        await ctx.answerCbQuery("❗ Wrong Answer ❗", { show_alert: true });
        await ctx.deleteMessage();
        mathCaptcha(ctx);
        return;
      } else {
        await ctx.answerCbQuery("✅ Correct Answer ✅", { show_alert: true });
        await ctx.editMessageText("Please wait.");
        await ctx.editMessageText("Please wait..");
        await ctx.editMessageText("Please wait...");
        await ctx.editMessageText("Please wait....");
        await ctx.editMessageText("✅ *Success!* Wait a Moment.", {
          parse_mode: "markdown",
        });
        await ctx.editMessageText("✅ *Success!* Wait a Moment..", {
          parse_mode: "markdown",
        });
        await ctx.editMessageText("✅ *Success!* Wait a Moment...", {
          parse_mode: "markdown",
        });
        let vData = await db.collection("vUsers").find({ userId: ctx.from.id }).toArray();
        if (ctx.from.last_name) { valid = ctx.from.first_name + " " + ctx.from.last_name; }
        else { valid = ctx.from.first_name; }
        if (vData.length === 0) {
          await db.collection("vUsers").insertOne({ userId: ctx.from.id, name: valid, stage: 'new' });
        }
        await afterCaptcha(ctx);
      }
    } else {
      await ctx.answerCbQuery("⛔ Callback Command Not found!");
    }
  } catch (err) {
    sendInlineError(err, ctx, db);
  }
});
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
//▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
function rndFloat(min, max) {
  return Math.random() * (max - min + 1) + min;
}
function rndInt(min, max) {
  return Math.floor(rndFloat(min, max));
}
bot.hears(/.*/,botStart)
