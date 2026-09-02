import { Injectable } from '@nestjs/common';

const AI_BASE = process.env.AI_SERVICE_URL || 'http://localhost:8000';

@Injectable()
export class PlannerService {
  private async proxy(path: string, init?: any) {
    try {
      const res = await fetch(`${AI_BASE}${path}`, init);
      const data = await res.json();
      return data;
    } catch (e: any) {
      // fallback deterministic if AI down
      return {
        error: 'AI service unavailable - deterministic fallback',
        mode: 'DEMO/SIMULATION fallback',
        disclaimer: 'AI model trained on synthetic demonstration data.',
        detail: e.message,
      };
    }
  }
  async optimize(body: any) {
    return this.proxy('/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
  async simulate(body: any) {
    return this.proxy('/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
  async recommendations(sectionId: string) {
    return this.proxy(`/recommendations?sectionId=${sectionId}`);
  }
  async predictDuration(dto: any) {
    return this.proxy('/predict/duration', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dto) });
  }
  async predictRisk(dto: any) {
    return this.proxy('/predict/risk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dto) });
  }
  async predictDelay(dto: any) {
    return this.proxy('/predict/delay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dto) });
  }
  async whatif(body:any){
    return this.proxy('/whatif', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
  }
}
