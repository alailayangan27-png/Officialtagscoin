import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

const RECEIVER = "EQGANTI_DENGAN_WALLET_KAMU";

export default async function handler(req, res) {
  const { address, ton } = JSON.parse(req.body);

  const userKey = "user:" + address;
  let total = (await redis.get(userKey)) || 0;

  if (total + ton > 100) {
    return res.json({ error: "Limit 100 TON" });
  }

  const api = await fetch(
    `https://toncenter.com/api/v2/getTransactions?address=${RECEIVER}&limit=20`
  );

  const data = await api.json();

  let valid = false;

  for (let tx of data.result) {
    if (!tx.in_msg) continue;

    if (
      tx.in_msg.source === address &&
      Number(tx.in_msg.value) >= ton * 1e9
    ) {
      valid = true;
      break;
    }
  }

  if (!valid) {
    return res.json({ error: "Transaksi tidak ditemukan" });
  }

  total += ton;
  await redis.set(userKey, total);

  let global = (await redis.get("global")) || 0;
  global += ton;
  await redis.set("global", global);

  return res.json({ success: true, total });
}
