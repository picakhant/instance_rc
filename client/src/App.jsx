import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScannerPage from './pages/ScannerPage';
import AdminPage from './pages/AdminPage';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <Router>
      {/* 
        Dark Terminal Theme အတွက် အဓိက Root Layout 
        bg-black နဲ့ font-mono ကို အခြေခံထားပြီး text အားလုံးကို အစိမ်းရောင်ဘက် သွားထားပါတယ်
      */}
      <div className="min-h-screen bg-black text-green-400 font-mono selection:bg-green-500/30">
        <Navbar />
        
        {/* Navbar မှာ max-w-5xl သုံးထားလို့ ဒီမှာလည်း 5xl ပြောင်းပေးထားပါတယ် */}
        <main className="container mx-auto p-4 max-w-5xl mt-6">
          <Routes>
            <Route path="/" element={<ScannerPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}