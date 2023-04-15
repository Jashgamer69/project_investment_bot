const { Telegraf, Composer, session, Markup, Scenes} = require('telegraf');
const env = require('../env');
const bot = new Telegraf(env.bot_token)
const { adminId, sendInlineError } = require('../functions/misc.js')
const { db } = require('../functions/mongoClient') 

const compChnl = new Composer();

function emjNo (i){
  let bttn;
  if(i == 0){bttn = '1⃣'}
  if(i == 1){bttn = '2⃣'}
  if(i == 2){bttn = '3⃣'}
  if(i == 3){bttn = '4⃣'}
  if(i == 4){bttn = '5⃣'}
  if(i == 5){bttn = '6⃣'}
  if(i == 6){bttn = '7⃣'}
  if(i == 7){bttn = '8⃣'}
  if(i == 8){bttn = '9⃣'}
  if(i == 9){bttn = '🔟'}
  if(i == 10){bttn = '1⃣1⃣'}
  if(i == 11){bttn = '1⃣2⃣'}
  if(i == 12){bttn = '1⃣3⃣'}
  if(i == 13){bttn = '1⃣4⃣'}
  if(i == 14){bttn = '1⃣5⃣'}
  if(i == 15){bttn = '1⃣6⃣'}
  if(i == 16){bttn = '1⃣7⃣'}
  if(i == 17){bttn = '1⃣8⃣'}
  if(i == 18){bttn = '1⃣9⃣'}
  if(i == 19){bttn = '2⃣0⃣'}
  return bttn
}

async function manage_Ch (ctx, dab) {
try{

} catch(err){
  sendInlineError(err, ctx, db)
}
}

compChnl.action('/addchannel', async (ctx)=>{
try{
  let cyx = ctx.update.callback_query
  if (cyx.message.chat.type != "private") {
    return
  }
  await ctx.answerCbQuery()
  let admin;
  admin = await adminId();
   
  if(cyx.from.id != admin){return}
  const chh = await db.collection('channels').find({}).toArray() 
  if (chh.length===0) {
  } else if (chh.length <= env.maxchnl){
  } else if (chh.length > env.maxchnl){
    await ctx.answerCallbackQuery("📵 You cannot Add More than "+env.maxchnl+" Channels!\nℹ You can edit this Limit in /src/env.js file",{ show_alert: true })
    return
  }
  ctx.scene.enter('addNewChannel')
} catch (err) {
  sendInlineError(err, ctx, db)
}
})

compChnl.action('/paychannel', async (ctx)=>{
try{
  let cyx = ctx.update.callback_query
  if (cyx.message.chat.type != "private") {
    return
  }
  let admin;
  admin = await adminId();
  if(cyx.from.id != admin){return}
  const c = await db.collection("admin").find({ group: 'global' }).toArray();
  var pc = (c.length===0 || !(c[0].paymentchannel)) ? 'Not Set' : '@'+c[0].paymentchannel
  
  await ctx.answerCbQuery(`📣 Current Payment Channel:\n${pc}`,{show_alert: true})
  ctx.scene.enter('addPChannel')
} catch (err) {
  sendInlineError(err, ctx, db)
}
})
  
