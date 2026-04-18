import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

const RECEIVER = "UQAPRU6cHYSkS8hIxl-zbcts9yt8_GtYcSh_R0nbYnWL5lFX";

export default async function handler(req, res) {
  const { address, ton } = JSON.parse(req.body);

  const userKey = "user:" + address;
  const usedTxKey = "used_tx";

  let total = (await redis.get(userKey)) || 0;

  if (total + ton > 100) {
    return res.json({ error: "Limit 100 TON" });
  }

  // ambil transaksi terbaru dari wallet penerima
  const api = await fetch(
    `https://toncenter.com/api/v2/getTransactions?address=${RECEIVER}&limit=20`
  );

  const data = await api.json();

  let validTx = null;

  for (let tx of data.result) {
    if (!tx.in_msg) continue;

    const sender = tx.in_msg.source;
    const value = Number(tx.in_msg.value);

    if (
      sender === address &&
      value >= ton * 1e9
    ) {
      const txId = tx.transaction_id.lt;

      // cek apakah tx sudah dipakai
      const used = await redis.sismember(usedTxKey, txId);
      if (used) continue;

      validTx = txId;
      break;
    }
  }

  if (!validTx) {
    return res.json({ error: "Tx belum ditemukan / tidak valid" });
  }

  // simpan tx agar tidak dipakai ulang
  await redis.sadd(usedTxKey, validTx);

  total += ton;
  await redis.set(userKey, total);

  let global = (await redis.get("global")) || 0;
  global += ton;
  await redis.set("global", global);

  return res.json({ success: true, total });
}
