import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 md:h-24 bg-white border-b border-black/10 z-20">
      <div className="container mx-auto h-full px-4 md:px-6">
        <div className="h-full flex items-center justify-between">
          {/* Logo Douro United */}
          <Link to="/" className="flex items-center">
            <img 
              src="/Douro_United.png" 
              alt="Douro United" 
              className="h-16 w-auto md:h-20 mr-2" 
            />
            <span className="text-black font-bold text-xl md:text-2xl">Douro United</span>
          </Link>
          
          {/* Menu de Navegação Desktop */}
          <ul className="hidden md:flex items-center gap-4 md:gap-8">
            <li>
              <Link
                to="/"
                className={`relative px-3 md:px-4 py-2 transition-all duration-300
                  ${isActive('/') 
                    ? 'text-[#a07f40]' 
                    : 'text-black hover:text-[#a07f40]'
                  }`}
              >
                <span className="text-sm md:text-base font-medium">Dashboard</span>
                {isActive('/') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#a07f40] transform origin-left transition-all duration-300"></span>
                )}
              </Link>
            </li>
            <li>
              <Link
                to="/players"
                className={`relative px-3 md:px-4 py-2 transition-all duration-300
                  ${isActive('/players') 
                    ? 'text-[#a07f40]' 
                    : 'text-black hover:text-[#a07f40]'
                  }`}
              >
                <span className="text-sm md:text-base font-medium">Jogadores</span>
                {isActive('/players') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#a07f40] transform origin-left transition-all duration-300"></span>
                )}
              </Link>
            </li>
            <li>
              <Link
                to="/matches"
                className={`relative px-3 md:px-4 py-2 transition-all duration-300
                  ${isActive('/matches') 
                    ? 'text-[#a07f40]' 
                    : 'text-black hover:text-[#a07f40]'
                  }`}
              >
                <span className="text-sm md:text-base font-medium">Jogos</span>
                {isActive('/matches') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#a07f40] transform origin-left transition-all duration-300"></span>
                )}
              </Link>
            </li>
            <li>
              <Link
                to="/team-builder"
                className={`relative px-3 md:px-4 py-2 transition-all duration-300
                  ${isActive('/team-builder') 
                    ? 'text-[#a07f40]' 
                    : 'text-black hover:text-[#a07f40]'
                  }`}
              >
                <span className="text-sm md:text-base font-medium">Equipas</span>
                {isActive('/team-builder') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#a07f40] transform origin-left transition-all duration-300"></span>
                )}
              </Link>
            </li>
            <li>
              <Link
                to="/history"
                className={`relative px-3 md:px-4 py-2 transition-all duration-300
                  ${isActive('/history') 
                    ? 'text-[#a07f40]' 
                    : 'text-black hover:text-[#a07f40]'
                  }`}
              >
                <span className="text-sm md:text-base font-medium">Histórico</span>
                {isActive('/history') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#a07f40] transform origin-left transition-all duration-300"></span>
                )}
              </Link>
            </li>
            <li>
              <Link
                to="/stats"
                className={`relative px-3 md:px-4 py-2 transition-all duration-300
                  ${isActive('/stats') 
                    ? 'text-[#a07f40]' 
                    : 'text-black hover:text-[#a07f40]'
                  }`}
              >
                <span className="text-sm md:text-base font-medium">Estatísticas</span>
                {isActive('/stats') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#a07f40] transform origin-left transition-all duration-300"></span>
                )}
              </Link>
            </li>
          </ul>

          {/* Botão do Menu Mobile */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-[#b89333]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 bg-white z-30">
          <div className="container mx-auto px-4 py-4">
            <ul className="flex flex-col space-y-4">
              <li>
                <Link
                  to="/"
                  className={`block px-4 py-2 text-lg font-medium transition-all duration-300
                    ${isActive('/') 
                      ? 'text-[#a07f40]' 
                      : 'text-gray-600 hover:text-[#a07f40]'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/players"
                  className={`block px-4 py-2 text-lg font-medium transition-all duration-300
                    ${isActive('/players') 
                      ? 'text-[#a07f40]' 
                      : 'text-gray-600 hover:text-[#a07f40]'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Jogadores
                </Link>
              </li>
              <li>
                <Link
                  to="/matches"
                  className={`block px-4 py-2 text-lg font-medium transition-all duration-300
                    ${isActive('/matches') 
                      ? 'text-[#a07f40]' 
                      : 'text-gray-600 hover:text-[#a07f40]'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Jogos
                </Link>
              </li>
              <li>
                <Link
                  to="/team-builder"
                  className={`block px-4 py-2 text-lg font-medium transition-all duration-300
                    ${isActive('/team-builder') 
                      ? 'text-[#a07f40]' 
                      : 'text-gray-600 hover:text-[#a07f40]'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Equipas
                </Link>
              </li>
              <li>
                <Link
                  to="/history"
                  className={`block px-4 py-2 text-lg font-medium transition-all duration-300
                    ${isActive('/history') 
                      ? 'text-[#a07f40]' 
                      : 'text-gray-600 hover:text-[#a07f40]'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Histórico
                </Link>
              </li>
              <li>
                <Link
                  to="/stats"
                  className={`block px-4 py-2 text-lg font-medium transition-all duration-300
                    ${isActive('/stats') 
                      ? 'text-[#a07f40]' 
                      : 'text-gray-600 hover:text-[#a07f40]'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Estatísticas
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
