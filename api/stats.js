import { Redis } from "@upstash/redis"

const redis=new Redis({
url:process.env.UPSTASH_REDIS_REST_URL,
token:process.env.UPSTASH_REDIS_REST_TOKEN
})

export default async function handler(req,res){
try{
const total=(await redis.get("global"))||0
const users=(await redis.get("users"))||0

let top=[]
const keys=await redis.keys("user:*")

for(let k of keys){
const value=await redis.get(k)
top.push({address:k.replace("user:",""),total:value||0})
}

top.sort((a,b)=>b.total-a.total)
top=top.slice(0,10)

return res.json({total,users,top})
}catch(e){
return res.json({error:"server"})
}
}
