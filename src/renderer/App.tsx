import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import LineChartComponent from './components/LineChartComponent';
import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LineChartComponent />} />
      </Routes>
    </Router>
  );
}
