import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  // Terminal-style active styling
  const navLinkClass = (path) => 
    `px-4 py-2 text-sm font-bold tracking-widest uppercase transition-all duration-200 border border-transparent flex items-center gap-2 ${
      location.pathname === path 
        ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.4)]' 
        : 'text-gray-400 hover:text-green-400 hover:border-green-500/30 hover:bg-gray-800'
    }`;

  return (
    // font-mono နဲ့ Dark Theme ကို အပြည့်အဝ သုံးထားပါတယ်
    <nav className="bg-gray-900 border-b border-green-500/20 p-4 font-mono shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="container mx-auto flex justify-between items-center max-w-5xl">
        
        {/* Linux Terminal Prompt ပုံစံ Logo လေးပါ */}
        <h1 className="text-xl font-bold tracking-tight text-green-400 flex items-center">
          <span className="text-gray-500 mr-2">root@404SNF:~#</span> 
          RCsys
          <span className="animate-pulse ml-1 text-green-500">_</span>
        </h1>
        
        <div className="space-x-3 flex">
          <Link to="/" className={navLinkClass('/')}>
            {location.pathname === '/' ? '[ SCANNER ]' : 'SCANNER'}
          </Link>
          <Link to="/admin" className={navLinkClass('/admin')}>
            {location.pathname === '/admin' ? '[ ADMIN ]' : 'ADMIN'}
          </Link>
        </div>
        
      </div>
    </nav>
  );
}