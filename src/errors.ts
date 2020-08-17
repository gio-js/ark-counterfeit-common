import { TransactionError } from "@arkecosystem/core-transactions/dist/errors";

export class ManufacturerAlreadyRegisteredError extends TransactionError {
    constructor() {
        super(`Failed to apply transaction, manufacturer already registered.`);
    }
}

export class ProductAlreadyTransferredError extends TransactionError {
    constructor() {
        super(`Failed to apply transaction, the product is already in transfer.`);
    }
}

export class ProductNotOwnedUnableToTransferError extends TransactionError {
    constructor() {
        super(`Failed to apply transaction, the product is not owned by the current sender.`);
    }
}

export class ProductNotTransferredToThisRecipientError extends TransactionError {
    constructor() {
        super(`Failed to apply transaction, the product has not been transferred to this recipient.`);
    }
}
