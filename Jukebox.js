const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const token = 'YOUR_BOT_TOKEN';
const clientId = 'YOUR_CLIENT_ID';
const guildId = 'YOUR_GUILD_ID';

const commands = [
  {
    name: 'play',
    description: 'Play a song',
    options: [
      {
        name: 'song',
        type: 3,
        description: 'The YouTube URL or search query for the song',
        required: true,
      },
    ],
  },
];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'play') {
    const songQuery = options.getString('song');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply('You must be in a voice channel to use this command.');
    }

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: false,
      });

      const player = createAudioPlayer();
      const resource = createAudioResource(ytdl(songQuery, { filter: 'audioonly' }), {
        inputType: StreamType.Opus,
      });

      player.play(resource);
      connection.subscribe(player);

      interaction.reply(`Now playing: ${songQuery}`);
    } catch (error) {
      console.error(error);
    }
  }
});

client.login(token);
