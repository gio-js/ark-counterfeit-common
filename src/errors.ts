import { TransactionError } from "@arkecosystem/core-transactions/dist/errors";

export class ManufacturerAlreadyRegisteredError extends TransactionError {
    constructor() {
        super(`Failed to apply transaction, manufacturer already registered.`);
    }
}
