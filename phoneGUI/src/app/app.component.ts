import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { NavigationBar } from '@ionic-native/navigation-bar';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, screenOrientation: ScreenOrientation, navigationbar:  NavigationBar) {
    platform.ready().then(() => {
      // get current
      statusBar.overlaysWebView(true);
      statusBar.hide();
      let autoHide: boolean = true;
      navigationbar.setUp(autoHide);
      splashScreen.hide();
      if(platform.is('android')) {
        console.log(screenOrientation.type); // logs the current orientation, example: 'landscape'

        // set to portrait
        screenOrientation.lock(screenOrientation.ORIENTATIONS.LANDSCAPE);

      }
    });
  }
}
