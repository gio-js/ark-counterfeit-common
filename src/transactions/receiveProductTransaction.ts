import { Transactions, Utils } from "@arkecosystem/crypto";
import { IAnticounterfeitReceiveProductTransaction } from "../interfaces";
import { ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP, RECEIVE_PRODUCT_TYPE } from '../const';
import ByteBuffer from "bytebuffer";

const { schemas } = Transactions;

export class ReceiveProductTransaction extends Transactions.Transaction {
    public static typeGroup: number = ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP;
    public static type: number = RECEIVE_PRODUCT_TYPE;
    public static key: string = "receive_product_transaction";

    public static getSchema(): Transactions.schemas.TransactionSchema {
        return schemas.extend(schemas.transactionBaseSchema, {
            $id: "AnticounterfeitReceiveProductTransaction",
            required: ["asset", "type", "typeGroup", "vendorField"],
            properties: {
                type: { transactionType: RECEIVE_PRODUCT_TYPE },
                typeGroup: { const: ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP },
                amount: { bignumber: { minimum: 0, maximum: 0 } },
                vendorField: { type: "string" },
                asset: {
                    type: "object",
                    required: ["AnticounterfeitReceiveProductTransaction"],
                    properties: {
                        AnticounterfeitReceiveProductTransaction: {
                            type: "object",
                            required: ["ProductId", "RecipientAddressId"],
                            properties: {
                                ProductId: {
                                    type: "string",
                                    minLength: 18,
                                    maxLength: 18,
                                },
                                RecipientAddressId: {
                                    type: "string",
                                    minLength: 34,
                                    maxLength: 34,
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
        const element = data.asset!.AnticounterfeitReceiveProductTransaction as IAnticounterfeitReceiveProductTransaction;

        const productIdBytes = Buffer.from(element.ProductId, "utf8");
        const recipientAddressBytes = Buffer.from(element.RecipientAddressId, "utf8");

        const buffer = new ByteBuffer(
            vendorFieldBytes.length +
            productIdBytes.length +
            recipientAddressBytes.length + (1 + 2), true);

        buffer.writeUint8(vendorFieldBytes.length);
        buffer.append(vendorFieldBytes, "hex");
        buffer.writeUint8(productIdBytes.length);
        buffer.append(productIdBytes, "hex");
        buffer.writeUint8(recipientAddressBytes.length);
        buffer.append(recipientAddressBytes, "hex");

        return buffer;
    }

    public deserialize(buf: ByteBuffer): void {
        const { data } = this;
        const AnticounterfeitReceiveProductTransaction = {} as IAnticounterfeitReceiveProductTransaction;

        const vendorFieldLength = buf.readUint8();
        const vendorField = buf.readString(vendorFieldLength);

        const productIdLength = buf.readUint8();
        AnticounterfeitReceiveProductTransaction.ProductId = buf.readString(productIdLength);

        const recipientAddressIdLength = buf.readUint8();
        AnticounterfeitReceiveProductTransaction.RecipientAddressId = buf.readString(recipientAddressIdLength);

        data.amount = Utils.BigNumber.ZERO;
        data.vendorField = vendorField;
        data.asset = {
            AnticounterfeitReceiveProductTransaction
        };
    }
}
