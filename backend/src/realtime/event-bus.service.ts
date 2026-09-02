import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class EventBusService extends EventEmitter implements OnModuleInit {
  private logger = new Logger(EventBusService.name);
  private kafka: any = null;
  private connected = false;
  topics = [
    'maintenance.created','maintenance.updated','block.requested','block.recommended','block.approved','block.rejected','block.started','block.completed','train.updated','train.delayed','asset.status_changed','optimization.completed','replanning.started','replanning.completed'
  ];
  async onModuleInit() {
    if(process.env.DEMO_MODE==='true'){
      this.logger.warn('DEMO_MODE=true — Kafka fallback to in-memory event bus (interface ready)');
      this.connected=false; return;
    }
    try {
      const { Kafka } = await import('kafkajs');
      this.kafka = new Kafka({ clientId: 'railblock', brokers: ['localhost:9092'] });
      const producer = this.kafka.producer();
      await producer.connect().then(()=>{ this.connected=true; this.logger.log('Kafka connected'); producer.disconnect(); }).catch(()=>{ throw new Error('kafka no');});
    } catch (e) {
      this.logger.warn('Kafka unavailable — using in-memory event bus (fallback)');
      this.connected=false;
    }
  }
  async emitEvent(topic: string, payload: any) {
    const event={ topic, payload, ts: new Date().toISOString() };
    // in-memory
    super.emit(topic, event);
    super.emit('*', event);
    // try kafka
    if (this.connected && this.kafka) {
      try {
        const prod=this.kafka.producer(); await prod.connect(); await prod.send({topic, messages:[{value: JSON.stringify(event)}]}); await prod.disconnect();
      } catch {}
    }
    this.logger.log(`Event ${topic}`);
    return event;
  }
}
