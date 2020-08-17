import {
    IAnticounterfeitRegisterManufacturerTransaction, IAnticounterfeitRegisterProductTransaction,
    IAnticounterfeitReceiveProductTransaction, IAnticounterfeitTransferProductTransaction
} from "./interfaces"

export class AnticounterfeitRegisterManufacturerTransaction implements IAnticounterfeitRegisterManufacturerTransaction {
    public ProductPrefixId: string;
    public CompanyName: string;
    public CompanyFiscalCode: string;
    public RegistrationContract: string;
}

export class AnticounterfeitRegisterProductTransaction implements IAnticounterfeitRegisterProductTransaction {
    public ProductId: string;
    public Description: string;
    public ManufacturerAddressId: string;
    public Metadata: string[];
}

export class AnticounterfeitTransferProductTransaction implements IAnticounterfeitTransferProductTransaction {
    public ProductId: string;
    public SenderAddressId: string;
    public RecipientAddressId: string;
}

export class AnticounterfeitReceiveProductTransaction implements IAnticounterfeitReceiveProductTransaction {
    public ProductId: string;
    public RecipientAddressId: string;
}
