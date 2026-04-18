import{connectWallet,sendTON}from'./ton.js'
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

document.getElementById("connectBtn").onclick=async()=>{
const w=await connectWallet()
address=w.account.address
}

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
if(!address)return alert("Connect wallet first")
loader.style.display="block"
status.innerText="Waiting for blockchain confirmation..."
await sendTON(ton,CONFIG.RECEIVER)
await verify(address,ton)
}

async function verify(address,ton){
for(let i=0;i<10;i++){
await new Promise(r=>setTimeout(r,4000))
const res=await fetch("/api/verify",{method:"POST",body:JSON.stringify({address,ton})})
const data=await res.json()
if(data.success){
loader.style.display="none"
status.innerText="Success! Total minted: "+data.total+" TON"
return
}
}
loader.style.display="none"
status.innerText="Transaction not found"
}

update()
