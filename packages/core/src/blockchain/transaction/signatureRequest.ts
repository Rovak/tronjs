
type UnsignedTransaction = string
type SignedTransaction = string

export type SignatureResponse = (signatureFunc: (unsignedTx: UnsignedTransaction) => SignedTransaction) => SignedTransaction
export type SignatureRequest = (response: SignatureResponse) => Promise<SignedTransaction>

export function signatureRequest(transaction, signature): SignatureRequest {
  return signFunc => signature(signFunc(transaction));
}
