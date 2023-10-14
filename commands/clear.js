const {
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionsBitField
} = require("discord.js")
const template = require("../templates.js")

module.exports = {
	data: new SlashCommandBuilder()
	.setName("clear")
	.setDescription("Удалить сообщения")
	.addIntegerOption(
		option => option
		.setName("count")
		.setDescription("Количество (не больше 100)")
		.setRequired(true)
	),
	async execute(interaction) {
		await interaction.deferReply();
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			interaction.editReply({
				embeds: [
					new EmbedBuilder()
					.setDescription(template.icon.n + " Нет-нет! Тебе такого нельзя!")
				], ephemeral: true
			})
		} else {
			if (interaction.options.getInteger("count") > 100) {
				interaction.editReply({
					embeds: [
						new EmbedBuilder()
						.setDescription(template.icon.n + " Ого! А не много?")
					], ephemeral: true
				})
			} else {
				interaction.channel.messages.fetch({limit: interaction.options.getInteger("count")})
				.then(messages => interaction.channel.bulkDelete(messages, true))
				interaction.editReply({
					embeds: [
						new EmbedBuilder()
						.setDescription(template.icon.y + " Я убрал " + interaction.options.getInteger("count") + " сообщений.")
					], ephemeral: true
				})
			}
		}
	}
}
