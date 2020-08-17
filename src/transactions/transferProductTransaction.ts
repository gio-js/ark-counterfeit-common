import { Transactions, Utils } from "@arkecosystem/crypto";
import { IAnticounterfeitTransferProductTransaction } from "../interfaces";
import { ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP, TRANSFER_PRODUCT_TYPE } from '../const';
import ByteBuffer from "bytebuffer";

const { schemas } = Transactions;

export class TransferProductTransaction extends Transactions.Transaction {
    public static typeGroup: number = ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP;
    public static type: number = TRANSFER_PRODUCT_TYPE;
    public static key: string = "transfer_product_transaction";

    public static getSchema(): Transactions.schemas.TransactionSchema {
        return schemas.extend(schemas.transactionBaseSchema, {
            $id: "AnticounterfeitTransferProductTransaction",
            required: ["asset", "type", "typeGroup", "vendorField"],
            properties: {
                type: { transactionType: TRANSFER_PRODUCT_TYPE },
                typeGroup: { const: ANTICOUNTERFEIT_TRANSACTIONS_TYPE_GROUP },
                amount: { bignumber: { minimum: 0, maximum: 0 } },
                vendorField: { type: "string" },
                asset: {
                    type: "object",
                    required: ["AnticounterfeitTransferProductTransaction"],
                    properties: {
                        AnticounterfeitTransferProductTransaction: {
                            type: "object",
                            required: ["ProductId", "SenderAddressId", "RecipientAddressId"],
                            properties: {
                                ProductId: {
                                    type: "string",
                                    minLength: 18,
                                    maxLength: 18,
                                },
                                SenderAddressId: {
                                    type: "string",
                                    minLength: 34,
                                    maxLength: 34,
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
        const element = data.asset!.AnticounterfeitTransferProductTransaction as IAnticounterfeitTransferProductTransaction;

        const productIdBytes = Buffer.from(element.ProductId, "utf8");
        const senderAddressBytes = Buffer.from(element.SenderAddressId, "utf8");
        const recipientAddressBytes = Buffer.from(element.RecipientAddressId, "utf8");

        const buffer = new ByteBuffer(
            vendorFieldBytes.length +
            productIdBytes.length +
            senderAddressBytes.length +
            recipientAddressBytes.length + (1 + 3), true);

        buffer.writeUint8(vendorFieldBytes.length);
        buffer.append(vendorFieldBytes, "hex");
        buffer.writeUint8(productIdBytes.length);
        buffer.append(productIdBytes, "hex");
        buffer.writeUint8(senderAddressBytes.length);
        buffer.append(senderAddressBytes, "hex");
        buffer.writeUint8(recipientAddressBytes.length);
        buffer.append(recipientAddressBytes, "hex");

        return buffer;
    }

    public deserialize(buf: ByteBuffer): void {
        const { data } = this;
        const AnticounterfeitTransferProductTransaction = {} as IAnticounterfeitTransferProductTransaction;

        const vendorFieldLength = buf.readUint8();
        const vendorField = buf.readString(vendorFieldLength);

        const productIdLength = buf.readUint8();
        AnticounterfeitTransferProductTransaction.ProductId = buf.readString(productIdLength);

        const senderAddressIdLength = buf.readUint8();
        AnticounterfeitTransferProductTransaction.SenderAddressId = buf.readString(senderAddressIdLength);

        const recipientAddressIdLength = buf.readUint8();
        AnticounterfeitTransferProductTransaction.RecipientAddressId = buf.readString(recipientAddressIdLength);

        data.amount = Utils.BigNumber.ZERO;
        data.vendorField = vendorField;
        data.asset = {
            AnticounterfeitTransferProductTransaction
        };
    }
}
