import { IAnticounterfeitTransferProductTransaction } from './../interfaces';
import { Database, State, TransactionPool } from "@arkecosystem/core-interfaces";
import { Handlers } from "@arkecosystem/core-transactions";
import { Identities, Interfaces, Transactions, Managers } from "@arkecosystem/crypto";
import { TransferProductTransaction } from "../transactions/transactions";
import { app } from "@arkecosystem/core-container";
import { ProductAlreadyTransferredError, ProductNotOwnedUnableToTransferError } from '../errors';
import { REGISTER_PRODUCT_TYPE, TRANSFER_PRODUCT_TYPE, RECEIVE_PRODUCT_TYPE } from '../const';

export class TransferProductTransactionHandler extends Handlers.TransactionHandler {
    public getConstructor(): Transactions.TransactionConstructor {
        return TransferProductTransaction;
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
        const parsedTransaction = transaction.data.asset.AnticounterfeitTransferProductTransaction as IAnticounterfeitTransferProductTransaction;
        const productId = parsedTransaction.ProductId;
        const senderPublicKey = transaction.data.senderPublicKey;
        const senderId = Identities.Address.fromPublicKey(senderPublicKey);

        const dbRegProductsTransactions = await connection.transactionsRepository.search({
            parameters: [
                {
                    field: "type", value: REGISTER_PRODUCT_TYPE, operator: Database.SearchOperator.OP_EQ,
                },
                {
                    field: "asset",
                    value: JSON.stringify({ AnticounterfeitRegisterProductTransaction: { ProductId: productId } }),
                    operator: Database.SearchOperator.OP_CONTAINS,
                },
            ],
        });

        const dbTransferProductsTransactions = await connection.transactionsRepository.search({
            parameters: [
                {
                    field: "type", value: TRANSFER_PRODUCT_TYPE, operator: Database.SearchOperator.OP_EQ,
                },
                {
                    field: "asset",
                    value: JSON.stringify({ AnticounterfeitTransferProductTransaction: { ProductId: productId } }),
                    operator: Database.SearchOperator.OP_CONTAINS,
                },
            ],
        });

        const dbReceiveProductsTransactions = await connection.transactionsRepository.search({
            parameters: [
                {
                    field: "type", value: RECEIVE_PRODUCT_TYPE, operator: Database.SearchOperator.OP_EQ,
                },
                {
                    field: "asset",
                    value: JSON.stringify({ AnticounterfeitReceiveProductTransaction: { ProductId: productId } }),
                    operator: Database.SearchOperator.OP_CONTAINS,
                },
            ],
        });

        const completeTransactions = dbRegProductsTransactions.rows
            .concat(dbTransferProductsTransactions.rows)
            .concat(dbReceiveProductsTransactions.rows);
        const sortedTransactions = completeTransactions.sort((t1, t2) => {
            if (t1.timestamp > t2.timestamp) return 1;
            if (t1.timestamp < t2.timestamp) return -1;
            return 0;
        });

        if (sortedTransactions && sortedTransactions.length > 0) {
            const transferTransaction = sortedTransactions[0];

            // last transaction related to the product is a transfer
            if (transferTransaction.type == TRANSFER_PRODUCT_TYPE) {
                throw new ProductAlreadyTransferredError();
            }

            // last transaction related to the product is a registration
            // the registar (sender) must be equal to actual transaction sender
            if (transferTransaction.type == REGISTER_PRODUCT_TYPE && transferTransaction.senderPublicKey != senderPublicKey) {
                throw new ProductNotOwnedUnableToTransferError();
            }

            // last transaction related to the product is a reception
            // the recipient must be equalt to the actual sender
            if (transferTransaction.type == RECEIVE_PRODUCT_TYPE && transferTransaction.asset.AnticounterfeitReceiveProductTransaction.RecipientAddressId != senderId) {
                throw new ProductNotOwnedUnableToTransferError();
            }
        }
        // const manufacturerRegisteredWithSameFiscalCode = dbRegistrationTransactions.rows.filter(tx =>
        //     tx.asset != null &&
        //     tx.asset!.AnticounterfeitRegisterManufacturerTransaction.CompanyFiscalCode === parsedTransaction.CompanyFiscalCode);


        // if (manufacturerRegisteredWithSameFiscalCode.length > 0) {
        //     throw new ManufacturerAlreadyRegisteredError();
        // }

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
