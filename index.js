const {
	Client,
	GatewayIntentBits,
	REST,
	Routes,
	Collection,
	Events,
	EmbedBuilder,
	Partials
} = require("discord.js");
require("dotenv").config();
const path = require("path")
const fs = require("node:fs")
const client = new Client({intents: [
	GatewayIntentBits.Guilds, 
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.DirectMessages
],
  partials: [
    Partials.Channel,
    Partials.Message
  ]});
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
	console.debug(file)
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

client.on(Events.MessageCreate, async message => {
	
	if (!message.author.bot) {
		console.log(message.author.tag + ": " + message.content)
		axios.get("https://moondust-starlight.dx-assets.pages.dev/levels.json")
		.then(() => {
			axios.get(apiKey + "/users?where[discordId][eq]=" + message.author.id, {
				headers: {
					"Authorization": "Bearer " + apiToken
				}
			}).then(res => {
				
				//var levels = lapi.data

				var user = res.data[0]
				user.chatLevelPoints += 1
				function checklvl(tempuser) {
					function levelset(level, tier) {
						tempuser.chatLevel = level
						tempuser.chatLevelTier = tier
					}
					
					const levels = [
						[1000, 6, 0],
						[700, 5, 4],
						[675, 5, 3],
						[650, 5, 2],
						[620, 5, 1],
						[600, 5, 0],
						[590, 4, 4],
						[575, 4, 3],
						[550, 4, 2],
						[520, 4, 1],
						[500, 4, 0],
						[490, 3, 4],
						[475, 3, 3],
						[450, 3, 2],
						[420, 3, 1],
						[400, 3, 0],
						[390, 2, 4],
						[375, 2, 3],
						[350, 2, 2],
						[320, 2, 1],
						[300, 2, 0],
						[190, 1, 4],
						[175, 1, 3],
						[150, 1, 2],
						[120, 1, 1],
						[100, 1, 0],
						[90, 0, 4],
						[75, 0, 3],
						[50, 0, 2],
						[20, 0, 1],
						[0, 0, 0]
					];

					let levelIndex = levels.findIndex(level => tempuser.chatLevelPoints >= level[0]);
					levelIndex = levelIndex === -1 ? levels.length - 1 : levelIndex;
					
					const [chatLevel, chatLevelTier] = levels[levelIndex];
					const additionalChatLevelTier = Math.floor(tempuser.chatLevelPoints / 1000);
					const adjustedChatLevelTier = chatLevelTier + additionalChatLevelTier;
					levelset(chatLevel, adjustedChatLevelTier);
					
				} checklvl(user)
				function save() {
					axios.put(apiKey + "/users/" + user.id, user, {
						headers: {
							"Authorization": "Bearer " + apiToken
						}
					})
				} save()
				
			})
		})
	}
})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand || 
		interaction.isButton() ||
		interaction.isModalSubmit()) return;
	axios.get(apiKey + "/users?where[discordId][eq]=" + interaction.user.id, {
		headers: {
			"Authorization": "Bearer " + apiToken
		}
	}).then(async res => {
		if (res.data[0] != undefined && res.data[0].banned == true && interaction.commandName !== "support") {
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
			if (res.data[0] != undefined && res.data[0].premiumExpires < Date.now() && res.data[0].premiumExpires != 0) {
				client.users.cache.get(interaction.user.id).send({
					embeds: [
						new EmbedBuilder()
						.setDescription("Термін дії вашої підписки Magic закінчився. ")
					]
				})
				axios.put(apiKey + "/users/" + res.data[0].id, {
					premium: false,
					premiumExpires: 0
				}, {
					headers: {
						"Authorization": "Bearer " + apiToken
					}
				})
			}
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
