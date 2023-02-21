const BaseCommand = require('@structures/BaseCommand');

class Op extends BaseCommand {
    constructor(client){
        super(client, {
            name: "op",
            description: "Krasser OP Command",

            cooldown: 3000,
            staffOnly: true,
            dirname: __dirname,

            slashCommand: {
                addCommand: false,
            }
        });
    }

    static message;
    async dispatch(message, args, data){
        this.message = message;
        await this.op(args.join(" "));
    }

    async op(user){
        const member = await this.message.guild.resolveMember(user) || this.message.member;
        return this.message.reply({ content: "*Made " + member.user.username + " a server operator*" });
    }
}

module.exports = Op;
