const generateUniqueId = function(length){
    let result = '';
    let characters = '0123456789';
    let charactersLength = characters.length;
    for(let i = 0; i < length; i++){
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

const createReminder = async function(mongoData, reminderData){
    if(typeof mongoData !== 'object' || typeof reminderData !== 'object'){
        return {
            success: false,
            id: null,
            message: 'Invalid type'
        };
    }
    if(!mongoData?.reminder){
        mongoData.reminder = [];
        mongoData.markModified("reminder");
    }
    let remindId = generateUniqueId(14);
    let reminderObject = {
        startDate: reminderData.startDate,
        endDate: reminderData.endDate,
        reason: reminderData.reason,
        channel: reminderData.channel,
        id: remindId
    };
    mongoData.reminder.push(reminderObject);
    mongoData.markModified("reminder");
    await mongoData.save();
    return {
        success: true,
        id: remindId,
        message: null
    };
};

const getReminders = async function(mongoData){
    let reminders = [];
    for(let reminder of mongoData.reminder){
        reminders.push(reminder);
    }
    return reminders;
}

const isReminder = function(id, mongoData){
    return !!mongoData.reminder.find((reminder) => reminder.id === id);
}

const deleteReminder = async function(id, mongoData){
    mongoData.reminder = mongoData.reminder.filter((reminder) => reminder.id !== id);
    mongoData.markModified("reminder");
    await mongoData.save();
    return true;
}

module.exports = {
    generateUniqueId,
    createReminder,
    getReminders,
    isReminder,
    deleteReminder
}
