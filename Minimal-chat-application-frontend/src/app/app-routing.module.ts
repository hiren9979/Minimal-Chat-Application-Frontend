import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guard/auth.guard';
import { ChatComponent } from './components/chat/chat.component';
import { RequestlogComponent } from './components/requestlog/requestlog.component';
import { ErrorComponent } from './components/error/error.component';
import { ActivityComponent } from './components/activity/activity.component';
import { LoginGuard } from './guard/login.guard';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, 
  { path: 'home', component: HomeComponent},           
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent,canActivate : [LoginGuard]},
  { path: 'activity', component : ActivityComponent},
  { path: 'chat', component: ChatComponent,canActivate: [AuthGuard]},
  { path: 'requestLog' , component: RequestlogComponent,canActivate: [AuthGuard]},
  { path: '**', component : ErrorComponent }               
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
