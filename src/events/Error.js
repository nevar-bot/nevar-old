module.exports = class {
    constructor(client) {
        this.client = client;
    }
    async dispatch(e) {
        await this.client.logException(e, null, null, null);
    }
}