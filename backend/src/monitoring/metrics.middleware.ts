import { Injectable, NestMiddleware } from '@nestjs/common';
import { MetricsService } from './metrics.service.js';
@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private m:MetricsService){}
  use(req:any, res:any, next:()=>void){
    const start=Date.now();
    res.on('finish',()=>{
      const dur=Date.now()-start;
      this.m.incRequests(dur);
      if(req.path?.includes('/planner/optimize')) this.m.incOptimization(dur);
      if(req.path?.includes('/predict')) this.m.incPrediction();
    });
    next();
  }
}
