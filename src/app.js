import{getWallet,sendTON}from'./ton.js'
import{CONFIG}from'./config.js'

let address=null
let ton=1

const input=document.getElementById("tonInput")
const tags=document.getElementById("tagsOutput")
const status=document.getElementById("status")
const loader=document.getElementById("loader")
const quickBtns=document.querySelectorAll(".quickBtn")

function clamp(v){
if(v<CONFIG.MIN)return CONFIG.MIN
if(v>CONFIG.MAX)return CONFIG.MAX
return v
}

function update(){
input.value=ton
tags.innerText=(ton*CONFIG.RATE)+" TAGS"
quickBtns.forEach(b=>{
b.classList.remove("active")
if(parseInt(b.dataset.value)===ton)b.classList.add("active")
})
}

setInterval(()=>{
const w=getWallet()
if(w){
address=w.account.address
status.innerText="Wallet Connected"
}
},1000)

input.oninput=e=>{
ton=clamp(parseInt(e.target.value)||1)
update()
}

document.getElementById("plusBtn").onclick=()=>{
ton=clamp(ton+1)
update()
}

document.getElementById("minusBtn").onclick=()=>{
ton=clamp(ton-1)
update()
}

quickBtns.forEach(btn=>{
btn.onclick=()=>{
ton=clamp(parseInt(btn.dataset.value))
update()
}
})

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
body:JSON.stringify({address,amount:ton,nonce})
})

const data=await res.json()

status.innerText=data.success?"Mint success":"Verification failed"

loader.style.display="none"
}

update()
