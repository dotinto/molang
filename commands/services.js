const {
	SlashCommandBuilder,
	EmbedBuilder
} = require("discord.js")
const templates = require("../templates.js")
module.exports = {
	data: new SlashCommandBuilder()
	.setName("services")
	.setDescription("Requesting bot status"),
	async execute(interaction) {
		interaction.reply({
			embeds: [
				new EmbedBuilder()
				.setDescription(`\n${templates.molang}\n\n
				${templates.zero}  ${templates.icon.idle} | (заборонено)\n
				${templates.cosbank}  ${templates.icon.idle} | (заборонено)\n
				${templates.nevercord}  ${templates.icon.idle} | (заборонено)`)
			]
		})
	}
}
