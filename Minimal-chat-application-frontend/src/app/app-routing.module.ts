import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guard/auth.guard';
import { ChatComponent } from './components/chat/chat.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, 
  { path: 'home', component: HomeComponent,canActivate: [AuthGuard] },           
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent},
  { path: 'message', component: ChatComponent},
  { path: '**', redirectTo: '/' }               
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
