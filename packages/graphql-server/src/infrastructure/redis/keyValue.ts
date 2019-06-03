import {waitFor} from "@trx/core/dist/utils/promises";

export default class RedisKeyValue {

  private client: any;

  constructor(redis) {
    this.client = redis;
  }

  public async save(bucket, name, value) {
    await this.client.hsetAsync(bucket, name, JSON.stringify(value));
  }

  public async getOrElse(bucket, name, func) {
    let value = await this.client.hgetAsync(bucket, name);
    if (value !== null) {
      return JSON.parse(value);
    }

    try {
      // Lock
      const setting = await this.client.hsetnxAsync("lock", `${bucket}:${name}`, "true");

      // New field is set
      if (setting === 1) {
        value = await func();
        await this.client.hsetAsync(bucket, name, JSON.stringify(value));
        return value;
      }

    } finally {
      // Unlock
      await this.client.hdelAsync("lock", `${bucket}:${name}`);
    }

    while (value === null) {
      value = await this.client.hgetAsync(bucket, name);
      console.log(`waiting for ${bucket}:${name}`);
      await waitFor(200);
    }

    return value;
  }



}
