import { Transactions, Utils } from "@arkecosystem/crypto";
import { IAnticounterfeitRegisterManufacturerTransaction } from "../interfaces";
import { ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP, REGISTER_MANUFACTURER_TYPE } from '../const';
import ByteBuffer from "bytebuffer";

const { schemas } = Transactions;

export class RegisterManufacturerTransaction extends Transactions.Transaction {
    public static typeGroup: number = ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP;
    public static type: number = REGISTER_MANUFACTURER_TYPE;
    public static key: string = "register_manufacturer_transaction";

    public static getSchema(): Transactions.schemas.TransactionSchema {
        return schemas.extend(schemas.transactionBaseSchema, {
            $id: "AnticounterfeitRegisterManufacturerTransaction",
            required: ["asset", "type", "typeGroup", "recipientId", "vendorField"],
            properties: {
                type: { transactionType: REGISTER_MANUFACTURER_TYPE },
                typeGroup: { const: ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP },
                amount: { bignumber: { minimum: 0, maximum: 0 } },
                recipientId: { type: "string" },
                vendorField: { type: "string" },
                asset: {
                    type: "object",
                    required: ["AnticounterfeitRegisterManufacturerTransaction"],
                    properties: {
                        AnticounterfeitRegisterManufacturerTransaction: {
                            type: "object",
                            required: ["ProductPrefixId", "CompanyName", "CompanyFiscalCode", "RegistrationContract"],
                            properties: {
                                ProductPrefixId: {
                                    type: "string",
                                    minLength: 5,
                                    maxLength: 15,
                                },
                                CompanyName: {
                                    type: "string",
                                    minLength: 0,
                                    maxLength: 128,
                                },
                                CompanyFiscalCode: {
                                    type: "string",
                                    minLength: 0,
                                    maxLength: 56,
                                },
                                // used to match a base64 string
                                RegistrationContract: {
                                    type: "string",
                                    pattern: "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$"
                                }
                            },
                        },
                    },
                },
            },
        });
    }

    protected static defaultStaticFee: Utils.BigNumber = Utils.BigNumber.make("100000000");

    public serialize(): ByteBuffer {
        const { data } = this;

        // const { addressBuffer, addressError } = Identities.Address.toBuffer(data.recipientId);
        // options.addressError = addressError;

        const recipientIdBytes = Buffer.from(data.recipientId!, "utf8");
        const vendorFieldBytes = Buffer.from(data.vendorField!, "utf8");
        const element = data.asset!.AnticounterfeitRegisterManufacturerTransaction as IAnticounterfeitRegisterManufacturerTransaction;
        const prefixIdBytes = Buffer.from(element.ProductPrefixId, "utf8");
        const companyNameBytes = Buffer.from(element.CompanyName, "utf8");
        const fiscalCodeBytes = Buffer.from(element.CompanyFiscalCode, "utf8");
        const registrationContractBytes = Buffer.from(element.RegistrationContract, "utf8");

        const buffer = new ByteBuffer(
            recipientIdBytes.length +
            vendorFieldBytes.length +
            prefixIdBytes.length +
            companyNameBytes.length +
            fiscalCodeBytes.length +
            registrationContractBytes.length + (1 + 5), true);

        // buffer.writeUint8(addressBuffer.length);
        // buffer.append(addressBuffer);
        buffer.writeUint8(recipientIdBytes.length);
        buffer.append(recipientIdBytes, "hex");
        buffer.writeUint8(vendorFieldBytes.length);
        buffer.append(vendorFieldBytes, "hex");
        buffer.writeUint8(prefixIdBytes.length);
        buffer.append(prefixIdBytes, "hex");
        buffer.writeUint8(companyNameBytes.length);
        buffer.append(companyNameBytes, "hex");
        buffer.writeUint8(fiscalCodeBytes.length);
        buffer.append(fiscalCodeBytes, "hex");
        buffer.writeUint8(registrationContractBytes.length);
        buffer.append(registrationContractBytes, "hex");

        return buffer;
    }

    public deserialize(buf: ByteBuffer): void {
        const { data } = this;
        const AnticounterfeitRegisterManufacturerTransaction = {} as IAnticounterfeitRegisterManufacturerTransaction;

        const recipientIdLength = buf.readUint8();
        const recipientId = buf.readString(recipientIdLength); //Identities.Address.fromBuffer(buf.readBytes(recipientIdLength).toBuffer());

        const vendorFieldLength = buf.readUint8();
        const vendorField = buf.readString(vendorFieldLength);

        const prefixIdLength = buf.readUint8();
        AnticounterfeitRegisterManufacturerTransaction.ProductPrefixId = buf.readString(prefixIdLength);

        const companyNameLength = buf.readUint8();
        AnticounterfeitRegisterManufacturerTransaction.CompanyName = buf.readString(companyNameLength);

        const fiscalCodeLength = buf.readUint8();
        AnticounterfeitRegisterManufacturerTransaction.CompanyFiscalCode = buf.readString(fiscalCodeLength);

        const registrationContractLength = buf.readUint8();
        AnticounterfeitRegisterManufacturerTransaction.RegistrationContract = buf.readString(registrationContractLength);

        data.amount = Utils.BigNumber.ZERO;
        data.recipientId = recipientId;
        data.vendorField = vendorField;
        data.asset = {
            AnticounterfeitRegisterManufacturerTransaction
        };
    }
}
