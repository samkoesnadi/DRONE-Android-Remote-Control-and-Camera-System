import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Vibration } from '@ionic-native/vibration';
import { Serial } from '@ionic-native/serial';
import { Hotspot, HotspotNetwork } from '@ionic-native/hotspot';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { CamControlProvider } from '../providers/cam-control/cam-control';
import { HttpClientModule } from '@angular/common/http';
import { NavigationBar } from '@ionic-native/navigation-bar';

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ScreenOrientation,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Vibration,
    Serial,
    Hotspot,
    CamControlProvider,
    NavigationBar
  ]
})
export class AppModule {}
