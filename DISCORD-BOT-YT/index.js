const {
  Client,
  GatewayIntentBits,
  InteractionCallback,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith("create")) {
    const url = message.content.split("create")[1];
    return message.reply({
      content: "Generting Short ID for" + url,
    });
  }
  message.reply({
    content: "Hi From Bot",
  });
});

client.on("interactionCreate", (Interaction) => {
  console.log(Interaction);
  Interaction.reply("Pong!!");
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error("DISCORD_TOKEN environment variable is required");
}

client.login(token);
