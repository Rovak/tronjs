export default class MethodCallResult {

  private result: any;
  private error: string;
  private txId: string;

  setResult(result: any) {
    this.result = result;
    return this;
  }

  setError(error: string) {
    this.error = error;
  }

  getError() {
    return this.error;
  }

  setTransactionId(id: string) {
    this.txId = id;
    return this;
  }

  getResult() {
    return this.result;
  }

  getTransactionId() {
    return this.txId;
  }

}
