import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
@Injectable()
export class RedisService implements OnModuleInit {
  private logger=new Logger(RedisService.name);
  private client:any=null; private fallback=new Map<string,string>(); private useFallback=true;
  async onModuleInit(){
    try{
      const mod:any = await import('ioredis');
      const IORedis = mod.default || mod.Redis || mod;
      this.client=new IORedis({host:'localhost',port:6379,lazyConnect:true,connectTimeout:500, maxRetriesPerRequest:1});
      await this.client.connect().then(()=>{this.useFallback=false; this.logger.log('Redis connected')}).catch(()=>{ throw new Error('redis fail')});
      this.client.on('error',()=>{ this.useFallback=true});
    }catch(e){
      this.logger.warn('Redis unavailable — using in-memory fallback');
      this.useFallback=true;
    }
  }
  async set(key:string, val:any, ttl?:number){
    const s=JSON.stringify(val);
    if(!this.useFallback && this.client){
      try{ await this.client.set(key,s); if(ttl) await this.client.expire(key,ttl); return; }catch{}
    }
    this.fallback.set(key,s);
  }
  async get(key:string){
    if(!this.useFallback && this.client){
      try{ const v=await this.client.get(key); if(v) return JSON.parse(v); }catch{}
    }
    const v=this.fallback.get(key); return v? JSON.parse(v): null;
  }
  async getMetrics(){ return this.get('dashboard:metrics'); }
  async setMetrics(v:any){ return this.set('dashboard:metrics', v, 30); }
}
