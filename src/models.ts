import { IAnticounterfeitRegisterManufacturerTransaction, IAnticounterfeitRegisterAssetTransaction, IAnticounterfeitTransferAssetTransaction, IAnticounterfeitReceiveProductTransaction } from "./interfaces"

export class AnticounterfeitRegisterManufacturerTransaction implements IAnticounterfeitRegisterManufacturerTransaction {
    public ManufacturerAddressId: string;
    public ProductPrefixId: string;
    public CompanyName: string;
    public CompanyFiscalCode: string;
}

export class AnticounterfeitRegisterAssetTransaction implements IAnticounterfeitRegisterAssetTransaction {
    public AssetId: string;
    public Description: string;
    public ManufacturerAddressId: string;
    public Metadata: string[];
}

export class AnticounterfeitTransferAssetTransaction implements IAnticounterfeitTransferAssetTransaction {
    public AssetId: string;
    public SenderAddressId: string;
    public RecipientAddressId: string;
}

export class AnticounterfeitReceiveProductTransaction implements IAnticounterfeitReceiveProductTransaction {
    public AssetId: string;
    public SenderAddressId: string;
    public RecipientAddressId: string;
}