compChnl.action('/manage_channels', async (ctx) => {
try{
  let cyx = ctx.update.callback_query
  if (cyx.message.chat.type != "private") {
    return
  }
  await ctx.answerCbQuery()
  aadmi = await adminId();
   
  if(cyx.from.id != aadmi){return}

  const chh = await db.collection('channels').find({}).toArray() 
  let chnl = '';
  if(chh.length===0){
    chnl+= "\n<b>⛔️ No Channels Added</>"
    
    const c = await db.collection("admin").find({ group: 'global' }).toArray();
    var pc = (c.length===0 || !(c[0].paymentchannel)) ? 'Not Set' : c[0].paymentchannel

    await ctx.editMessageText(`<b>🏡 Currently Added Channels:</b> \n${chnl}\n\n🅿 <b>Payment Channel:</b> ${pc}`, {
      parse_mode: 'html',
      reply_markup: {inline_keyboard: [
        [{'text':"➕ Add Channel",'callback_data':"/addchannel"},{'text':"🅿 Payment Channel",'callback_data':"/paychannel"}],[{'text':"🔙 Panel",'callback_data':"/adminn"}]
      ]}
    })  .catch((err) => {
    if(err.message == '400: Bad Request: message is not modified: specified new message content and reply markup are exactly the same as a current content and reply markup of the message'){
      return
    }else{ sendInlineError(err, ctx, db) }
    });
    return
  }
  let noOfChnls = chh.length;
  let lastChnl = noOfChnls - 1;

  let keyR;
  const keyB = [[],[],[],[],[]]

  for (let i = 0; i <= lastChnl; i++) {
    //chIndex = chh[i]
    if(i <= 2){
      keyR = 0
    }else if(i <= 5){
      keyR = 1
    }else if(i >= 5){
      keyR = 2
    }
  
  const btttnn = emjNo(i)
  let hjs = ''
  if('joincheck' in chh[i]){
    if(chh[i].joincheck == 'fal'){
      hjs = '📴'
    }else if(chh[i].joincheck == 'tru'){
      hjs = '✅'
    }else{hjs = '⛔'}
  }
  keyB[keyR].push({
      'text': btttnn,
      'callback_data': "/managech "+chh[i].channel
    })
    chnl+= "\n"+btttnn+" • @"+chh[i].channel+" » "+hjs
  }
  const key1 = keyR + 1
  const key2 = keyR + 2
  const key3 = keyR + 3

  keyB[key1].push({'text':"➕ Add Channel",'callback_data':"/addchannel"})
  keyB[key1].push({'text':"➖ Remove Channel", 'callback_data':"/removechannel"})
  keyB[key2].push({'text':"🅿 Payment Channel", 'callback_data':"/paychannel"})
  keyB[key3].push({'text':"🔙 Panel", 'callback_data':"/adminn"})
  const c = await db.collection("admin").find({ group: 'global' }).toArray();
  if(c.length===0 || !(c[0].paymentchannel)){
    var pc = ''
    var rc = ``
  }else{
    var pc = `\n🅿 <b>Payment Channel</b> ${c[0].paymentchannel}\n`
    let chos = chnl.toLowerCase()
    let ks = c[0].paymentchannel.toLowerCase()
    if(chos.includes('@'+ ks)){
      var rc = ``
    }else{
      var rc = `ℹ <i><u>Note:</u> If you want to Put Payment Channel in Start then You Should add again by Pressing Add Channel!</i>`
    }
  }
  const txt = "<b>🏡 Currently Added Channels: \n</b>"+chnl+"\n"+pc+"\nwhere: '✅' : <b>Enabled </b>for <i>Join Check</i>\n"+
                                                                "             '📴' : <b>Disabled</b> for <i>Join Check</i>\n             '⛔' : <i>Info Not Found</i>\n\n"+rc;
  await ctx.editMessageText(txt, {
    parse_mode: 'html',
    disable_web_page_preview: true,
    reply_markup: {inline_keyboard: keyB}
  })
  .catch((err) => {
    if(err.message == '400: Bad Request: message is not modified: specified new message content and reply markup are exactly the same as a current content and reply markup of the message'){
      return
    }else{ sendInlineError(err, ctx, db) }
  });
} catch (err) {
  sendInlineError(err, ctx, db)
}
})

compChnl.action('/removechannel', async (ctx) => {
  try {
    const chh = await db.collection("channels").find({}).toArray()
    await ctx.answerCbQuery()
  
  let cyx = ctx.update.callback_query
  if (cyx.message.chat.type != "private") {
    return
  }
  let aadmi = await adminId();
   
  if(cyx.from.id != aadmi){return}

    let chnl
    if (chh.length === 0) {
      await ctx.editMessageText("<b>👨‍💻 You Have Not Added Any Channel in the Bot</b>",{
          parse_mode: "html",
          reply_markup: {
            inline_keyboard: [
              [{text: "🔙 Manage Channels",callback_data: "/manage_channels"}]
            ]}
      })
      return
    }
    let noOfChnls = chh.length
    let lastChnl = noOfChnls - 1
    let txt = "⛔ <b>Choose a Channel from buttons to Remove it</>\n"
    let keyR
    const keyB = [[], [], [], [], []]

    for (let i = 0; i <= lastChnl; i++) {
      if(i <= 2){
        keyR = 0
      }else if(i <= 5){
        keyR = 1
      }else if(i >= 5){
        keyR = 2
      }
  
      const btttnn = emjNo(i)

      keyB[keyR].push({
        'text': btttnn,
        'callback_data': "/RemoveCh "+chh[i].channel
      })
      txt+= "\n<b>" + btttnn + " •</> <i>@" + chh[i].channel + "</i>"
    }
    const key1 = keyR + 1
    keyB[key1].push({
      text: "🔙 Manage Channels",
      callback_data: "/manage_channels"
    })
    await ctx.editMessageText(txt, {
      parse_mode: "html",
      reply_markup: { inline_keyboard: keyB }
    })
  .catch((err) => {
    if(err.message == '400: Bad Request: message is not modified: specified new message content and reply markup are exactly the same as a current content and reply markup of the message'){
      return
    }else{ sendInlineError(err, ctx, db) }
  })
  } catch (err) {
    sendInlineError(err, ctx, db)
  }
});

