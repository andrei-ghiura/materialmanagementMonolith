
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MaterialListView from './pages/MaterialListView';
import MaterialView from './pages/MaterialView';
import MaterialAncestorsView from './pages/MaterialAncestorsView';
import ProcessingView from './pages/ProcessingView';
import MaterialFlowView from './pages/MaterialFlowView';
import SettingsPage from './pages/SettingsPage';
import I18nTestPage from './pages/I18nTestPage';
import Layout from './components/ui/Layout';

import './theme/variables.css';
import './theme/buttonTypes.css';

// Initialize i18n
import './i18n';

import { UiStateProvider } from './components/ui/UiStateContext';
import { AlertProvider } from './components/ui/AlertProvider';


const App: React.FC = () => {
  // Use UI state for dark mode
  // const { darkMode, toggleDarkMode } = useUiState();

  return (
    <Router>
      <Layout>
        <Container fluid className="mt-4">
          <Routes>
            <Route path="/" element={<MaterialListView />} />
            <Route path="/material/:id" element={<MaterialView />} />
            <Route path="/material/:id/ancestors" element={<MaterialAncestorsView />} />
            <Route path="/material" element={<MaterialView />} />
            <Route path="/processing" element={<ProcessingView />} />
            <Route path="/flow/:id" element={<MaterialFlowView />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/i18n-test" element={<I18nTestPage />} />
          </Routes>
        </Container>
      </Layout>
    </Router>
  );
};

const AppWithUiState: React.FC = () => (
  <UiStateProvider>
    <AlertProvider>
      <App />
    </AlertProvider>
  </UiStateProvider>
);

export default AppWithUiState;
