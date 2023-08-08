const {
	Client,
	GatewayIntentBits,
	REST,
	Routes,
	Collection,
	Events,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	EmbedBuilder
} = require("discord.js");
require("dotenv").config();
const path = require("path")
const fs = require("node:fs")
const client = new Client({intents: [GatewayIntentBits.Guilds]});
const TOKEN = process.env.TOKEN;
const rest = new REST({ version: '10' }).setToken(TOKEN);
client.commands = new Collection();
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const axios = require("axios")
const apiKey = process.env.APIKEY
const apiToken = process.env.APITOKEN
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	const scommand = require(`./commands/${file}`);
    commands.push(scommand.data.toJSON())
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		const data = await rest.put(
			Routes.applicationCommands("823592815636250675"),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand || 
	      interaction.isButton() ||
	      interaction.isModalSubmit()) return;
	await axios.get(apiKey + "/users?where[discordId][eq]=" + interaction.user.id, {
		headers: {
			"Authorization": "Bearer " + apiToken
		}
	}).then(async res => {
		if (res.data[0].banned && interaction.commandName !== "support") {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
					.setDescription(require("./templates.js").icon.n + " Адміністрація Molang відмовила вам в обслуговуванні.")
				], ephemeral: true
			})
		} else {
			//console.log(interaction)
			console.log(interaction.user.username + ": /" + interaction.commandName)
			interaction.options._hoistedOptions.forEach(o => {
			    console.log({ name: o.name, type: o.type, value: o.value})
			})
			if (!interaction.isCommand()) return;
			if (!interaction.isChatInputCommand()) return;
			const command = interaction.client.commands.get(interaction.commandName);
			
			if (!command) {
			    console.error(`No command matching ${interaction.commandName} was found.`);
			    return;
			}
			try {
			    await command.execute(interaction, client);
			} catch (error) {
			    console.error(error);
			    if (interaction.replied || interaction.deferred) {
			        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			    } else {
			        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			    }
			}
		}
	})
})

client.login(TOKEN)
