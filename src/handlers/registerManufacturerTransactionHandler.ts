import { IAnticounterfeitRegisterManufacturerTransaction } from './../interfaces';
import { Database, State, TransactionPool } from "@arkecosystem/core-interfaces";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Transactions, Managers } from "@arkecosystem/crypto";
import { RegisterManufacturerTransaction } from "../transactions/transactions";
import { REGISTER_MANUFACTURER_TYPE } from "../const";


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
        const err = await this.typeFromSenderAlreadyInPool(data, pool);
        if (err !== null) {
            return err;
        }

        const parsedTransaction = data.asset.AnticounterfeitRegisterManufacturerTransaction as IAnticounterfeitRegisterManufacturerTransaction;

        if (data.senderPublicKey != "03287bfebba4c7881a0509717e71b34b63f31e40021c321f89ae04f84be6d6ac37") {
            return {
                type: "ERR_CONFLICT",
                message: `Transaction sender "${data.senderPublicKey}" not authorized to manufacturer registration.`
            };
        }

        const sameFiscalCodeInPayload = processor
            .getTransactions()
            .filter(tx => tx.type === REGISTER_MANUFACTURER_TYPE
                && tx.asset.AnticounterfeitRegisterManufacturerTransaction.CompanyFiscalCode === parsedTransaction.CompanyFiscalCode);
        if (sameFiscalCodeInPayload.length > 1) {
            return {
                type: "ERR_CONFLICT",
                message: `Multiple registration transaction related to same manufacturer "${parsedTransaction.CompanyFiscalCode}"`
            };
        }

        const businessRegistrationsInPool: Interfaces.ITransactionData[] = Array.from(
            await pool.getTransactionsByType(this.getConstructor().type),
        ).map((memTx: Interfaces.ITransaction) => memTx.data);
        const sameFiscalCodeInPool: boolean = businessRegistrationsInPool.some(
            tx => tx.asset.AnticounterfeitRegisterManufacturerTransaction.CompanyFiscalCode === parsedTransaction.CompanyFiscalCode,
        );
        if (sameFiscalCodeInPool){
            return {
                type: "ERR_PENDING",
                message: `Manufacturer registration for fiscal code "${parsedTransaction.CompanyFiscalCode}" already in the pool`,
            }
        }

        const samePrefixProductIdInPool: boolean = businessRegistrationsInPool.some(
            tx => tx.asset.AnticounterfeitRegisterManufacturerTransaction.ProductPrefixId === parsedTransaction.ProductPrefixId,
        );
        if (samePrefixProductIdInPool){
            return {
                type: "ERR_PENDING",
                message: `Manufacturer registration for product prefix id "${parsedTransaction.CompanyFiscalCode}" already in the pool`,
            }
        }

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
