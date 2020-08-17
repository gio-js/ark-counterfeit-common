/**
 * Registration manufacturer transaction
 */
export interface IAnticounterfeitRegisterManufacturerTransaction {
    /**
     * Product Prefix ID : From SGTIN-96 standard (GS1)
     */
    ProductPrefixId: string

    /**
     * Company fiscal name
     */
    CompanyName: string

    /**
     * Fiscal code/ VAT number
     */
    CompanyFiscalCode: string

    /**
     * Base64 document containing subscribed contract by the manufacturer for the service
     */
    RegistrationContract: string
}

/**
 * Registration of a new product (related to a manufacturer)
 */
export interface IAnticounterfeitRegisterProductTransaction {

    /**
     * Product unique identifier
     */
    ProductId: string;

    /**
     * Asset description
     */
    Description: string;

    /**
     * Producer manufacturer address id
     */
    ManufacturerAddressId: string;

    /**
     * Product metadata (es. size, color, ...)
     */
    Metadata: string[];
}

/**
 * Product transfer transaction
 */
export interface IAnticounterfeitTransferProductTransaction {

    /**
     * Product unique identifier
     */
    ProductId: string;

    /**
     * Sender Ark.io address id (current owner of the assest)
     */
    SenderAddressId: string;

    /**
     * Recipient Ark.io address id (next owner of the assest)
     */
    RecipientAddressId: string;

}

/**
 * Product receive transaction
 */
export interface IAnticounterfeitReceiveProductTransaction {

    /**
     * Product unique identifier
     */
    ProductId: string;

    /**
     * Recipient Ark.io address id (next owner of the assest)
     */
    RecipientAddressId: string;

}
