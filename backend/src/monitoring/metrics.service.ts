import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  requests=0; latencyTotal=0; optimizations=0; predictions=0; wsConnections=0; eventsProcessed=0; failedEvents=0; activeBlocks=0; replanningCount=0;
  latencies:number[]=[];
  incRequests(latencyMs:number){ this.requests++; this.latencyTotal+=latencyMs; this.latencies.push(latencyMs); if(this.latencies.length>1000) this.latencies.shift(); }
  incOptimization(timeMs:number){ this.optimizations++; this.latencyTotal+=timeMs; }
  incPrediction(){ this.predictions++; }
  incWs(delta:number){ this.wsConnections+=delta; }
  incEvent(ok:true| false){ if(ok) this.eventsProcessed++; else this.failedEvents++; }
  setActiveBlocks(n:number){ this.activeBlocks=n; }
  incReplanning(){ this.replanningCount++; }
  prometheus(){
    const avg = this.requests ? (this.latencyTotal/this.requests).toFixed(2) : 0;
    return `# HELP api_requests_total Total API requests
# TYPE api_requests_total counter
api_requests_total ${this.requests}
# HELP api_latency_avg_ms Average latency
# TYPE api_latency_avg_ms gauge
api_latency_avg_ms ${avg}
# HELP optimization_time_count Optimization runs
# TYPE optimization_time_count counter
optimization_time_count ${this.optimizations}
# HELP ai_prediction_count AI predictions
# TYPE ai_prediction_count counter
ai_prediction_count ${this.predictions}
# HELP websocket_connections Active WS
# TYPE websocket_connections gauge
websocket_connections ${this.wsConnections}
# HELP events_processed Total events
# TYPE events_processed counter
events_processed ${this.eventsProcessed}
# HELP failed_events Failed events
# TYPE failed_events counter
failed_events ${this.failedEvents}
# HELP active_blocks Active blocks
# TYPE active_blocks gauge
active_blocks ${this.activeBlocks}
# HELP replanning_count Replanning runs
# TYPE replanning_count counter
replanning_count ${this.replanningCount}
`;
  }
}
