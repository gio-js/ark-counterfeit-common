import { AnticounterfeitReceiveProductTransaction } from '../models';
import { Transactions, Utils, Interfaces } from "@arkecosystem/crypto";
import { ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP, RECEIVE_PRODUCT_TYPE, VENDOR_FIELD } from "../const";

export class ReceiveProductBuilder extends Transactions.TransactionBuilder<ReceiveProductBuilder> {
    constructor() {
        super();
        this.data.type = RECEIVE_PRODUCT_TYPE;
        this.data.typeGroup = ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP;
        this.data.version = 2;
        this.data.recipientId = "";
        this.data.vendorField = VENDOR_FIELD;
        this.data.fee = Utils.BigNumber.make("100000000");
        this.data.amount = Utils.BigNumber.ZERO;
        this.data.asset = { AnticounterfeitReceiveProductTransaction: {} };
    }

    public product(productId: string, recipientAddressId: string): ReceiveProductBuilder {
        const element: AnticounterfeitReceiveProductTransaction = {
            ProductId: productId,
            RecipientAddressId: recipientAddressId
        };
        this.data.asset!.AnticounterfeitReceiveProductTransaction = element;

        return this;
    }

    public getStruct(): Interfaces.ITransactionData {
        const struct: Interfaces.ITransactionData = super.getStruct();
        struct.vendorField = this.data.vendorField;
        struct.amount = this.data.amount;
        struct.asset = this.data.asset;
        return struct;
    }

    protected instance(): ReceiveProductBuilder {
        return this;
    }
}
