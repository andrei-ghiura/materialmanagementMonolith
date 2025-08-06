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
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
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
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
