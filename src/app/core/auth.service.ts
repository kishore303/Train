import { Injectable } from '@angular/core';
@Injectable({providedIn:'root'})
export class AuthService {
  get token(){ return localStorage.getItem('token'); }
  set token(v:string|null){ if(v) localStorage.setItem('token',v); else localStorage.removeItem('token'); }
  get user(){ try{ return JSON.parse(localStorage.getItem('user')||'null'); }catch{return null} }
  set user(v:any){ if(v) localStorage.setItem('user',JSON.stringify(v)); else localStorage.removeItem('user'); }
  isLogged(){ return !!this.token; }
  logout(){ this.token=null; this.user=null; }
}
