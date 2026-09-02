import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({providedIn:'root'})
export class ApiService {
  base = 'http://localhost:3000/api';
  constructor(private http: HttpClient) {}
  login(email:string,password:string){ return this.http.post<any>(`${this.base}/auth/login`,{email,password}); }
  me(){ return this.http.get<any>(`${this.base}/auth/me`); }
  getMaintenance(){ return this.http.get<any[]>(`${this.base}/maintenance`); }
  getMaintenanceOne(id:string){ return this.http.get<any>(`${this.base}/maintenance/${id}`); }
  createMaintenance(dto:any){ return this.http.post<any>(`${this.base}/maintenance`, dto); }
  updateMaintenance(id:string,dto:any){ return this.http.put<any>(`${this.base}/maintenance/${id}`, dto); }
  getTrains(){ return this.http.get<any[]>(`${this.base}/trains`); }
  getTrain(id:string){ return this.http.get<any>(`${this.base}/trains/${id}`); }
  getBlocks(){ return this.http.get<any[]>(`${this.base}/blocks`); }
  getBlock(id:string){ return this.http.get<any>(`${this.base}/blocks/${id}`); }
  createBlock(dto:any){ return this.http.post<any>(`${this.base}/blocks`, dto); }
  getApprovals(){ return this.http.get<any>(`${this.base}/approvals`); }
  getDashboard(){ return this.http.get<any>(`${this.base}/analytics/dashboard`); }
  getEvents(){ return this.http.get<any[]>(`${this.base}/events`); }
  optimize(sectionId:string, tasks?:any[]){ return this.http.post<any>(`${this.base}/planner/optimize`, {sectionId, tasks}); }
  simulate(sectionId:string){ return this.http.post<any>(`${this.base}/planner/simulate`, {sectionId}); }
  recommendations(sectionId:string){ return this.http.get<any>(`${this.base}/planner/recommendations?sectionId=${sectionId}`); }
  predictDuration(dto:any){ return this.http.post<any>(`${this.base}/planner/predict/duration`, dto); }
  predictRisk(dto:any){ return this.http.post<any>(`${this.base}/planner/predict/risk`, dto); }
  predictDelay(dto:any){ return this.http.post<any>(`${this.base}/planner/predict/delay`, dto); }
}
