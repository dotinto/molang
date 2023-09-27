const {
	SlashCommandBuilder,
	EmbedBuilder
} = require("discord.js")
const templates = require("../templates.js")
const axios = require("axios")
const { APIKEY, APITOKEN } = process.env

const startat = Date.now();

module.exports = {
	data: new SlashCommandBuilder()
	.setName("status")
	.setDescription("Requesting bot status"),
	async execute(interaction, client) {
		await interaction.deferReply()
		await axios.get(APIKEY + "/users", {
			headers: {
				"Authorization": "Bearer " + APITOKEN
			}
		}).then(res => {
			var endat = Date.now();
			var resPing = endat - startat
			interaction.editReply({
				embeds: [
					new EmbedBuilder()
					.setDescription(templates.molang + "\nЧас обробки сервера (обидві сторони): `" + resPing + "ms`" + `\nЧас обміну даними між client/api:\` ${Date.now() - interaction.createdTimestamp}ms/${Math.round(client.ws.ping)}ms\``)
				], ephemeral: true
			})
		})
	}
}
