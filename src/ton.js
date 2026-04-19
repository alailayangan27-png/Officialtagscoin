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

export async function sendTON(amount,receiver,nonce){
return await init().sendTransaction({
validUntil:Math.floor(Date.now()/1000)+600,
messages:[{
address:receiver,
amount:(amount*1e9).toString(),
payload:btoa(nonce)
}]
})
}
