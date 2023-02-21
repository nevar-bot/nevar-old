module.exports = class {
    constructor(client) {
        this.client = client;
        this.type = "other";
    }

    getType(){
        return this.type;
    }
    async dispatch(interaction, customIdSplitted, data) {

        // GET THE TYPE (YES/NO)
        let type = customIdSplitted[2];

        // GET THE MESSAGE SENT BY THE BOT
        let suggestionMessage = interaction.message;

        if(!data.memberData?.suggestions){
            data.memberData.suggestions = [];
            data.memberData.markModified("suggestions");
            await data.memberData.save();
        }
        // CHECK IF THE USER HAS ALREADY VOTED
        let alreadyVoted;
        if(data.memberData?.suggestions.find((su) => su?.id === suggestionMessage.id)) alreadyVoted = data.memberData?.suggestions.find((su) => su.id === suggestionMessage.id);

        console.log(alreadyVoted);

        if(alreadyVoted && alreadyVoted.type === 1 && type === "yes") return interaction.deferUpdate();
        if(alreadyVoted && alreadyVoted.type === 0 && type === "no") return interaction.deferUpdate();

        // GET THE CURRENT EMBED FOOTER
        let currentFooter = suggestionMessage.embeds[0].footer.text;

        // GET CURRENT UP AND DOWNVOTES
        let upvotes = currentFooter.split(' • ')[0].split(' ')[1];
        let downvotes = currentFooter.split(' • ')[1].split(' ')[1];

        // EDIT THE EMBED FOOTER
        if(type === 'yes') currentFooter = '👍 ' + parseInt(parseInt(upvotes)+1) + ' • 👎 ' + parseInt((alreadyVoted ? parseInt(downvotes)-1 : parseInt(downvotes)));
        if(type === 'no') currentFooter = '👍 ' + parseInt((alreadyVoted ? parseInt(upvotes)-1 : parseInt(upvotes))) + ' • 👎 ' + parseInt(parseInt(downvotes)+1)
        suggestionMessage.embeds[0].data.footer.text = currentFooter;

        // EDIT THE MESSAGE
        suggestionMessage.edit({embeds:[suggestionMessage.embeds[0]], components: [suggestionMessage.components[0]]})
        interaction.deferUpdate();
        data.memberData.suggestions = data.memberData.suggestions.filter((su) => su?.id !== suggestionMessage.id);
        data.memberData.suggestions.push({id: suggestionMessage.id, type: (type === 'yes' ? 1 : 0)});
        data.memberData.markModified("suggestions");
        await data.memberData.save();
    }
}