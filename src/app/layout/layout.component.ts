import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule],
  template: `
  <mat-sidenav-container class="h-screen">
    <mat-sidenav mode="side" opened class="w-[250px] bg-slate-900 !text-white">
      <div class="p-4 bg-gradient-to-r from-blue-700 to-indigo-800">
        <div class="flex items-center gap-2">
          <span class="bg-white text-blue-700 rounded p-1"><mat-icon>train</mat-icon></span>
          <div>
            <div class="font-bold text-sm leading-none">RailBlock AI</div>
            <div class="text-xs opacity-80">SIH26027 • NR</div>
          </div>
        </div>
        <div class="mt-3 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 rounded text-center">Prototype / Demonstration System — Uses Synthetic Railway Data</div>
      </div>
      <mat-nav-list class="!py-2">
        <a mat-list-item routerLink="/dashboard" routerLinkActive="!bg-blue-800 !text-white" class="!text-slate-200"><mat-icon matListItemIcon>dashboard</mat-icon> Dashboard</a>
        <a mat-list-item routerLink="/maintenance" routerLinkActive="!bg-blue-800 !text-white" class="!text-slate-200"><mat-icon matListItemIcon>build</mat-icon> Maintenance</a>
        <a mat-list-item routerLink="/trains" routerLinkActive="!bg-blue-800 !text-white" class="!text-slate-200"><mat-icon matListItemIcon>directions_railway</mat-icon> Trains</a>
        <a mat-list-item routerLink="/blocks" routerLinkActive="!bg-blue-800 !text-white" class="!text-slate-200"><mat-icon matListItemIcon>calendar_month</mat-icon> Block Planner</a>
        <a mat-list-item routerLink="/twin" routerLinkActive="!bg-blue-800 !text-white" class="!text-slate-200"><mat-icon matListItemIcon>hub</mat-icon> Digital Twin</a>
        <a mat-list-item routerLink="/simulator" routerLinkActive="!bg-blue-800 !text-white" class="!text-slate-200"><mat-icon matListItemIcon>science</mat-icon> What-If Simulator</a>
        <a mat-list-item routerLink="/map" routerLinkActive="!bg-blue-800 !text-white" class="!text-slate-200"><mat-icon matListItemIcon>map</mat-icon> Railway Map</a>
        <a mat-list-item routerLink="/analytics" routerLinkActive="!bg-blue-800 !text-white" class="!text-slate-200"><mat-icon matListItemIcon>analytics</mat-icon> Analytics</a>
        <a mat-list-item routerLink="/approvals" routerLinkActive="!bg-blue-800 !text-white" class="!text-slate-200"><mat-icon matListItemIcon>verified</mat-icon> Approvals</a>
        <a mat-list-item routerLink="/events" routerLinkActive="!bg-blue-800 !text-white" class="!text-slate-200"><mat-icon matListItemIcon>notifications</mat-icon> Events (Live)</a>
      </mat-nav-list>
      <div class="absolute bottom-0 w-full p-3 text-xs text-slate-400 border-t border-slate-700">AI-Assisted Block Planning<br>Maximize Asset Availability<br><span class="text-amber-300">AI never auto-approves</span></div>
    </mat-sidenav>
    <mat-sidenav-content class="bg-slate-100">
      <mat-toolbar class="bg-white !text-slate-800 shadow-sm sticky top-0 z-10">
        <span class="font-semibold">AI-Assisted Automatic Block Planning — Indian Railways</span>
        <span class="flex-1"></span>
        <span class="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">Backend: 3000 • API Connected</span>
        <span class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium ml-2">JWT • RBAC</span>
        <button mat-icon-button><mat-icon>account_circle</mat-icon></button>
        <span class="text-sm hidden md:inline">{{auth.user?.name}} ({{auth.user?.role}})</span>
        <button mat-stroked-button class="ml-2 !text-xs" (click)="logout()">Logout</button>
      </mat-toolbar>
      <div class="p-4 md:p-6">
        <div class="bg-amber-50 border border-amber-300 text-amber-900 text-xs md:text-sm px-4 py-2 rounded mb-4 text-center font-medium">⚠ Prototype / Demonstration System — Uses Synthetic Railway Data — Not for Operational Use — Human Approval Mandatory</div>
        <router-outlet></router-outlet>
      </div>
    </mat-sidenav-content>
  </mat-sidenav-container>
  `,
  styles:[`:host{display:block}`]
})
export class LayoutComponent {
  constructor(public auth: AuthService, private router: Router){}
  logout(){ this.auth.logout(); this.router.navigate(['/login']); }
}
