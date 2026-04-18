import { connectWallet, sendTON } from './ton.js';
import { CONFIG } from './config.js';

let address = null;

document.getElementById("connectBtn").onclick = async () => {
  const w = await connectWallet();
  address = w.account.address;
};

document.getElementById("tonInput").oninput = (e) => {
  let ton = parseFloat(e.target.value) || 0;
  document.getElementById("tagsOutput").innerText =
    (ton * CONFIG.RATE) + " TAGS";
};

document.getElementById("mintBtn").onclick = async () => {
  const ton = parseFloat(document.getElementById("tonInput").value);

  if (!address) return alert("Connect wallet dulu");
  if (ton < CONFIG.MIN) return alert("Min 1 TON");
  if (ton > CONFIG.MAX) return alert("Max 100 TON");

  await sendTON(ton, CONFIG.RECEIVER);

  document.getElementById("status").innerText =
    "Menunggu verifikasi blockchain...";

  await verify(address, ton);
};

async function verify(address, ton) {
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 4000));

    const res = await fetch("/api/verify", {
      method: "POST",
      body: JSON.stringify({ address, ton })
    });

    const data = await res.json();

    if (data.success) {
      document.getElementById("status").innerText =
        `Sukses! Total kamu: ${data.total} TON`;
      return;
    }
  }

  document.getElementById("status").innerText =
    "Transaksi belum ditemukan";
}
