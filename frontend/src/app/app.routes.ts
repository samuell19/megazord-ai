import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AgentCreateComponent } from './components/agent-create/agent-create.component';
import { AgentDetailComponent } from './components/agent-detail/agent-detail.component';
import { ApiKeyConfigComponent } from './components/api-key-config/api-key-config.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'agents/create', component: AgentCreateComponent, canActivate: [authGuard] },
  { path: 'agents/:id', component: AgentDetailComponent, canActivate: [authGuard] },
  { path: 'settings/api-key', component: ApiKeyConfigComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/dashboard' }
];
