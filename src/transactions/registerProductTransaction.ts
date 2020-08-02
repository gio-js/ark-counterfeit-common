import { Transactions, Utils } from "@arkecosystem/crypto";
import { IAnticounterfeitRegisterProductTransaction } from "../interfaces";
import { ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP, REGISTER_PRODUCT_TYPE } from '../const';
import ByteBuffer from "bytebuffer";

const { schemas } = Transactions;

export class RegisterProductTransaction extends Transactions.Transaction {
    public static typeGroup: number = ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP;
    public static type: number = REGISTER_PRODUCT_TYPE;
    public static key: string = "register_product_transaction";

    public static getSchema(): Transactions.schemas.TransactionSchema {
        return schemas.extend(schemas.transactionBaseSchema, {
            $id: "AnticounterfeitRegisterProductTransaction",
            required: ["asset", "type", "typeGroup", "vendorField"],
            properties: {
                type: { transactionType: REGISTER_PRODUCT_TYPE },
                typeGroup: { const: ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP },
                amount: { bignumber: { minimum: 0, maximum: 0 } },
                vendorField: { type: "string" },
                asset: {
                    type: "object",
                    required: ["AnticounterfeitRegisterProductTransaction"],
                    properties: {
                        AnticounterfeitRegisterManufacturerTransaction: {
                            type: "object",
                            required: ["ProductId", "Description", "ManufacturerAddressId", "Metadata"],
                            properties: {
                                ProductId: {
                                    type: "string",
                                    minLength: 18,
                                    maxLength: 18,
                                },
                                ManufacturerAddressId: {
                                    type: "string",
                                    minLength: 34,
                                    maxLength: 34,
                                },
                                CompanyFiscalCode: {
                                    type: "string",
                                    minLength: 0,
                                    maxLength: 56,
                                },
                                Metadata: {
                                    type: "array",
                                    maxItems : "3",
                                    additionalItems: { "type": "string" }
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

        const vendorFieldBytes = Buffer.from(data.vendorField!, "utf8");
        const element = data.asset!.AnticounterfeitRegisterProductTransaction as IAnticounterfeitRegisterProductTransaction;

        const productIdBytes = Buffer.from(element.ProductId, "utf8");
        const descriptionBytes = Buffer.from(element.Description, "utf8");
        const manufacturerAddressIdBytes = Buffer.from(element.ManufacturerAddressId, "utf8");
        const metadataBytes = Buffer.from(JSON.stringify(element.Metadata), "utf8");

        const buffer = new ByteBuffer(
            vendorFieldBytes.length +
            productIdBytes.length +
            descriptionBytes.length +
            manufacturerAddressIdBytes.length +
            metadataBytes.length + (1 + 4), true);

        buffer.writeUint8(vendorFieldBytes.length);
        buffer.append(vendorFieldBytes, "hex");
        buffer.writeUint8(productIdBytes.length);
        buffer.append(productIdBytes, "hex");
        buffer.writeUint8(descriptionBytes.length);
        buffer.append(descriptionBytes, "hex");
        buffer.writeUint8(manufacturerAddressIdBytes.length);
        buffer.append(manufacturerAddressIdBytes, "hex");
        buffer.writeUint8(metadataBytes.length);
        buffer.append(metadataBytes, "hex");

        return buffer;
    }

    public deserialize(buf: ByteBuffer): void {
        const { data } = this;
        const AnticounterfeitRegisterProductTransaction = {} as IAnticounterfeitRegisterProductTransaction;

        const vendorFieldLength = buf.readUint8();
        const vendorField = buf.readString(vendorFieldLength);

        const productIdLength = buf.readUint8();
        AnticounterfeitRegisterProductTransaction.ProductId = buf.readString(productIdLength);

        const descriptionLength = buf.readUint8();
        AnticounterfeitRegisterProductTransaction.Description = buf.readString(descriptionLength);

        const manufacturerAddressIdLength = buf.readUint8();
        AnticounterfeitRegisterProductTransaction.ManufacturerAddressId = buf.readString(manufacturerAddressIdLength);

        const metadataLength = buf.readUint8();
        AnticounterfeitRegisterProductTransaction.Metadata = JSON.parse(buf.readString(metadataLength));

        data.amount = Utils.BigNumber.ZERO;
        data.vendorField = vendorField;
        data.asset = {
            AnticounterfeitRegisterProductTransaction
        };
    }
}
