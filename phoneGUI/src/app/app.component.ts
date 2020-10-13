import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { NavigationBar } from '@ionic-native/navigation-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private navigationbar: NavigationBar,
    private screenOrientation: ScreenOrientation
  ) {
    this.initializeApp();

  }

  initializeApp() {
    this.platform.ready().then(() => {
        // get current
        this.statusBar.overlaysWebView(true);
        this.statusBar.hide();
        let autoHide: boolean = true;
        this.navigationbar.setUp(autoHide);
        this.splashScreen.hide();
        if(this.platform.is('android')) {
          console.log(this.screenOrientation.type); // logs the current orientation, example: 'landscape'

          // set to landscape
          this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE).then(status => console.log(status)) .catch (e => console.log(e));

        }
    });
  }
}
