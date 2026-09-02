import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MaintenanceComponent } from './pages/maintenance/maintenance.component';
import { TrainsComponent } from './pages/trains/trains.component';
import { BlocksComponent } from './pages/blocks/blocks.component';
import { MapComponent } from './pages/map/map.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { ApprovalsComponent } from './pages/approvals/approvals.component';
import { EventsComponent } from './pages/events/events.component';
import { TwinComponent } from './pages/twin/twin.component';
import { SimulatorComponent } from './pages/simulator/simulator.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '', component: LayoutComponent, canActivate:[authGuard], children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'maintenance', component: MaintenanceComponent },
      { path: 'trains', component: TrainsComponent },
      { path: 'blocks', component: BlocksComponent },
      { path: 'twin', component: TwinComponent },
      { path: 'simulator', component: SimulatorComponent },
      { path: 'map', component: MapComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'approvals', component: ApprovalsComponent },
      { path: 'events', component: EventsComponent },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
