import { Redis } from "@upstash/redis"

const redis=new Redis({
url:process.env.UPSTASH_REDIS_REST_URL,
token:process.env.UPSTASH_REDIS_REST_TOKEN
})

const RECEIVER="UQAPRU6cHYSkS8hIxl-zbcts9yt8_GtYcSh_R0nbYnWL5lFX"

export default async function handler(req,res){
const ip=req.headers["x-forwarded-for"]||"ip"
const last=await redis.get("rate:"+ip)
if(last&&Date.now()-last<3000)return res.json({error:"rate"})
await redis.set("rate:"+ip,Date.now())

const {address,ton,nonce}=JSON.parse(req.body||"{}")

if(!address||!ton||!nonce)return res.json({error:"invalid"})
if(ton<1||ton>100)return res.json({error:"amount"})

const usedNonce=await redis.get("nonce:"+nonce)
if(usedNonce)return res.json({error:"nonce"})

const userKey="user:"+address
let total=(await redis.get(userKey))||0

if(total+ton>100)return res.json({error:"limit"})

const api=await fetch(`https://toncenter.com/api/v2/getTransactions?address=${RECEIVER}&limit=30`)
const data=await api.json()

let valid=null

for(let tx of data.result){
if(!tx.in_msg)continue
const sender=tx.in_msg.source
const value=Number(tx.in_msg.value)
const payload=tx.in_msg.message||""
if(sender===address&&value>=ton*1e9&&payload.includes(nonce)){
valid=tx
break
}
}

if(!valid)return res.json({error:"notfound"})

const hash=valid.transaction_id.hash
const usedTx=await redis.get("tx:"+hash)
if(usedTx)return res.json({error:"used"})

await redis.set("tx:"+hash,1)
await redis.set("nonce:"+nonce,1)

total+=ton
await redis.set(userKey,total)

return res.json({success:true,total})
}
