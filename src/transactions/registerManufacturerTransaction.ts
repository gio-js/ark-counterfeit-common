import { Transactions, Utils } from "@arkecosystem/crypto";
import ByteBuffer from "bytebuffer";
import { IAnticounterfeitRegisterManufacturerTransaction } from "../interfaces";
import { ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP, REGISTER_MANUFACTURER_TYPE } from '../const';

const { schemas } = Transactions;

export class RegisterManufacturerTransaction extends Transactions.Transaction {
    public static typeGroup: number = ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP;
    public static type: number = REGISTER_MANUFACTURER_TYPE;
    public static key: string = "register_manufacturer_transaction";

    public static getSchema(): Transactions.schemas.TransactionSchema {
        return schemas.extend(schemas.transactionBaseSchema, {
            $id: "AnticounterfeitRegisterManufacturerTransaction",
            required: ["asset", "type", "typeGroup"],
            properties: {
                type: { transactionType: REGISTER_MANUFACTURER_TYPE },
                typeGroup: { const: 2001 },
                amount: { bignumber: { minimum: 0, maximum: 0 } },
                asset: {
                    type: "object",
                    required: ["AnticounterfeitRegisterManufacturerTransaction"],
                    properties: {
                        AnticounterfeitRegisterManufacturerTransaction: {
                            type: "object",
                            required: ["ManufacturerAddressId", "ProductPrefixId", "CompanyName", "CompanyFiscalCode"],
                            properties: {
                                ManufacturerAddressId: {
                                    type: "string",
                                    minLength: 34,
                                    maxLength: 34,
                                },
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

        const element = data.asset!.AnticounterfeitRegisterManufacturerTransaction as IAnticounterfeitRegisterManufacturerTransaction;
        const manufacturerAddressIdBytes = Buffer.from(element.ManufacturerAddressId, "utf8");
        const prefixIdBytes = Buffer.from(element.ProductPrefixId, "utf8");
        const companyNameBytes = Buffer.from(element.CompanyName, "utf8");
        const fiscalCodeBytes = Buffer.from(element.CompanyFiscalCode, "utf8");

        const buffer = new ByteBuffer(
            manufacturerAddressIdBytes.length +
            prefixIdBytes.length +
            companyNameBytes.length +
            fiscalCodeBytes.length + 4, true);
        buffer.writeUint8(manufacturerAddressIdBytes.length);
        buffer.append(manufacturerAddressIdBytes, "hex");
        buffer.writeUint8(prefixIdBytes.length);
        buffer.append(prefixIdBytes, "hex");
        buffer.writeUint8(companyNameBytes.length);
        buffer.append(companyNameBytes, "hex");
        buffer.writeUint8(fiscalCodeBytes.length);
        buffer.append(fiscalCodeBytes, "hex");

        return buffer;
    }

    public deserialize(buf: ByteBuffer): void {
        const { data } = this;
        const AnticounterfeitRegisterManufacturerTransaction = {} as IAnticounterfeitRegisterManufacturerTransaction;

        const manufacturerAddressIdLength = buf.readUint8();
        AnticounterfeitRegisterManufacturerTransaction.ManufacturerAddressId = buf.readString(manufacturerAddressIdLength);

        const prefixIdLength = buf.readUint8();
        AnticounterfeitRegisterManufacturerTransaction.ProductPrefixId = buf.readString(prefixIdLength);

        const companyNameLength = buf.readUint8();
        AnticounterfeitRegisterManufacturerTransaction.CompanyName = buf.readString(companyNameLength);

        const fiscalCodeLength = buf.readUint8();
        AnticounterfeitRegisterManufacturerTransaction.CompanyFiscalCode = buf.readString(fiscalCodeLength);

        data.asset = {
            AnticounterfeitRegisterManufacturerTransaction
        };
    }
}
