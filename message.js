const { PREFIX } = require("./info");
const ytdl = require("discord-ytdl-core");

async function onMessage(message) {
    try {
        if (!message.content.startsWith(PREFIX) || message.author.bot) return;

        console.log(`Received message from ${message.author.username} saying: ${message.content}`);

        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === "play") {
            // play url
            const voiceChannel = message.member.voice.channel;
            if (!voiceChannel) {
                await message.channel.send("You must be in a voice channel");
                return;
            }

            const url = args[0];
            const stream = ytdl(url);

            const connection = await voiceChannel.join();

            connection
                .play(stream, { type: "opus" })
                .on("error", (error) => console.log(error))
                .on("close", () => {
                    stream.destroy();
                    connection.disconnect();
                });
        } else if (command === "stop") {
            // stop
            const voiceChannel = message.member.voice.channel;
            if (!voiceChannel) {
                await message.channel.send("You must be in a voice channel");
                return;
            }

            const connection = await voiceChannel.join();
            connection.disconnect();
        } else {
            await message.channel.send("Unknown command, try _play or _stop");
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    onMessage,
};
