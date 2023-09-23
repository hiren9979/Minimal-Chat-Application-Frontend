import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guard/auth.guard';
import { ChatComponent } from './components/chat/chat.component';
import { RequestlogComponent } from './components/requestlog/requestlog.component';
import { ErrorComponent } from './components/error/error.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, 
  { path: 'home', component: HomeComponent},           
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent},
  { path: 'chat', component: ChatComponent},
  { path: 'requestLog' , component: RequestlogComponent,canActivate: [AuthGuard]},
  { path: '**', component : ErrorComponent }               
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
