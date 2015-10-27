import assign from "lodash.assign"

export default class History {

    constructor() {
        this.history = this.getFullHistory();
    }

    /**
     * Get the full history from storage
     * @returns {*}
     */
    getFullHistory() {
        try {
            return this.reconstituteErrors(JSON.parse(localStorage.history)) || [];
        } catch ( e ) {
            return [];
        }
    }

    /**
     * De-structure the error into it's message value
     * @param history
     * @returns {*}
     */
    destructureErrors( history ) {
        return history.map(c => {
            if ( c.value instanceof Error ) {
                c.value = c.value.message || "";
            }
            return c;
        })
    }

    /**
     * Reconstitute an error from the destrucutured value
     * @param history
     * @returns {*}
     */
    reconstituteErrors( history ) {
        return history.map(c => {
            if ( c.error ) {
                let Err = eval(c.errorName);
                let err = new Err(c.value);
                c.value = err;
            }
            return c;
        })
    }

    /**
     * Store the history using a very naive serialization to JSON local storage
     */
    setHistoryInStorage() {
        try {
            localStorage.history = JSON.stringify(this.destructureErrors(this.history));
        } catch ( e ) {
            //TODO, show a message
            console.error("Failed to save message");
        }
    }

    /**
     * Store a command in the history
     * @param command a command to store
     */
    store( command ) {
        //should we grab the message from an Error?
        if ( command.value instanceof Error ) {
            this.history.push(assign({}, command, {
                value: command.value.message,
                error: true,
                errorName: command.value.name
            }));
        }
        else {
            this.history.push(command);
        }

        this.setHistoryInStorage();
    }

}