// play.js
const { SlashCommandBuilder, EmbedBuilder} = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song.')
        .addStringOption(option => option.setName('song_name').setDescription('Type your song.').setRequired(true)),
    async execute(client, interaction) {
        const songName = interaction.options.getString('song_name');

        // Check if the user is in a voice channel
        if (!interaction.member.voice.channel) {
            return interaction.reply({ content: 'You should be in a voice channel to use this command.', ephemeral: true });
        }

        // Get or create the player for the guild
        const player = client.manager.players.get(interaction.guild.id) || client.manager.create({
            guild: interaction.guild.id,
            voiceChannel: interaction.member.voice.channel.id,
            textChannel: interaction.channel.id,
        });

        // Search for the song
        const result = await client.manager.search(songName, interaction.user);
        if (!result.tracks.length) {
            return interaction.reply({ content: 'No tracks found.', ephemeral: true });
        }

        // Add the track to the queue
        player.queue.add(result.tracks[0]);

        // Connect to the voice channel if not already connected
        if (!player.playing && !player.paused && !player.queue.size) {
            player.connect();
        }

        // Start playing if not already playing
        if (!player.playing) {
            player.play();
        }

        const embed = new EmbedBuilder()
        .setColor(0X0099ff)
        .setTitle(`Now Playing: ${result.tracks[0].title}`)
        .setURL(result.tracks[0].uri)
        .setDescription(`Requested by: @${interaction.user.tag}`)
        .setImage(result.tracks[0].thumbnail)
        .setFooter({
            text: 'Your bot name',
            iconURL: result.tracks[0].thumbnail, // Use the thumbnail of the currently playing song
        });

    return interaction.reply({ embeds: [embed] });

    },
};
