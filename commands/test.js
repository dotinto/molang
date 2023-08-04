const {
	SlashCommandBuilder
} = require("discord.js")
const checkout = require("../apis/checkout.js")
module.exports = {
	data: new SlashCommandBuilder()
	.setName("test")
	.setDescription("test"),
	async execute(interaction) {
		interaction.reply({
			embeds: [
				checkout(false, "10000", "crypto", "prosto", "dotintoshiro")
			], ephemeral: true
		})
	}
}
