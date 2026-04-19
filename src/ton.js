const tonConnectUI = new window.TON_CONNECT_UI.TonConnectUI({
manifestUrl: window.location.origin + "/tonconnect-manifest.json",
buttonRootId: "ton-connect"
})

export function getWallet(){
return tonConnectUI.wallet
}

export async function sendTON(amount, receiver, payload){
if(!tonConnectUI.wallet){
await tonConnectUI.connectWallet()
}

return await tonConnectUI.sendTransaction({
validUntil: Math.floor(Date.now()/1000)+600,
messages:[
{
address:receiver,
amount:(Math.floor(amount*1e9)).toString(),
payload:btoa(payload)
}
]
})
}
