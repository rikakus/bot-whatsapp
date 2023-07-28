const {
  Client,
  Location,
  List,
  Buttons,
  LocalAuth,
  MessageMedia,
} = require("whatsapp-web.js");
const axios = require("axios");
const qrcode = require("qrcode-terminal");

const schedule = require("node-schedule");

const apiKey = "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";

const googleApiKey = "AIzaSyDMZR955arBhnR7ed8yERFvGOAU6T_J7WQ";
const customSearchEngineId = "6428925d640044db8";

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);

async function generateResponse(prompt) {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 0.3,
      frequency_penalty: 0.5,
      presence_penalty: 0.0,
      // model: "gpt-3.5-turbo",
      // temperature: 0.8,
      // max_tokens: 1024,
      // top_p: 1,
      // frequency_penalty: 0,
      // presence_penalty: 0,
    });

    console.log(response.data.choices);

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("Error:", error.message);
    throw new Error("Failed to generate response");
  }
}

function kirimPesan(nomorTujuan, pesan) {
  client.sendMessage(nomorTujuan, pesan);
  console.log("Pesan WhatsApp terkirim!");
}

const client = new Client({
  // authStrategy: new LocalAuth(),
  // proxyAuthentication: { username: 'username', password: 'password' },
  puppeteer: {
    args: [
      "--proxy-server=proxy-server-that-requires-authentication.example.com",
    ],
    headless: false,
  },
});

client.initialize();

client.on("loading_screen", (percent, message) => {
  console.log("LOADING SCREEN", percent, message);
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true }, (qrCode) => {
    console.log(qrCode);
  });
  console.log("QR RECEIVED", qr);
});

client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
  console.error("AUTHENTICATION FAILURE", msg);
});

function taskAt7AM() {
  console.log("Scheduled task at 7 AM!");
  client.sendMessage("6281268490252@c.us", "Selamat Pagi, Edo");

  client.sendMessage("6281232254875@c.us", "Selamat Pagi");
}

function taskAt12AM() {
  console.log("Scheduled task at 12 AM (midnight)!");
  client.sendMessage("6281232254875@c.us", "Selamat Siang");
}

function taskAt5PM() {
  console.log("Scheduled task at 5 PM!");
  client.sendMessage("6281232254875@c.us", "Selamat Sore");
}

const rule7AM = new schedule.RecurrenceRule();
rule7AM.hour = 7;
rule7AM.minute = 0;

const rule12AM = new schedule.RecurrenceRule();
rule12AM.hour = 12;
rule12AM.minute = 0;

const rule5PM = new schedule.RecurrenceRule();
rule5PM.hour = 17;
rule5PM.minute = 0;

const rule = new schedule.RecurrenceRule();
rule.hour = 1;

function taskToRun() {
  console.log("Scheduled task is running!");
  client.sendMessage("6281232254875@c.us", "P");
}

const rule1 = new schedule.RecurrenceRule();
rule1.second = new schedule.Range(0, 59, 10); // Run the task every 10 seconds (0, 10, 20, 30, 40, 50 seconds).

function taskToRun() {
  console.log("Scheduled task is running!");
  client.sendMessage("6281232254875@c.us", "P");
}

function tasknew() {
  console.log("Scheduled task is running!");
  client.sendMessage("6281268490252@c.us", "P");
}

client.on("ready", () => {
  console.log("READY");
  // schedule.scheduleJob(rule, taskToRun);
  // // schedule.scheduleJob(rule1, tasknew);

  schedule.scheduleJob(rule7AM, taskAt7AM);
  schedule.scheduleJob(rule12AM, taskAt12AM);
  schedule.scheduleJob(rule5PM, taskAt5PM);
});

