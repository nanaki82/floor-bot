import NodeCache from "node-cache";
import fetch from "node-fetch";

import { sleep } from "./helpers";

const priceCache = new NodeCache({
  stdTTL: parseInt(process.env.TTL_CACHE as string),
});
const imageCache = new NodeCache({
  stdTTL: parseInt(process.env.TTL_IMAGE_CACHE as string),
});

export const checkIfExist = async (slug: string) => {
  return await fetch(`https://api.opensea.io/api/v1/collection/${slug}/stats`)
    .then((res) => res.json())
    .then((data) => data.success !== false);
};

export const getFloorPrice = async (slug: string) => {
  const cached = priceCache.get<number>(slug);

  if (cached === undefined) {
    const res = await fetch(
      `https://api.opensea.io/api/v1/collection/${slug}/stats`
    )
      .then((res) => res.json())
      .then((data: CollectionStats) => data)
      .catch((err) => {
        console.log(err);
      });

    priceCache.set(slug, res?.stats?.floor_price);
    await sleep(parseInt(process.env.IDLE_BETWEEN_API as string));
  }

  return Promise.resolve(priceCache.get<number>(slug));
};

export const getImage = async (slug: string) => {
  const image = imageCache.get(slug);

  if (image === undefined) {
    const res = await fetch(`https://api.opensea.io/api/v1/collection/${slug}`)
      .then((res) => res.json())
      .then((data: Collection) => data)
      .catch((err) => {
        console.log(err);
      });

    imageCache.set(slug, res?.collection?.image_url);
  }

  return Promise.resolve(imageCache.get<string>(slug));
};

type CollectionStats = {
  stats: {
    one_day_volume: number;
    one_day_change: number;
    one_day_sales: number;
    one_day_average_price: number;
    seven_day_volume: number;
    seven_day_change: number;
    seven_day_sales: number;
    seven_day_average_price: number;
    thirty_day_volume: number;
    thirty_day_change: number;
    thirty_day_sales: number;
    thirty_day_average_price: number;
    total_volume: number;
    total_sales: number;
    total_supply: number;
    count: number;
    num_owners: number;
    average_price: number;
    num_reports: number;
    market_cap: number;
    floor_price: number;
  };
};

type Collection = {
  collection: {
    editors: Array<string>;
    stats: CollectionStats;
    banner_image_url: string;
    chat_url: null;
    created_date: string;
    default_to_fiat: boolean;
    description: string;
    dev_buyer_fee_basis_points: string;
    dev_seller_fee_basis_points: string;
    discord_url: string;
    display_data: {
      card_display_style: string;
    };
    external_url: string;
    featured: boolean;
    featured_image_url: string;
    hidden: boolean;
    safelist_request_status: string;
    image_url: string;
    is_subject_to_whitelist: boolean;
    large_image_url: string;
    name: string;
    only_proxied_transfers: boolean;
    opensea_buyer_fee_basis_points: string;
    opensea_seller_fee_basis_points: string;
    payout_address: string;
    require_email: boolean;
    short_description: string;
    slug: string;
    telegram_url: string;
    twitter_username: string;
    instagram_username: string;
    wiki_url: string;
    is_nsfw: boolean;
  };
};
