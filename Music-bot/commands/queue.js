// commands/queue.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the current song queue'),
    async execute(client, interaction) {
        const player = client.manager.players.get(interaction.guild.id);

        if (!player || !player.queue || player.queue.length === 0) {
            return interaction.reply('The queue is empty.');
        }

        const queueEmbed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('Current Queue')
            .setFields(`Now Playing`, `[${player.queue[0].title}](${player.queue[0].uri})`);

        if (player.queue.length > 1) {
            const queueList = player.queue.slice(1).map((track, index) => `${index + 1}. [${track.title}](${track.uri})`);
            queueEmbed.addField('Upcoming', queueList.join('\n'));
        }

        interaction.reply({ embeds: [queueEmbed] });
    },
};
//.addField('Now Playing', `[${player.queue[0].title}](${player.queue[0].uri})`);