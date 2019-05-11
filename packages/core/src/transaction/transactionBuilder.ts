import TransactionCommand from "./transactionCommand";


export default interface TransactionBuilder {

  handleCommand(transactionCmd: Promise<TransactionCommand>): Promise<boolean>

}
