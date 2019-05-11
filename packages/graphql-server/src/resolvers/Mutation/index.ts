import * as trc10 from "./trc10";
import * as trc20 from "./trc20";
import * as mutations from "./mutations";

export default {
  ...trc20,
  ...trc10,
  ...mutations,
}
