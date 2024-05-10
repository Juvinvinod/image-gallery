import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './material/material.module';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ImageDetailsComponent } from './image-details/image-details.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, ToolbarComponent, ImageDetailsComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, MaterialModule],
  providers: [provideAnimationsAsync()],
  bootstrap: [AppComponent],
})
export class AppModule {}
