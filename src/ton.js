let tonConnectUI=null

function init(){
if(!tonConnectUI){
tonConnectUI=new window.TON_CONNECT_UI.TonConnectUI({
manifestUrl:window.location.origin+"/tonconnect-manifest.json"
})
}
return tonConnectUI
}

export async function connectWallet(){
const ui=init()
return await ui.connectWallet()
}

export async function sendTON(amount,receiver,nonce){
const ui=init()
return await ui.sendTransaction({
validUntil:Math.floor(Date.now()/1000)+600,
messages:[{
address:receiver,
amount:(amount*1e9).toString(),
payload:nonce
}]
})
}