compChnl.action(/^\/RemoveCh/, async (ctx) => {
try{
  var msg = ctx.callbackQuery.data
  var ch = msg.split(" ")[1]
  await ctx.answerCbQuery()
  await ctx.editMessageText("⁉️ <b>Are You Sure, You want to Remove @"+ch+"?</b>\n<b>❗️ Alert: </b><i>This Action Can't be Undone!</i>",{
    parse_mode: 'html', 
    reply_markup:   {inline_keyboard: [
      [{'text':'🗑️ Remove The Channel', 'callback_data':'/removeTheChannel '+ch }],[{'text':'❌ Cancel Operation','callback_data':'/removechannel'}]
    ]}
  })
} catch(err){
  sendInlineError(err, ctx)
}
})
compChnl.action(/^\/removeTheChannel/, async (ctx) => {
try{
  let cyx = ctx.update.callback_query
  var msg = cyx.data
  var chnl = msg.split(" ")[1]
  if (cyx.message.chat.type != "private") {
    return
  }
  let aadmi = await adminId();
   
  if(cyx.from.id != aadmi){return}

  await db.collection('channels').deleteOne({ channel: chnl }, function(err, obj) {
    if (err) {sendInlineError(err, ctx, db)};
    console.log("Channel: @"+chnl+" has been Deleted");
  });
  var h = await db.collection('channels').find({}).toArray();
  if(h.length===0){ var btsn = [[{text:"🔙 Channel Settings", callback_data: "/manage_channels" }]]
  }else{
    var btsn =  [
      [{ text: "🔙 Remove Another Channel", callback_data: "/removechannel" }],
      [{ text: "🔙 Channel Settings", callback_data: "/manage_channels" }]
    ]
  }

  await ctx.answerCbQuery("📣 Channel @" + chnl + " has been Removed from Database!")
  await ctx.editMessageText("☑️ <b>Channel:</b> @" + chnl + " <i>has Been Successfully Deleted from Our Database</i>",{
      parse_mode: "html",
      reply_markup: {inline_keyboard: btsn}
  })
  .catch((err) => {
    if(err.message == '400: Bad Request: message is not modified: specified new message content and reply markup are exactly the same as a current content and reply markup of the message'){
      return
    }else{ sendInlineError(err, ctx, db) }
  })
} catch (err) {
  sendInlineError(err,ctx)
  console.log(err)
}
})

compChnl.action(/^\/managech/, async (ctx) => {
try{
  let cyx = ctx.update.callback_query
  var msg = cyx.data
  var ch = msg.split(" ")[1]
  if (cyx.message.chat.type != "private") {
    return
  }
  let aadmi = await adminId();
   
  if(cyx.from.id != aadmi){return}
  const chn = await db.collection('channels').find({channel: ch}).toArray();
  if(chn===0){ await ctx.answerCbQuery('⛔ Channel Not Found! It Could Be Deleted from Database on some Request!',{show_alert: true})
    return}
  let btns = [[{ text: "🔙 Channel Settings", callback_data: "/manage_channels" }]]
  if('joincheck' in chn[0]){
    if(chn[0].joincheck == 'fal'){
      var hts = 'Disabled 📴'
      btns = [[{ text: "✅ Enable Join Check", callback_data: "/chngUserCheck "+ch+" tru" },{text: "➖ Remove Channel", callback_data: "/RemoveCh "+ch }],
      [{ text: "🔙 Channel Settings", callback_data: "/manage_channels" }]]
    } if(chn[0].joincheck == 'tru'){
      var hts = 'Enabled ✅'
      btns = [[{ text: "📴 Disable Join Check", callback_data: "/chngUserCheck "+ch+" fal" },{text: "➖ Remove Channel", callback_data: "/RemoveCh "+ch }],
      [{ text: "🔙 Channel Settings", callback_data: "/manage_channels" }]]
    }
    const tgData = await bot.telegram.getChatMembersCount('@'+ch)
   
    await ctx.editMessageText(`<b>⛩ Channel Details:\n\n• Name:</b> <i>@${ch}</i> \n• <b>Status:</b> <i>${hts}</i>\n• <b>Subscribers:</b> ${tgData}`,{
      parse_mode: "html",
      reply_markup: {inline_keyboard: btns}
    })
    .catch((err) => {
      if(err.message == '400: Bad Request: message is not modified: specified new message content and reply markup are exactly the same as a current content and reply markup of the message'){
        return
      }else{ sendInlineError(err, ctx, db) }
    })
  }else{ 
    await db.collection("channels").updateOne({ channel: ch },{ $set: { joincheck: 'fal'} },{ upsert: true })
    await ctx.editMessageText(`<b>⛩ Channel Details:\n\n• Name:</b> <i>@${ch}</i> \n• <b>Status:</b> <i>${hts}</i>`,{
      parse_mode: "html",
      reply_markup: {inline_keyboard: [[{ text: "✅ Enable Join Check", callback_data: "/chngUserCheck "+ch+" tru" },{text: "➖ Remove Channel", callback_data: "/RemoveCh "+ch }],
      [{ text: "🔙 Channel Settings", callback_data: "/manage_channels" }]]}
    })
  }
  await ctx.answerCbQuery()
} catch (err){
  sendInlineError(err, ctx)
}
})


