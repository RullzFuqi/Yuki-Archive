import "#events/config";

export const contactQuoted = (ctx) => {
  return {
    key: {
      participant: "0@s.whatsapp.net",
      ...(ctx.senderId ? { remoteJid: "status@broadcast" } : {}),
    },
    message: {
      contactMessage: {
        image: global.menu,
        displayName: "─" + global.bot.name,
        vcard: `BEGIN:VCARD
VERSION:3.0
N:XL;ttname,;;;
FN:ttname
item1.TEL;waid=6283892787563:+62 8389 2787 563
item1.X-ABLabel:Ponsel
END:VCARD`,
        sendEphemeral: true,
      },
    },
  };
};

export const locationQuoted = (ctx) => {
  return {
    key: {
      participant: "0@s.whatsapp.net",
      ...(ctx.chatId ? { remoteJid: "status@broadcast" } : {}),
    },
    message: {
      locationMessage: {
        name: `Hai ${ctx.senderName}`,
        jpegThumbnail: "",
      },
    },
  };
};

export const simpleQuoted = (ctx) => {
  return {
    key: {
      participant: "0@s.whatsapp.net",
      ...(ctx.chatId ? { remoteJid: "status@broadcast" } : {}),
    },
    message: {
      conversation: global.bot.name
    },
  };
};
