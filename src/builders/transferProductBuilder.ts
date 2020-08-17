import { AnticounterfeitTransferProductTransaction } from './../models';
import { Transactions, Utils, Interfaces } from "@arkecosystem/crypto";
import { ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP, TRANSFER_PRODUCT_TYPE, VENDOR_FIELD } from "../const";

export class TransferProductBuilder extends Transactions.TransactionBuilder<TransferProductBuilder> {
    constructor() {
        super();
        this.data.type = TRANSFER_PRODUCT_TYPE;
        this.data.typeGroup = ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP;
        this.data.version = 2;
        this.data.recipientId = "";
        this.data.vendorField = VENDOR_FIELD;
        this.data.fee = Utils.BigNumber.make("100000000");
        this.data.amount = Utils.BigNumber.ZERO;
        this.data.asset = { AnticounterfeitTransferProductTransaction: {} };
    }

    public product(productId: string, senderAddressId: string, recipientAddressId: string): TransferProductBuilder {
        const element: AnticounterfeitTransferProductTransaction = {
            ProductId: productId,
            SenderAddressId: senderAddressId,
            RecipientAddressId: recipientAddressId
        };
        this.data.asset!.AnticounterfeitTransferProductTransaction = element;

        return this;
    }

    public getStruct(): Interfaces.ITransactionData {
        const struct: Interfaces.ITransactionData = super.getStruct();
        struct.vendorField = this.data.vendorField;
        struct.amount = this.data.amount;
        struct.asset = this.data.asset;
        return struct;
    }

    protected instance(): TransferProductBuilder {
        return this;
    }
}
