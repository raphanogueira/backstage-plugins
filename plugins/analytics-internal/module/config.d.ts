export interface Config {
    app: {
        analytics: {
            internal: {
                /**
                 * Controls if plugin is on or off
                 * @visibility frontend
                 */
                host?: string;
                /**
                 *  Turns on console.debug messages
                 * @visibility frontend
                 */
                debug?: boolean;
                /**
                 * Sends events to console log instead of quantum metric
                 * @visibility frontend
                 */
                actions?: boolean;
            };
        };
    }
}