compChnl.action(/^\/chngUserCheck/, async (ctx) => {
try{
  
  let cyx = ctx.update.callback_query
  var msg = cyx.data
  var ch = msg.split(" ")[1]
  var st = msg.split(" ")[2]
  if (cyx.message.chat.type != "private") {
    return
  }
  let aadmi = await adminId();
   
  if(cyx.from.id != aadmi){return}

  let jb = 'false';
  let tgData = await bot.telegram.getChatMember('@'+ch, ctx.botInfo.id)
    .catch(async (err) => {
      if(err.message == '400: Bad Request: chat not found' || err.data == '400: Bad Request: chat not found'){
     
      }else if(err.message == '403: Forbidden: bot was kicked from the channel chat'){
        jb = 'true'
      }else{ sendInlineError(err, ctx, db) }
    })
  if(jb == 'true'){
    await ctx.answerCbQuery('⛔ Bot is Removed from the Channel!',{show_alert: true})
    await ctx.replyWithMarkdown('_⛔ Bot is Removed from Channel:_ [@'+ch+']\n🙋 *Please Add the Bot Again and promote to Admin in The Channel and then Try to Enable Join Check!!*')
    return 
  }
  if(st == 'tru'){
    if(!tgData){
      await ctx.answerCbQuery('⛔ Bot is Not Admin in Channel!',{show_alert: true})
      await ctx.replyWithMarkdown('_⛔ Bot is not Admin in Channel:_ [@'+ch+']\n🙋 *Promote the Bot in The Channel and then Try to Enable Join Check!!*')
      return
    }else if(tgData.status != 'administrator'){
      await ctx.answerCbQuery('⛔ Bot is Not Admin in Channel!',{show_alert: true})
      await ctx.replyWithMarkdown('_⛔ Bot is not Admin in Channel:_ [@'+ch+']\n🙋 *Promote the Bot in The Channel and then Try to Enable Join Check!!*')
      return
    }
  }

  if(st == 'fal'){
    await db.collection("channels").updateOne({ channel: ch },{ $set: { joincheck: 'fal'} },{ upsert: true })
  }else if(st == 'tru'){
    await db.collection("channels").updateOne({ channel: ch },{ $set: { joincheck: 'tru'} },{ upsert: true }) 
  }else{return}

  const chn = await db.collection('channels').find({channel: ch}).toArray();
  if(chn===0){ await ctx.answerCbQuery('⛔ Channel Not Found! It Could Be Deleted from Database on some Request!',{show_alert: true})
    return}
  if('joincheck' in chn[0]){
    if(chn[0].joincheck == 'fal'){
    var hts = 'Disabled 📴'
    btns = [[{ text: "✅ Enable Join Check", callback_data: "/chngUserCheck "+ch+" tru" },{text: "➖ Remove Channel", callback_data: "/RemoveCh "+ch }],
      [{ text: "🔙 Channel Settings", callback_data: "/manage_channels" }]]
    } if(chn[0].joincheck == 'tru'){
    var hts = 'Enabled ✅'
    btns = [[{ text: "📴 Disable Join Check", callback_data: "/chngUserCheck "+ch+" fal" },{text: "➖ Remove Channel", callback_data: "/RemoveCh "+ch }],
      [{ text: "🔙 Channel Settings", callback_data: "/manage_channels" }]]
    }
    await ctx.answerCbQuery('• Join Check for @'+ch+' has been now '+hts+'',{show_alert: true})
//await ctx.answerCbQuery()
    const tgData2 = await bot.telegram.getChatMembersCount('@'+ch)
   
    await ctx.editMessageText(`<b>⛩ Channel Details:\n\n• Name:</b> <i>@${ch}</i> \n• <b>Status:</b> <i>${hts}</i>\n• <b>Subscribers:</b> ${tgData2}`,{
      parse_mode: "html",
      reply_markup: {inline_keyboard: btns}
    })
    .catch((err) => {
      if(err.message == '400: Bad Request: message is not modified: specified new message content and reply markup are exactly the same as a current content and reply markup of the message'){
        return
      }else{ sendInlineError(err, ctx, db) }
    })
  }else{ await ctx.reply('Not Found')}
} catch (err){
  sendInlineError(err, ctx, db)
} 
})

module.exports = { compChnl }
