import { Redis } from "@upstash/redis"

const redis=new Redis({
url:process.env.UPSTASH_REDIS_REST_URL,
token:process.env.UPSTASH_REDIS_REST_TOKEN
})

const RECEIVER="UQA6gWiJPP6pTMkc6mpVMSzNW21n0UfCpz4chW4Sts3_nJEU"

export default async function handler(req,res){
try{
const{address,amount,nonce}=req.body

const key="mint:"+address

const existing=await redis.get(key)
if(existing){
return res.json({success:false,error:"Already minted"})
}

const check=await fetch(`https://toncenter.com/api/v2/getTransactions?address=${RECEIVER}&limit=20`)
const json=await check.json()

const txs=json.result||[]

const found=txs.find(tx=>{
return tx.in_msg &&
tx.in_msg.source===address &&
tx.in_msg.value===Math.floor(amount*1e9).toString()
})

if(!found){
return res.json({success:false,error:"TX not found"})
}

await redis.set(key,amount)

return res.json({success:true})

}catch(e){
return res.json({success:false})
}
}
