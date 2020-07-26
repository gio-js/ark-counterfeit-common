
import { Transactions, Utils, Interfaces } from "@arkecosystem/crypto";
import { AnticounterfeitRegisterManufacturerTransaction } from "../models";
import { REGISTER_MANUFACTURER_TYPE, ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP } from "../const";

export class RegisterManufacturerBuilder extends Transactions.TransactionBuilder<RegisterManufacturerBuilder> {
    constructor() {
        super();
        this.data.type = REGISTER_MANUFACTURER_TYPE;
        this.data.typeGroup = ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP;
        this.data.version = 2;
        this.data.fee = Utils.BigNumber.make("100000000");
        this.data.amount = Utils.BigNumber.ZERO;
        this.data.asset = { AnticounterfeitRegisterManufacturerTransaction: {} };
    }

    public manufacturer(addressId: string, prefixId: string, companyName: string, fiscalCode: string): RegisterManufacturerBuilder {
        const element: AnticounterfeitRegisterManufacturerTransaction = {
            ManufacturerAddressId: addressId,
            ProductPrefixId: prefixId,
            CompanyName: companyName,
            CompanyFiscalCode: fiscalCode
        };
        this.data.asset!.AnticounterfeitRegisterManufacturerTransaction = element;

        return this;
    }

    public getStruct(): Interfaces.ITransactionData {
        const struct: Interfaces.ITransactionData = super.getStruct();
        struct.recipientId = this.data.recipientId;
        struct.vendorField = this.data.vendorField;
        struct.amount = this.data.amount;
        struct.asset = this.data.asset;
        return struct;
    }

    protected instance(): RegisterManufacturerBuilder {
        return this;
    }
}
