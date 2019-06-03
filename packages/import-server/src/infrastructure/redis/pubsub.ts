import {Observable} from "rxjs";

export default class RedisPubSub {
  private client: any;

  constructor(redis) {
    this.client = redis;
  }

  public pushJob(channel, data) {
    this.client.lpush(channel, JSON.stringify(data));
  }

  public onJob(channel): Observable<any> {
    return new Observable(observer => {
      const client = this.client.duplicate();

      let isActive = true;

      (async () => {
        while (isActive) {
          const [c, value] = await client.blpopAsync(channel, 0);
          observer.next(JSON.parse(value));
        }
      })();

      return () => {
        isActive = false;
        client.quit();
      };
    })
  }

  public publish(channel, data) {
    this.client.publish(channel, JSON.stringify(data));
  }

  public subscribe(channel) {
    return new Observable(observer => {
      const client = this.client.duplicate();

      client.on("message", function (c, message) {
        if (c === channel) {
          observer.next(JSON.parse(message));
        }
      });

      client.subscribe(channel);

      return () => client.quit();
    })
  }



}
