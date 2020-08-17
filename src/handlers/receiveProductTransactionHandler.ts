import { IAnticounterfeitReceiveProductTransaction } from '../interfaces';
import { Database, State, TransactionPool } from "@arkecosystem/core-interfaces";
import { Handlers } from "@arkecosystem/core-transactions";
import { Interfaces, Transactions, Managers } from "@arkecosystem/crypto";
import { ReceiveProductTransaction } from "../transactions/transactions";
import { app } from "@arkecosystem/core-container";
import { ProductNotTransferredToThisRecipientError } from '../errors';
import { REGISTER_PRODUCT_TYPE, TRANSFER_PRODUCT_TYPE, RECEIVE_PRODUCT_TYPE } from '../const';

export class ReceiveProductTransactionHandler extends Handlers.TransactionHandler {
    public getConstructor(): Transactions.TransactionConstructor {
        return ReceiveProductTransaction;
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
        const parsedTransaction = transaction.data.asset.AnticounterfeitReceiveProductTransaction as IAnticounterfeitReceiveProductTransaction;
        const productId = parsedTransaction.ProductId;
        const recipientId = parsedTransaction.RecipientAddressId;

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
            // the recipient must be the current transaction recipient
            if (transferTransaction.type != TRANSFER_PRODUCT_TYPE ||
                (transferTransaction.type == TRANSFER_PRODUCT_TYPE &&
                transferTransaction.asset.AnticounterfeitReceiveProductTransaction.RecipientAddressId != recipientId)) {
                throw new ProductNotTransferredToThisRecipientError();
            }
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
