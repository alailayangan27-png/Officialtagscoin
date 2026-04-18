export const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl: window.location.origin + "/tonconnect-manifest.json"
});

export async function connectWallet() {
  return await tonConnectUI.connectWallet();
}

export async function sendTON(amount, receiver) {
  return await tonConnectUI.sendTransaction({
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [{
      address: receiver,
      amount: (amount * 1e9).toString()
    }]
  });
}
