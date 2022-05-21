import { JsonDB } from "node-json-db";
import { Alert, DatabaseInterface } from "./types";

const DB_NAME = "floor-price";

class FileDatabase implements DatabaseInterface {
  private client: JsonDB;

  constructor() {
    this.client = new JsonDB(`${[DB_NAME]}.db`, true, true, "/");
    try {
      this.client.getData(`/${[DB_NAME]}`);
    } catch (_) {
      this.client.push(`/${[DB_NAME]}`, {});
    }
  }

  getAllAlerts() {
    return Promise.resolve(this.client.getData(`/${[DB_NAME]}`) || {});
  }

  addAlertToUser(alert: Alert, userId: number) {
    try {
      this.client.push(`/${[DB_NAME]}/${userId}/alerts/${alert.slug}`, alert);
    } catch (_) {
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }

  delAlert(slug: string, userId: number) {
    try {
      this.client.delete(`/${[DB_NAME]}/${userId}/alerts/${slug}`);
    } catch (_) {
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  }

  getUserAlerts(userId: number) {
    try {
      return Promise.resolve(
        this.client.getObject<Alert[]>(`/${[DB_NAME]}/${userId}/alerts`)
      );
    } catch (_) {
      return Promise.resolve([]);
    }
  }

  truncate(): void {
    this.client.push("/", {});
  }

  getAlert(slug: string, userId: number): Promise<Alert | false> {
    return Promise.resolve(
      this.client.getData(`/${[DB_NAME]}/${userId}/alerts/${slug}`)
    );
  }

  updateAlert(alert: Alert, userId: number): Promise<boolean> {
    return Promise.resolve(this.addAlertToUser(alert, userId));
  }
}

const DB = new FileDatabase();
export default DB;
