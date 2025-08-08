
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MaterialListView from './pages/MaterialListView';
import MaterialView from './pages/MaterialView';
import ProcessingView from './pages/ProcessingView';
import MaterialFlowView from './pages/MaterialFlowView';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/ui/Layout';

import './theme/variables.css';
import './theme/buttonTypes.css';



import { UiStateProvider } from './components/ui/UiStateContext';


const App: React.FC = () => {
  // Use UI state for dark mode
  // const { darkMode, toggleDarkMode } = useUiState();

  return (
    <Router>
      <Layout>
        <Container className="mt-4">
          <Routes>
            <Route path="/" element={<MaterialListView />} />
            <Route path="/material/:id" element={<MaterialView />} />
            <Route path="/material" element={<MaterialView />} />
            <Route path="/processing" element={<ProcessingView />} />
            <Route path="/flow/:id" element={<MaterialFlowView />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Container>
      </Layout>
    </Router>
  );
};

const AppWithUiState: React.FC = () => (
  <UiStateProvider>
    <App />
  </UiStateProvider>
);

export default AppWithUiState;
