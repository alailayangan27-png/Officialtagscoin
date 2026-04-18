import { connectWallet, sendTON } from './ton.js';
import { CONFIG } from './config.js';

let address = null;

document.getElementById("connectBtn").onclick = async () => {
  const w = await connectWallet();
  address = w.account.address;
};

document.getElementById("mintBtn").onclick = async () => {
  const ton = parseFloat(document.getElementById("tonInput").value);

  if (!address) return alert("Connect wallet dulu");
  if (ton < CONFIG.MIN) return alert("Min 1 TON");
  if (ton > CONFIG.MAX) return alert("Max 100 TON");

  const tx = await sendTON(ton, CONFIG.RECEIVER);

  document.getElementById("status").innerText =
    "Menunggu konfirmasi blockchain...";

  await verifyTx(address, ton);
};

async function verifyTx(address, ton) {
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
      loadStats();
      return;
    }
  }

  document.getElementById("status").innerText =
    "Transaksi belum ditemukan";
}

async function loadStats() {
  const res = await fetch("/api/stats");
  const data = await res.json();

  const percent = (data.total / 100) * 100;

  document.getElementById("bar").style.width = percent + "%";
  document.getElementById("progressText").innerText =
    `${data.total} / 100 TON`;
}

loadStats();
