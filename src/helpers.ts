import { Alert } from "./database/types";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const toString = (alert: Alert) =>
  `Alert when ${alert.slug} goes over ${alert.max} or under ${alert.min}`;

export const sliceIntoChunks = <T>(arr: Array<T>, chunkSize: number) => {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
};

export const getAlertMessage = (
  slug: string,
  price: number,
  min: number,
  max: number
) => {
  if (price < min) {
    return `${slug} floor price <b>${price}</b> under ${min}`;
  }
  if (price > min) {
    return `${slug} floor price <b>${price}</b> over ${max}`;
  }
};
