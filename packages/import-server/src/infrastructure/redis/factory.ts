import redis from "redis";
import bluebird from "bluebird";
import {Observable} from "rxjs";

bluebird.promisifyAll(redis.RedisClient.prototype);

export default class RedisFactory {

  createClient() {
    return redis.createClient({
      db: 10,
    });
  }

}
