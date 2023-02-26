module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "client";
    }

    getType(){ return this.type }
    async dispatch(interaction, customIdSplitted, data) {

        // GET THE TYPE (YES/NO)
        const type = customIdSplitted[2];

        // GET THE MESSAGE SENT BY THE BOT
        const suggestionMessage = interaction.message;

        if(!data.member?.suggestions){
            data.member.suggestions = [];
            data.member.markModified("suggestions");
            await data.member.save();
        }
        // CHECK IF THE USER HAS ALREADY VOTED
        const hasAlreadyVoted = data.member.suggestions.find(s => s.id === suggestionMessage.id) || null;

        if(hasAlreadyVoted && hasAlreadyVoted.type === 1 && type === "yes") return interaction.deferUpdate();
        if(hasAlreadyVoted && hasAlreadyVoted.type === 0 && type === "no") return interaction.deferUpdate();

        // GET THE CURRENT EMBED FOOTER
        const currentFooter = suggestionMessage.embeds[0].footer.text;

        // GET CURRENT UP AND DOWNVOTES
        const currentUpvotes = currentFooter.split(' • ')[0].split(' ')[1];
        const currentDownvotes = currentFooter.split(' • ')[1].split(' ')[1];

        // Save to database
        data.member.suggestions = data.member.suggestions.filter(su => su.id !== suggestionMessage.id);
        data.member.suggestions.push({id: suggestionMessage.id, type: (type === "yes" ? 1 : 0)});
        data.member.markModified("suggestions");
        await data.member.save();

        // EDIT THE EMBED FOOTER
        let newUpvotes = 0;
        let newDownvotes = 0;
        if(type === "yes"){
            newUpvotes = parseInt(Number(currentUpvotes)+1);
            newDownvotes = parseInt((hasAlreadyVoted ? parseInt(currentDownvotes)-1 : parseInt(currentDownvotes)))
        }else if(type === "no"){
            newUpvotes = parseInt((hasAlreadyVoted ? parseInt(currentUpvotes)-1 : parseInt(currentUpvotes)));
            newDownvotes = parseInt(parseInt(currentDownvotes)+1)
        }
        if(newUpvotes < 0) newUpvotes = 0;
        if(newDownvotes < 0) newDownvotes = 0;
        const newFooter = "👍 " + newUpvotes + " • 👎 " + newDownvotes;
        suggestionMessage.embeds[0].data.footer.text = newFooter;

        // EDIT THE MESSAGE
        suggestionMessage.edit({ embeds:[suggestionMessage.embeds[0]], components: [suggestionMessage.components[0]] })
        await interaction.deferUpdate();
    }
}