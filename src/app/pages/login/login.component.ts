import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector:'app-login',
  standalone:true,
  imports:[CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule],
  template:`
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 p-4">
    <mat-card class="w-full max-w-md p-6 !bg-white">
      <div class="text-center mb-4">
        <div class="text-2xl font-bold text-blue-700">RailBlock AI</div>
        <div class="text-xs text-slate-500">SIH26027 • Indian Railways • Synthetic Data Demo</div>
        <div class="mt-2 bg-amber-100 text-amber-800 text-xs p-2 rounded">Prototype / Demonstration System — Uses Synthetic Railway Data</div>
      </div>
      <mat-form-field appearance="outline" class="w-full"><mat-label>Email</mat-label>
        <mat-select [(value)]="email">
          <mat-option value="admin@rail.demo">admin&#64;rail.demo (ADMIN)</mat-option>
          <mat-option value="engineering@rail.demo">engineering&#64;rail.demo (ENGINEERING_OFFICER)</mat-option>
          <mat-option value="electrical@rail.demo">electrical&#64;rail.demo (ELECTRICAL_OFFICER)</mat-option>
          <mat-option value="st@rail.demo">st&#64;rail.demo (ST_OFFICER)</mat-option>
          <mat-option value="operating@rail.demo">operating&#64;rail.demo (OPERATING_OFFICER)</mat-option>
          <mat-option value="staff@rail.demo">staff&#64;rail.demo (MAINTENANCE_STAFF)</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="w-full"><mat-label>Password</mat-label><input matInput type="password" [(ngModel)]="password"></mat-form-field>
      <div *ngIf="error" class="text-red-600 text-xs mb-2">{{error}}</div>
      <button mat-flat-button color="primary" class="w-full" (click)="login()" [disabled]="loading">{{loading?'Signing in...':'Sign In'}}</button>
      <div class="text-xs text-slate-400 mt-3">Password for all demo users: <b>demo123</b></div>
      <div class="text-xs text-slate-500 mt-2">Risk Score = Asset Criticality + Safety Impact + Overdue Days + Failure Risk + Operational Impact (0-100). Human approval mandatory — AI never auto-approves.</div>
    </mat-card>
  </div>
  `
})
export class LoginComponent {
  email='admin@rail.demo'; password='demo123'; error=''; loading=false;
  constructor(private api: ApiService, private auth: AuthService, private router: Router){}
  login(){
    this.loading=true; this.error='';
    this.api.login(this.email,this.password).subscribe({
      next:(res:any)=>{ this.auth.token=res.access_token; this.auth.user=res.user; this.router.navigate(['/dashboard']); this.loading=false; },
      error:(e:any)=>{ this.error=e.error?.message || 'Login failed — is backend running on :3000?'; this.loading=false; }
    });
  }
}
