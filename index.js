const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder,ActivityType, VoiceChannel } = require('discord.js');
const { token, clientId } = require('./config');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once('ready',()=>
{
  console.log(`Logges in as ${client.user.tag}!`);
  client.user.setPresence(
    {
      activities:[
        {
          name:'Controlling the server.',
          type:ActivityType.Watching
        },
      ], status:'online',
    },
  )
});

const rest = new REST({ version: '9' }).setToken(token);

const commands = [
  {
    name: 'kick',
    description: 'Kicks a member from the server.',
    options: [
      {
        name: 'user',
        description: 'The user to be kicked.',
        type: 6,
        required: true,
      },
    ],
  },
  {
    name: 'hello',
    description: 'Says hello to you.',
  },
  {
    name: 'purge',
    description: 'Clear all messages in the channel',
    options: [
      {
        name: 'amount',
        description: 'The number of messages to delete (up to 100).',
        type: 4,
        required: true,
      },
    ],
  },
  {
    name:'announce',
    description:'Make an announce',
    type:1,
    required:true,
    options:[
      {
        name:'channel',
        description:'The channel where the announcement should be made.',
        type:7,
        required:true,
      },
      {
        name:'message',
        description:'The announcement message.',
        type:3,
        required:true,
      },
      {
        name: 'role',
        description: 'The role to mention in the announcement',
        type: 8,
        required: false,
      },
    ],
  },
];

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error refreshing application (/) commands:', error.message);
    if (error.response) {
      console.error('Discord API response:', error.response.data);
    }
  }
})();

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options, user,member } = interaction;

  try {
    if (commandName === 'kick') {
      const userOption = options.get('user');
      if (userOption && userOption.type === 6) {
        const kickedUser = userOption.user;
        await interaction.guild.members.kick(kickedUser);
        return interaction.reply(`Successfully kicked user: ${kickedUser.tag}`);
      } else {
        return interaction.reply({ content: 'Invalid or missing user option.', ephemeral: true });
      }
    } else if (commandName === 'hello') {
      const embed = new EmbedBuilder()
        .setTitle(`Hello, ${user.tag}!`)
        .setDescription('Nice to see you.')
        .setColor('#3498db')
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } else if (commandName === 'purge') {
      const amount = options.getInteger('amount');

      if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      }

      if (amount < 1 && amount > 100) {
        return interaction.reply({ content: 'Please provide a number between 1 and 100.', ephemeral: true });
      }

      await interaction.channel.bulkDelete(amount);
      return interaction.reply({ content: `Successfully deleted ${amount} messages.`, ephemeral: true });
    }

    else if(commandName === 'announce')
    {
      const message = options.getString('message');
      const channel = options.getChannel('channel');
      const role = options.getRole('role');

      let announcement = `**Announcement**\n${message}`;

      if (role) {
        announcement += `\nRole: <@&${role.id}>`;
      }

      await channel.send(announcement);
      await interaction.reply('Announcement sent!');
    }
  } catch (error) {
    console.error(error);
    return interaction.followUp({
      content: 'An error occurred while processing the command. Please check the logs for more details.',
      ephemeral: true,
    });
  }
});
client.login(token);
