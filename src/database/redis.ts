import {
  createClient,
  RedisClientType,
  RedisDefaultModules,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from "redis";
import { Alert, Data, DatabaseInterface } from "./types";

class RedisDatabase implements DatabaseInterface {
  private client: RedisClientType<
    RedisDefaultModules & RedisModules,
    RedisFunctions,
    RedisScripts
  >;

  private REDIS_DB_MAP = {
    dev: 0,
    production: 1,
  };

  constructor() {
    const env = (process.env.NODE_ENV || "dev") as "dev" | "production";

    this.client = createClient({
      url: `${process.env.REDIS_URL as string}/${this.REDIS_DB_MAP[env]}`,
    });

    this.client.on("connect", () => {
      console.log(`Redis connection established`);
    });

    this.client.on("error", (error) => {
      console.error(`Redis error, service degraded: ${error}`);
    });

    this.client.connect();
  }

  async addAlertToUser(alert: Alert, userId: number) {
    const alerts = JSON.parse(
      (await this.client.hGet(userId.toString(), "alerts")) || "{}"
    );
    alerts[alert.slug] = alert;

    const alertsString = JSON.stringify(alerts);

    await this.client.hSet(userId.toString(), "alerts", alertsString);

    return true;
  }

  async delAlert(slug: string, userId: number) {
    const alerts = JSON.parse(
      (await this.client.hGet(userId.toString(), "alerts")) || "{}"
    );
    delete alerts[slug];

    const alertsString = JSON.stringify(alerts);

    await this.client.hSet(userId.toString(), "alerts", alertsString);

    return true;
  }

  async getAllAlerts() {
    const users = await this.client.keys("*");
    const alertsByUser: Data[] = await Promise.all(
      users.map(async (userId) => {
        const res = await this.client.hGetAll(userId);
        return {
          [userId]: {
            alerts: JSON.parse(res.alerts),
          },
        };
      })
    );

    return alertsByUser.reduce((acc: Data, el: Data) => {
      return Object.assign(acc, el);
    }, {});
  }

  async getUserAlerts(userId: number) {
    const res = await this.client.hGetAll(userId.toString());
    const alerts = JSON.parse(res.alerts);

    return Object.values(alerts) as Alert[];
  }

  async getAlert(slug: string, userId: number) {
    const alerts = await this.getUserAlerts(userId);
    const alert = alerts.filter((al) => al.slug === slug);

    return alert[0] || false;
  }

  async updateAlert(alert: Alert, userId: number) {
    await this.addAlertToUser(alert, userId);

    return true;
  }

  truncate(): void {}
}

const DB = new RedisDatabase();
export default DB;
