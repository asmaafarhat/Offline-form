import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ConnectionServiceModule } from 'ng-connection-service';
import { ToasterContainerComponent } from './toast/toaster-container.component';
import { ToasterComponent } from './toast/toaster.component';

@NgModule({
  declarations: [
    AppComponent,
    ToasterContainerComponent,
    ToasterComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ConnectionServiceModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule, // required animations module
    AppRoutingModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
