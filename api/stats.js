import { Redis } from "@upstash/redis"

const redis=new Redis({
url:process.env.UPSTASH_REDIS_REST_URL,
token:process.env.UPSTASH_REDIS_REST_TOKEN
})

export default async function handler(req,res){
const keys=await redis.keys("mint:*")

let total=0

for(const k of keys){
const v=await redis.get(k)
total+=Number(v||0)
}

res.json({
totalTON:total,
wallets:keys.length
})
}
