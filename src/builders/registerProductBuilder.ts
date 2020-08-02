import { AnticounterfeitRegisterProductTransaction } from './../models';
import { Transactions, Utils, Interfaces } from "@arkecosystem/crypto";
import { ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP, REGISTER_PRODUCT_TYPE, VENDOR_FIELD } from "../const";

export class RegisterProductBuilder extends Transactions.TransactionBuilder<RegisterProductBuilder> {
    constructor() {
        super();
        this.data.type = REGISTER_PRODUCT_TYPE;
        this.data.typeGroup = ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP;
        this.data.version = 2;
        this.data.recipientId = "";
        this.data.vendorField = VENDOR_FIELD;
        this.data.fee = Utils.BigNumber.make("100000000");
        this.data.amount = Utils.BigNumber.ZERO;
        this.data.asset = { AnticounterfeitRegisterProductTransaction: {} };
    }

    public manufacturer(productId: string, description: string, manufacturerAddressId: string, metadata: string[]): RegisterProductBuilder {
        const element: AnticounterfeitRegisterProductTransaction = {
            ProductId: productId,
            Description: description,
            ManufacturerAddressId: manufacturerAddressId,
            Metadata: metadata
        };
        this.data.asset!.AnticounterfeitRegisterProductTransaction = element;

        return this;
    }

    public getStruct(): Interfaces.ITransactionData {
        const struct: Interfaces.ITransactionData = super.getStruct();
        struct.vendorField = this.data.vendorField;
        struct.amount = this.data.amount;
        struct.asset = this.data.asset;
        return struct;
    }

    protected instance(): RegisterProductBuilder {
        return this;
    }
}
