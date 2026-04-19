let ui=null

function init(){
if(!ui){
ui=new window.TON_CONNECT_UI.TonConnectUI({
manifestUrl:window.location.origin+"/tonconnect-manifest.json",
buttonRootId:"ton-connect"
})
}
return ui
}

export function getWallet(){
return init().wallet
}

export async function sendTON(amount,receiver){
const instance=init()

if(!instance.wallet){
await instance.connectWallet()
}

await new Promise(r=>setTimeout(r,500))

return await instance.sendTransaction({
validUntil: Math.floor(Date.now()/1000) + 3600,
messages:[{
address:receiver,
amount:(BigInt(Math.floor(amount * 1e9))).toString(),
payload:btoa("TAGS MINT")
}]
})
}
