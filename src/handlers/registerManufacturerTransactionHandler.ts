import { IAnticounterfeitRegisterManufacturerTransaction } from './../interfaces';
import { Database, State, TransactionPool } from "@arkecosystem/core-interfaces";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Transactions, Managers } from "@arkecosystem/crypto";
import { RegisterManufacturerTransaction } from "../transactions/transactions";
import { app } from "@arkecosystem/core-container";
import { ManufacturerAlreadyRegisteredError } from '../errors';
import { ENABLED_WALLET_TO_MANUFACTURER_REGISTRATION_PKEY } from '../const';

// import { writeFileSync } from 'fs';
// const path = require('path');

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
        const connection: Database.IConnection = app.resolvePlugin<Database.IDatabaseService>("database").connection;
        const parsedTransaction = transaction.data.asset.AnticounterfeitRegisterManufacturerTransaction as IAnticounterfeitRegisterManufacturerTransaction;

        const dbRegistrationTransactions = await connection.transactionsRepository.search({
            parameters: [
                {
                    field: "senderPublicKey",
                    value: transaction.data.senderPublicKey,
                    operator: Database.SearchOperator.OP_EQ,
                },
                {
                    field: "type",
                    value: transaction.data.type,
                    operator: Database.SearchOperator.OP_EQ,
                },
                {
                    field: "typeGroup",
                    value: transaction.data.typeGroup,
                    operator: Database.SearchOperator.OP_EQ,
                },
                {
                    field: "asset",
                    value: JSON.stringify({
                        AnticounterfeitRegisterManufacturerTransaction: {
                            CompanyFiscalCode: transaction.data.asset.AnticounterfeitRegisterManufacturerTransaction.CompanyFiscalCode
                        }
                    }),
                    operator: Database.SearchOperator.OP_CONTAINS,
                },
            ],
        });
        // const elements = JSON.stringify(dbRegistrationTransactions);
        // console.log(__dirname);
        // console.log(elements);
        // await writeFileSync(path.join(__dirname, "temp.json"), elements);

        const manufacturerRegisteredWithSameFiscalCode = dbRegistrationTransactions.rows.filter(tx =>
            tx.asset != null &&
            tx.asset!.AnticounterfeitRegisterManufacturerTransaction.CompanyFiscalCode === parsedTransaction.CompanyFiscalCode);


        if (manufacturerRegisteredWithSameFiscalCode.length > 0) {
            throw new ManufacturerAlreadyRegisteredError();
        }

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

        if (data.senderPublicKey != ENABLED_WALLET_TO_MANUFACTURER_REGISTRATION_PKEY) {
            return {
                type: "ERR_CONFLICT",
                message: `Transaction sender "${data.senderPublicKey}" not authorized to manufacturer registration.`
            };
        }

        const sameFiscalCodeInPayload = processor
            .getTransactions()
            .filter(tx => tx.type === this.getConstructor().type
                && tx.asset.AnticounterfeitRegisterManufacturerTransaction.CompanyFiscalCode === parsedTransaction.CompanyFiscalCode);
        if (sameFiscalCodeInPayload.length > 1) {
            return {
                type: "ERR_CONFLICT",
                message: `Multiple registration transaction related to same manufacturer "${parsedTransaction.CompanyFiscalCode}"`
            };
        }

        // var transactionsByDatabase = this.connection.transactionsRepository.search({
        //     parameters: [
        //         { field: "type", value: "201", operator: Database.SearchOperator.OP_EQ },
        //         //{ field: "asset.AnticounterfeitRegisterManufacturerTransaction.CompanyFiscalCode", value: parsedTransaction.CompanyFiscalCode, operator: Database.SearchOperator.OP_EQ }
        //     ]
        // } as Database.ISearchParameters)


        const transactionsByPool = await pool.getTransactionsByType(this.getConstructor().type);
        const businessRegistrationsInPool: Interfaces.ITransactionData[] = Array.from(
            transactionsByPool,
        ).map((memTx: Interfaces.ITransaction) => memTx.data);
        const sameFiscalCodeInPool: boolean = businessRegistrationsInPool.some(
            tx => tx.asset.AnticounterfeitRegisterManufacturerTransaction.CompanyFiscalCode === parsedTransaction.CompanyFiscalCode,
        );
        if (sameFiscalCodeInPool) {
            return {
                type: "ERR_PENDING",
                message: `Manufacturer registration for fiscal code "${parsedTransaction.CompanyFiscalCode}" already in the pool`,
            }
        }

        const samePrefixProductIdInPool: boolean = businessRegistrationsInPool.some(
            tx => tx.asset.AnticounterfeitRegisterManufacturerTransaction.ProductPrefixId === parsedTransaction.ProductPrefixId,
        );
        if (samePrefixProductIdInPool) {
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
