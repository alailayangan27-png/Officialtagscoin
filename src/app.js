import{getWallet,sendTON}from'./ton.js'
import{CONFIG}from'./config.js'

let address=null
let ton=1

const status=document.getElementById("status")
const loader=document.getElementById("loader")

setInterval(()=>{
const w=getWallet()
if(w){
address=w.account.address
status.innerText="Wallet Connected"
}
},1000)

document.getElementById("mintBtn").onclick=async()=>{
if(!address)return alert("Connect wallet")

loader.style.display="block"
status.innerText="Processing..."

const nonce=Date.now().toString()

try{
await sendTON(ton,CONFIG.RECEIVER,nonce)
}catch(e){
status.innerText="Transaction canceled"
loader.style.display="none"
return
}

status.innerText="Verifying..."

const res=await fetch("/api/verify",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
address,
amount:ton,
nonce
})
})

const data=await res.json()

if(data.success){
status.innerText="Mint success"
}else{
status.innerText="Verification failed"
}

loader.style.display="none"
}