client.on("message", async (msg) => {
  if (msg.body.startsWith("!listMember")) {
    let list = "";
    let groupId = msg.body.slice(12).trim();
    groupId = groupId.includes("@g.us") ? groupId : `${groupId}@g.us`;
    const groupChat = await client.getChatById(groupId);

    await groupChat.groupMetadata.participants.map(async (member, i) => {
      list += await `\n${member.id.user}|${member.id._serialized}`;
      return;
    });
    msg.reply(list);
  } else if (msg.body === "!listGroup") {
    let list = "";
    client
      .getChats()
      .then(async (chats) => {
        // Cetak ID grup
        console.log(chats.length);
        await chats.map(async (chat, i) => {
          if (chat.isGroup) {
            list += await `\n${chat.name}|${chat.id._serialized}`;
            console.log(chats.length === i);
          }
          if (chats.length === i) {
            msg.reply(list);
          }
        });
      })
      .catch((error) => {
        console.error("Gagal mendapatkan daftar obrolan:", error);
      });
  } else if (msg.body.startsWith("!sendGroup")) {
    if (msg.body.includes("@ddd")) {
      let phoneNumber = msg.body.split(" ").find((e) => {
        if (e.includes("@d")) {
          e.slice(0, 1);
          return e;
        }
      });
      const contact = client.getContactById(phoneNumber);
      const contactUserId = contact.jid._serialized;
      let messages = "";
      msg.body.split(" ").forEach((e) => {
        if (e.includes("@")) {
          return (messages += `@${contactUserId}`);
        }
        return (messages += e);
      });
    } else {
      let number = msg.body.split(" ")[1];
      let messageIndex = msg.body.indexOf(number) + number.length;
      let message = msg.body.slice(messageIndex, msg.body.length);
      number = number.includes("@g.us") ? number : `${number}@g.us`;
      client.sendMessage(number, message);
    }
  } else if (msg.body.startsWith("!jadwal")) {
    const komand = msg.body.split("|");
    let number = komand[1].includes("@c.us") ? komand[1] : `${komand[1]}@c.us`;

    const detik =
      Math.floor(new Date(komand[3]).getTime()) -
      Math.floor(new Date().getTime());

    setTimeout(() => {
      kirimPesan(number, komand[2]);
    }, detik);
    console.log("sukses");
  } else if (msg.body === "!command") {
    client.sendMessage(
      msg.from,
      "Maaf, terjadi kesalahan saat memproses permintaan Anda."
    );
  } else if (msg.body === "!ping reply") {
    // Send a new message as a reply to the current one
    msg.reply("pong");
  } else if (msg.body.toLowerCase() === "!sticker") {
    if (msg.hasMedia) {
      const attachmentData = await msg.downloadMedia();

      // Mengirim stiker sebagai pesan balasan
      msg.reply(attachmentData, msg.from, { sendMediaAsSticker: true });
    } else {
      // Jika pesan tidak memiliki media
      msg.reply("Kirimkan gambar sebagai media untuk membuat stiker!");
    }
  } else if (msg.body.startsWith("!ask")) {
    const question = msg.body.slice(5).trim();

    generateResponse(question)
      .then((response) => {
        msg.reply(response, msg.from);
      })
      .catch((error) => {
        msg.reply(
          "Maaf, terjadi kesalahan saat memproses permintaan Anda.",
          msg.from
        );

        console.error("Error:", error.message);
      });
  } else if (msg.body.startsWith("!seach")) {
    // Mengambil pertanyaan dari pesan
    const question = msg.body.slice(5).trim();
    console.log(question);
    try {
      // Membuat permintaan ke Google Custom Search API
      const response = await axios.get(
        "https://www.googleapis.com/customsearch/v1",
        {
          params: {
            key: googleApiKey,
            cx: customSearchEngineId,
            q: question,
          },
        }
      );
      console.log(response);

      // Mengambil jawaban pertama dari hasil pencarian
      const answer = response.data.items[0].snippet;

      // Mengirim jawaban sebagai pesan balasan
      client.sendMessage(msg.from, answer);
    } catch (error) {
      console.error("Error:", error.message);
      // Mengirim pesan error sebagai pesan balasan
      client.sendMessage(
        msg.from,
        "Maaf, terjadi kesalahan saat memproses permintaan Anda."
      );
    }
  } else if (msg.body === "!ping") {
    // Send a new message to the same chat
    client.sendMessage(msg.from, "pong");
  } else if (msg.body.startsWith("!SendTo ")) {
    // Direct send a new message to specific id
    let number = msg.body.split(" ")[1];
    let messageIndex = msg.body.indexOf(number) + number.length;
    let message = msg.body.slice(messageIndex, msg.body.length);
    number = number.includes("@c.us") ? number : `${number}@c.us`;
    let chat = await msg.getChat();
    chat.sendSeen();
    client.sendMessage(number, message);
  } else if (msg.body.startsWith("!subject ")) {
    // Change the group subject
    let chat = await msg.getChat();
    if (chat.isGroup) {
      let newSubject = msg.body.slice(9);
      chat.setSubject(newSubject);
    } else {
      msg.reply("This command can only be used in a group!");
    }
  } else if (msg.body.startsWith("!echo ")) {
    // Replies with the same message
    msg.reply(msg.body.slice(6));
  } else if (msg.body.startsWith("!desc ")) {
    // Change the group description
    let chat = await msg.getChat();
    if (chat.isGroup) {
      let newDescription = msg.body.slice(6);
      chat.setDescription(newDescription);
    } else {
      msg.reply("This command can only be used in a group!");
    }
  } else if (msg.body === "!leave") {
    // Leave the group
    let chat = await msg.getChat();
    if (chat.isGroup) {
      chat.leave();
    } else {
      msg.reply("This command can only be used in a group!");
    }
  } else if (msg.body.startsWith("!join ")) {
    const inviteCode = msg.body.split(" ")[1];
    try {
      await client.acceptInvite(inviteCode);
      msg.reply("Joined the group!");
    } catch (e) {
      msg.reply("That invite code seems to be invalid.");
    }
  } else if (msg.body === "!groupinfo") {
    let chat = await msg.getChat();
    if (chat.isGroup) {
      msg.reply(`
                *Group Details*
                Name: ${chat.name}
                Description: ${chat.description}
                Created At: ${chat.createdAt.toString()}
                Created By: ${chat.owner.user}
                Participant count: ${chat.participants.length}
            `);
    } else {
      msg.reply("This command can only be used in a group!");
    }
  } else if (msg.body === "!chats") {
    const chats = await client.getChats();
    client.sendMessage(msg.from, `The bot has ${chats.length} chats open.`);
  } else if (msg.body === "!info") {
    let info = client.info;
    client.sendMessage(
      msg.from,
      `
            *Connection info*
            User name: ${info.pushname}
            My number: ${info.wid.user}
            Platform: ${info.platform}
        `
    );
  } else if (msg.body === "!mediainfo" && msg.hasMedia) {
    const attachmentData = await msg.downloadMedia();
    msg.reply(`
            *Media info*
            MimeType: ${attachmentData.mimetype}
            Filename: ${attachmentData.filename}
            Data (length): ${attachmentData.data.length}
        `);
  } else if (msg.body === "!quoteinfo" && msg.hasQuotedMsg) {
    const quotedMsg = await msg.getQuotedMessage();

    quotedMsg.reply(`
            ID: ${quotedMsg.id._serialized}
            Type: ${quotedMsg.type}
            Author: ${quotedMsg.author || quotedMsg.from}
            Timestamp: ${quotedMsg.timestamp}
            Has Media? ${quotedMsg.hasMedia}
        `);
  } else if (msg.body === "!resendmedia" && msg.hasQuotedMsg) {
    const quotedMsg = await msg.getQuotedMessage();
    if (quotedMsg.hasMedia) {
      const attachmentData = await quotedMsg.downloadMedia();
      client.sendMessage(msg.from, attachmentData, {
        caption: "Here's your requested media.",
      });
    }
  } else if (msg.body === "!location") {
    msg.reply(
      new Location(37.422, -122.084, "Googleplex\nGoogle Headquarters")
    );
  } else if (msg.location) {
    msg.reply(msg.location);
  } else if (msg.body.startsWith("!status ")) {
    const newStatus = msg.body.split(" ")[1];
    await client.setStatus(newStatus);
    msg.reply(`Status was updated to *${newStatus}*`);
  } else if (msg.body === "!mention") {
    const contact = await msg.getContact();
    const chat = await msg.getChat();
    chat.sendMessage(`Hi @${contact.number}!`, {
      mentions: [contact],
    });
  } else if (msg.body === "!delete") {
    if (msg.hasQuotedMsg) {
      const quotedMsg = await msg.getQuotedMessage();
      if (quotedMsg.fromMe) {
        quotedMsg.delete(true);
      } else {
        msg.reply("I can only delete my own messages");
      }
    }
  } else if (msg.body === "!pin") {
    const chat = await msg.getChat();
    await chat.pin();
  } else if (msg.body === "!archive") {
    const chat = await msg.getChat();
    await chat.archive();
  } else if (msg.body === "!mute") {
    const chat = await msg.getChat();
    // mute the chat for 20 seconds
    const unmuteDate = new Date();
    unmuteDate.setSeconds(unmuteDate.getSeconds() + 20);
    await chat.mute(unmuteDate);
  } else if (msg.body === "!typing") {
    const chat = await msg.getChat();
    // simulates typing in the chat
    chat.sendStateTyping();
  } else if (msg.body === "!recording") {
    const chat = await msg.getChat();
    // simulates recording audio in the chat
    chat.sendStateRecording();
  } else if (msg.body === "!clearstate") {
    const chat = await msg.getChat();
    // stops typing or recording in the chat
    chat.clearState();
  } else if (msg.body === "!jumpto") {
    if (msg.hasQuotedMsg) {
      const quotedMsg = await msg.getQuotedMessage();
      client.interface.openChatWindowAt(quotedMsg.id._serialized);
    }
  } else if (msg.body === "!buttons") {
    let button = new Buttons(
      "Button body",
      [{ body: "bt1" }, { body: "bt2" }, { body: "bt3" }],
      "title",
      "footer"
    );
    client.sendMessage(msg.from, button);
  } else if (msg.body === "!list") {
    let sections = [
      {
        title: "sectionTitle",
        rows: [
          { title: "ListItem1", description: "desc" },
          { title: "ListItem2" },
        ],
      },
    ];
    let list = new List("List body", "btnText", sections, "Title", "footer");
    client.sendMessage(msg.from, list);
  } else if (msg.body === "!reaction") {
    msg.react("👍");
  } else if (msg.body === "!edit") {
    if (msg.hasQuotedMsg) {
      const quotedMsg = await msg.getQuotedMessage();
      if (quotedMsg.fromMe) {
        quotedMsg.edit(msg.body.replace("!edit", ""));
      } else {
        msg.reply("I can only edit my own messages");
      }
    }
  } else if (msg.from == "628986101315@c.us") {
    const question = msg.body.slice(5).trim();

    generateResponse(question)
      .then((response) => {
        msg.reply(response, msg.from);
      })
      .catch((error) => {
        msg.reply(
          "Maaf, terjadi kesalahan saat memproses permintaan Anda.",
          msg.from
        );

        console.error("Error:", error.message);
      });
  }
});

