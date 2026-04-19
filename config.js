global.bot = {
  name: "Yuki Archive",
  owner: "RullzFuqi",
  number: "",
  version: "3.0.0",
  prefix: /^[.!/]/,
  timezone: "Asia/Jakarta",
  newsletterJid: "120363393144098629@newsletter",
  ownerNumbers: [""],

  api: {
    termai: "Bell409",
  },

  media: {
    banner: "https://cdn.deltaku.web.id/img/yuki-banner_7804948e.jpg",
    banner2: "https://cdn.deltaku.web.id/img/e59c1f17-360e-4f6f-b064-e9f0c991adbd_50fbd0d2.jpeg",
    icon: "https://cdn.deltaku.web.id/img/yuki-icon_9824c3c3.jpg",
    icon2: "https://cdn.deltaku.web.id/img/yuki-icon2_d31e792d.jpg",
  },

  social: {
    github: "https://github.com/RullzFuqi",
    group: "https://chat.whatsapp.com/HBsaNWf8BjnHyF0qn3zC65",
  },

  sticker: {
    packname: "Yuki Archive",
    author: "RullzFuqi",
  },

  limit: {
    default: 25,
  },

  features: {
    menuInteractive: false,
    selfMode: false,
    antiCall: false,
    statusReact: false,
    cmdSuggest: true,
  },

  isOwner(jid) {
    return this.ownerNumbers.some(
      (n) => n.replace(/\D/g, "") + "@s.whatsapp.net" === jid,
    );
  },
};
