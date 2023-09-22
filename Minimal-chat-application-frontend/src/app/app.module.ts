import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { WINDOW } from './components/chat/chat.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { ChatComponent } from './components/chat/chat.component';
import { ChatWithUserComponent } from './components/chat-with-user/chat-with-user.component';
import { FormsModule } from '@angular/forms'; // Import FormsModule


@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    HomeComponent,
    NavbarComponent,
    LoginComponent,
    ChatComponent,
    ChatWithUserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ToastrModule.forRoot(
      {
        timeOut: 3000, // Duration for which the toast will be shown (in milliseconds)
        easing: 'ease-in', // Easing type for the animation
      }
    ),
  ],
  providers: [
    provideAnimations(), // required animations providers
    provideToastr(), // Toastr providers
    {
      provide: WINDOW,
    useValue: window,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