client.on("message_create", (msg) => {
  // Fired on all message creations, including your own
  if (msg.fromMe) {
    // do stuff here
  }
});

client.on("message_revoke_everyone", async (after, before) => {
  // Fired whenever a message is deleted by anyone (including you)
  console.log(after); // message after it was deleted.
  if (before) {
    console.log(before); // message before it was deleted.
  }
});

client.on("message_revoke_me", async (msg) => {
  // Fired whenever a message is only deleted in your own view.
  console.log(msg.body); // message before it was deleted.
});

client.on("message_ack", (msg, ack) => {
  /*
        == ACK VALUES ==
        ACK_ERROR: -1
        ACK_PENDING: 0
        ACK_SERVER: 1
        ACK_DEVICE: 2
        ACK_READ: 3
        ACK_PLAYED: 4
    */

  if (ack == 3) {
    // The message was read
  }
});

client.on("group_join", (notification) => {
  // User has joined or been added to the group.
  console.log("join", notification);
  notification.reply("User joined.");
});

client.on("group_leave", (notification) => {
  // User has left or been kicked from the group.
  console.log("leave", notification);
  notification.reply("User left.");
});

client.on("group_update", (notification) => {
  // Group picture, subject or description has been updated.
  console.log("update", notification);
});

client.on("change_state", (state) => {
  console.log("CHANGE STATE", state);
});

// Change to false if you don't want to reject incoming calls
let rejectCalls = true;

client.on("call", async (call) => {
  console.log("Call received, rejecting. GOTO Line 261 to disable", call);
  if (rejectCalls) await call.reject();
  await client.sendMessage(
    call.from,
    `[${call.fromMe ? "Outgoing" : "Incoming"}] Phone call from ${
      call.from
    }, type ${call.isGroup ? "group" : ""} ${
      call.isVideo ? "video" : "audio"
    } call. ${
      rejectCalls ? "This call was automatically rejected by the script." : ""
    }`
  );
});

client.on("disconnected", (reason) => {
  console.log("Client was logged out", reason);
});
