const {
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionsBitField
} = require("discord.js")
const template = require("../templates.js")

module.exports = {
	data: new SlashCommandBuilder()
	.setName("clear")
	.setDescription("Прибрати в кімнаті")
	.addIntegerOption(
		option => option
		.setName("count")
		.setDescription("Кількість повідомлень (не більше 100)")
		.setRequired(true)
	),
	async execute(interaction) {
	
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			interaction.reply({
				embeds: [
					new EmbedBuilder()
					.setDescription(template.icon.n + " Ні-ні! Тобі таке не можна!")
				], ephemeral: true
			})
		} else {
			if (interaction.options.getInteger("count") > 100) {
				interaction.reply({
					embeds: [
						new EmbedBuilder()
						.setDescription(template.icon.n + " Ого! А не багато?")
					], ephemeral: true
				})
			} else {
				interaction.channel.messages.fetch({limit: interaction.options.getInteger("count")})
				.then(messages => interaction.channel.bulkDelete(messages, true))
				interaction.reply({
					embeds: [
						new EmbedBuilder()
						.setDescription(template.icon.y + " Я прибрав " + interaction.options.getInteger("count") + " повідомлень.")
					], ephemeral: true
				})
			}
		}
	}
}
