async function mathCaptcha(ctx) {
 function defineRow(ind) {
    if (ind <= 1/*2*/) {
      return 0
    }
    if (ind >= 1/*2*/ && ind <= 3/*5*/) {
      return 1
    }
    if (ind >= 3/*6*/ && ind <= 5/*8*/) {
      return 2
    }
  }

  function shuffleMathCaptcha(arra1) {
    var ctr = arra1.length,
      temp,
      index
    while (ctr > 0) {
      index = Math.floor(Math.random() * ctr)
      ctr--
      temp = arra1[ctr]
      arra1[ctr] = arra1[index]
      arra1[index] = temp
    }
    return arra1
  }
  function getRndInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }
  function generateMathCaptcha() {
    let result = ""
    let m1 = getRndInt(9, 61)
    let m2 = getRndInt(11, 60)
    result += Math.floor(m1 + m2)
    return result
  }
  let q1 = getRndInt(10, 65) //Math.floor(Math.random() * 50);
  let q2 = getRndInt(12, 66) //Math.floor(Math.random() * 50);
  let ans = q1 + q2
  const captchaText = ans
  const arrayOfCap = [
    generateMathCaptcha(),
    generateMathCaptcha(),
    generateMathCaptcha(),
    generateMathCaptcha(),
    generateMathCaptcha(),
    captchaText
  ]
  const arrayOfRes = shuffleMathCaptcha(arrayOfCap)
  const inlKeyboard = [[], [], []]
  
  for (var index in arrayOfRes) {
    inlKeyboard[defineRow(index)].push({
      'text': arrayOfRes[index],
      'callback_data': "/checkMathAnswer " + captchaText + " " + arrayOfRes[index]
    })
  }

  await ctx.reply(
    "➡️ *Hey there, before you start the bot, please choose a correct answer for the question below.*\n_Please Answer:_ " +
      q1 +
      " + " +
      q2 +
      " =\n",
    {
      parse_mode:'markdown',
      reply_markup: { inline_keyboard: inlKeyboard }
    }
  )
  }

module.exports = { mathCaptcha };
