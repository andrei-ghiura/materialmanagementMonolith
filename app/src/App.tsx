import { Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuToggle,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { list, add, cog, gitNetwork } from 'ionicons/icons';
import MaterialListView from './pages/MaterialListView';
import MaterialView from './pages/MaterialView';
import MaterialComponents from './pages/MaterialComponents';
import ProcessingView from './pages/ProcessingView';
import MaterialFlowView from './pages/MaterialFlowView';
import SettingsPage from './pages/SettingsPage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.class.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();


import { useEffect, useState, useCallback } from 'react';
import { ToggleCustomEvent } from '@ionic/react';
import { DarkModeContext } from './contexts/DarkModeContext';

const App: React.FC = () => {
  const [paletteToggle, setPaletteToggle] = useState(false);

  // Add or remove the "ion-palette-dark" class on the html element
  const toggleDarkPalette = useCallback((shouldAdd: boolean) => {
    document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
    // Also save to localStorage for persistence
    localStorage.setItem('darkMode', shouldAdd.toString());
    setPaletteToggle(shouldAdd);
  }, []);

  // Check/uncheck the toggle and update the palette based on isDark
  const initializeDarkPalette = useCallback((isDark: boolean) => {
    setPaletteToggle(isDark);
    document.documentElement.classList.toggle('ion-palette-dark', isDark);
  }, []);

  // Listen for the toggle check/uncheck to toggle the dark palette
  const toggleChange = useCallback((event: ToggleCustomEvent) => {
    toggleDarkPalette(event.detail.checked);
  }, [toggleDarkPalette]);

  useEffect(() => {
    // Check for saved preference first, then fallback to system preference
    const saved = localStorage.getItem('darkMode');
    let isDark: boolean;

    if (saved !== null) {
      isDark = saved === 'true';
    } else {
      // Use matchMedia to check the user preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      isDark = prefersDark.matches;
    }

    // Initialize the dark palette
    initializeDarkPalette(isDark);

    // Listen for system preference changes only if no saved preference
    if (saved === null) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      const setDarkPaletteFromMediaQuery = (mediaQuery: MediaQueryListEvent) => {
        initializeDarkPalette(mediaQuery.matches);
      };

      prefersDark.addEventListener('change', setDarkPaletteFromMediaQuery);

      return () => {
        prefersDark.removeEventListener('change', setDarkPaletteFromMediaQuery);
      };
    }
  }, [initializeDarkPalette]);

  return (
    <DarkModeContext.Provider value={{ paletteToggle, toggleChange, toggleDarkPalette }}>
      <IonApp>
        <IonReactRouter>
          <IonMenu contentId="main-content" type="overlay">
            <IonHeader>
              <IonToolbar>
                <IonTitle>Meniu</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <IonList>
                <IonMenuToggle autoHide={false}>
                  <IonItem routerLink="/" routerDirection="root">
                    <IonIcon slot="start" icon={list} />
                    <IonLabel>Listă Materiale</IonLabel>
                  </IonItem>
                  <IonItem routerLink="/material" routerDirection="forward">
                    <IonIcon slot="start" icon={add} />
                    <IonLabel>Material Nou</IonLabel>
                  </IonItem>
                  <IonItem routerLink="/processing" routerDirection="forward">
                    <IonIcon slot="start" icon={cog} />
                    <IonLabel>Procesare Materiale</IonLabel>
                  </IonItem>
                  <IonItem routerLink="/flow" routerDirection="forward">
                    <IonIcon slot="start" icon={gitNetwork} />
                    <IonLabel>Flux Materiale</IonLabel>
                  </IonItem>
                  <IonItem routerLink="/settings" routerDirection="forward">
                    <IonIcon slot="start" icon={cog} />
                    <IonLabel>Setări</IonLabel>
                  </IonItem>
                </IonMenuToggle>
              </IonList>
            </IonContent>
          </IonMenu>

          <IonRouterOutlet id="main-content">
            <Route exact path="/">
              <MaterialListView />
            </Route>
            <Route exact path="/material/:id?">
              <MaterialView />
            </Route>
            <Route exact path="/material/:id/components">
              <MaterialComponents />
            </Route>
            <Route exact path="/processing">
              <ProcessingView />
            </Route>
            <Route exact path="/flow">
              <MaterialFlowView />
            </Route>
            <Route exact path="/settings">
              <SettingsPage />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </DarkModeContext.Provider>
  );
};

export default App;
