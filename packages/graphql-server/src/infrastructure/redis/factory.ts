import redis from "redis";
import bluebird from "bluebird";

bluebird.promisifyAll(redis.RedisClient.prototype);

export default class RedisFactory {

  createClient() {
    return redis.createClient({
      db: 10,
    });
  }

}
