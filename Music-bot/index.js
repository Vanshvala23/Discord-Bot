// index.js
const { Client, GatewayIntentBits, Collection, REST,Routes } = require('discord.js');
const { Manager } = require('erela.js');
const fs = require('fs');
const { TOKEN, CLIENT_ID, GUILD_ID } = require('./config.js');
const { EmbedBuilder } = require('@discordjs/builders');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.commands = new Collection();
const commands = [];

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.manager = new Manager({
    nodes: [
        {
            host: 'localhost',
            port: 2333,
            password: 'vansh',
        },
    ],
    send(id, payload) {
        const guild = client.guilds.cache.get(id);
        if (guild) {
            guild.shard.send(payload);
        }
    },
})
    .on('nodeConnect', (node) => {
        console.log(`Node ${node.options.identifier} connected`);
    })
    .on('nodeError', (node, error) => {
        console.log(`Node ${node.options.identifier} has an error: ${error.message}`);
    })
    .on('trackStart', (player, track) => {
        client.channels.cache
            .get(player.textChannel)
            .send(`Now Playing ${track.title}`);
    

    const textChannel = client.channels.cache.get(player.textChannel);
    console.log(textChannel);
    })
    .on('queueEnd', (player) => {
        client.channels.cache.get(player.textChannel).send('Queue has ended.');
        player.destroy();
    });

client.login(TOKEN);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.manager.init(client.user.id);
});

client.on('raw', (d) => {
    client.manager.updateVoiceState(d);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(client,interaction)
    } catch (error) {
        console.error(error);
        interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

