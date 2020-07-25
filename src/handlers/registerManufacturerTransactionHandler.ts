import { Database, State, TransactionPool } from "@arkecosystem/core-interfaces";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Transactions, Managers } from "@arkecosystem/crypto";
import { RegisterManufacturerTransaction } from "../transactions/transactions";


export class RegisterManufacturerTransactionHandler extends Handlers.TransactionHandler {
    public getConstructor(): Transactions.TransactionConstructor {
        return RegisterManufacturerTransaction;
    }

    public dependencies(): ReadonlyArray<Handlers.TransactionHandlerConstructor> {
        return [];
    }

    public walletAttributes(): ReadonlyArray<string> {
        return [];
    }

    public async isActivated(): Promise<boolean> {
        return Managers.configManager.getMilestone().aip11 === true;
    }

    public async bootstrap(connection: Database.IConnection, walletManager: State.IWalletManager): Promise<void> {
        return;
    }

    public async throwIfCannotBeApplied(
        transaction: Interfaces.ITransaction,
        wallet: State.IWallet,
        databaseWalletManager: State.IWalletManager,
    ): Promise<void> {
        await super.throwIfCannotBeApplied(transaction, wallet, databaseWalletManager);
    }

    public async canEnterTransactionPool(
        data: Interfaces.ITransactionData,
        pool: TransactionPool.IConnection,
        processor: TransactionPool.IProcessor,
    ): Promise<{
        type: string;
        message: string;
    } | null> {
        // const { ManufacturerAddressId }: { ManufacturerAddressId: string } = data.asset.AnticounterfeitRegisterManufacturerTransaction;
        // const businessRegistrationsSameNameInPayload = processor
        //     .getTransactions()
        //     .filter(tx => tx.type === this.getConstructor().type && tx.asset.AnticounterfeitRegisterManufacturerTransaction.ManufacturerAddressId === ManufacturerAddressId);

        // if (businessRegistrationsSameNameInPayload.length > 1) {
        //     const message = `Multiple transaction related to same manufacturer "${ManufacturerAddressId}"`;
        //     processor.pushError(
        //         data,
        //         "ERR_CONFLICT",
        //         message,
        //     );

        //     return {
        //         type: "ERR_CONFLICT",
        //         message: message
        //     };
        // }

        // const businessRegistrationsInPool: Interfaces.ITransactionData[] = Array.from(
        //     await pool.getTransactionsByType(this.getConstructor().type),
        // ).map((memTx: Interfaces.ITransaction) => memTx.data);

        // const containsManufacturerRegistrationForSameIdInPool: boolean = businessRegistrationsInPool.some(
        //     transaction => transaction.asset.AnticounterfeitRegisterManufacturerTransaction.ManufacturerAddressId === ManufacturerAddressId,
        // );

        // if (containsManufacturerRegistrationForSameIdInPool) {
        //     processor.pushError(data, "ERR_PENDING", `Manufacturer registration for "${ManufacturerAddressId}" already in the pool`);
        //     return null;
        // }

        return null;
    }

    public async applyToSender(
        transaction: Interfaces.ITransaction,
        walletManager: State.IWalletManager,
    ): Promise<void> {
        await super.applyToSender(transaction, walletManager);
    }

    public async revertForSender(
        transaction: Interfaces.ITransaction,
        walletManager: State.IWalletManager,
    ): Promise<void> {
        await super.revertForSender(transaction, walletManager);
    }

    public async applyToRecipient(
        transaction: Interfaces.ITransaction,
        walletManager: State.IWalletManager,
    ): Promise<void> {
        return;
    }

    public async revertForRecipient(
        transaction: Interfaces.ITransaction,
        walletManager: State.IWalletManager,
    ): Promise<void> {
        return;
    }
}
