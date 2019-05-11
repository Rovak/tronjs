

export default interface TransactionSigner {

  signHash(transactionHash: string): Promise<string>

}
