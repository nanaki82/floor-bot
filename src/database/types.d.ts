export type Alert = {
  slug: string;
  min: number;
  max: number;
  muteUntil: number;
};

export type Config = {};

export type Data = {
  [userId: string]: {
    alerts: {
      [slug: string]: Alert;
    };
    config?: Config;
  };
};

export interface DatabaseInterface {
  getAllAlerts: () => Promise<Data>;
  delAlert: (slug: string, userId: number) => Promise<boolean>;
  addAlertToUser: (alert: Alert, userId: number) => Promise<boolean>;
  getUserAlerts: (userId: number) => Promise<Alert[]>;
  getAlert: (slug: string, userId: number) => Promise<Alert | false>;
  updateAlert: (alert: Alert, userId: number) => Promise<boolean>;
  truncate: () => void;
}
