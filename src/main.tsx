import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ProgressProvider } from './context/ProgressContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<BrowserRouter><ProgressProvider><App /></ProgressProvider></BrowserRouter>);
