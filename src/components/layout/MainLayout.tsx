import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#ffffff]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#ffffff] border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl md:text-3xl font-bold text-[#102e45]">Team Manager</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4 md:space-x-8">
              <Link to="/" className="text-[#102e45] hover:text-[#b89333] font-medium text-base md:text-lg">
                Início
              </Link>
              <Link to="/players" className="text-[#102e45] hover:text-[#b89333] font-medium text-base md:text-lg">
                Jogadores
              </Link>
              <Link to="/games" className="text-[#102e45] hover:text-[#b89333] font-medium text-base md:text-lg">
                Jogos
              </Link>
              <Link to="/teams" className="text-[#102e45] hover:text-[#b89333] font-medium text-base md:text-lg">
                Equipas
              </Link>
            </nav>

            <div className="flex items-center space-x-2 md:space-x-4">
              <Button variant="outline" className="hidden md:flex border-[#102e45] text-[#102e45] hover:bg-[#102e45] hover:text-white h-10 px-4 md:px-6">
                Entrar
              </Button>
              <Button className="hidden md:flex bg-[#b89333] hover:bg-[#a5822d] text-white h-10 px-4 md:px-6">
                Registar
              </Button>
              <button 
                className="md:hidden p-2 text-[#102e45] hover:text-[#b89333]"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-[#102e45] hover:text-[#b89333] font-medium text-lg py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link 
                to="/players" 
                className="text-[#102e45] hover:text-[#b89333] font-medium text-lg py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Jogadores
              </Link>
              <Link 
                to="/games" 
                className="text-[#102e45] hover:text-[#b89333] font-medium text-lg py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Jogos
              </Link>
              <Link 
                to="/teams" 
                className="text-[#102e45] hover:text-[#b89333] font-medium text-lg py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Equipas
              </Link>
              <div className="flex flex-col space-y-2 pt-4">
                <Button 
                  variant="outline" 
                  className="border-[#102e45] text-[#102e45] hover:bg-[#102e45] hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Entrar
                </Button>
                <Button 
                  className="bg-[#b89333] hover:bg-[#a5822d] text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registar
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16 md:pt-20">
        <div className="container mx-auto px-4 py-4 md:py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#102e45] text-white py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Team Manager</h3>
              <p className="text-sm md:text-lg text-gray-300">
                Gerencie sua equipa de futebol de forma simples e eficiente.
              </p>
            </div>
            <div>
              <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Links Rápidos</h4>
              <ul className="space-y-2 md:space-y-4">
                <li>
                  <Link to="/" className="text-sm md:text-lg text-gray-300 hover:text-[#b89333]">
                    Início
                  </Link>
                </li>
                <li>
                  <Link to="/players" className="text-sm md:text-lg text-gray-300 hover:text-[#b89333]">
                    Jogadores
                  </Link>
                </li>
                <li>
                  <Link to="/games" className="text-sm md:text-lg text-gray-300 hover:text-[#b89333]">
                    Jogos
                  </Link>
                </li>
                <li>
                  <Link to="/teams" className="text-sm md:text-lg text-gray-300 hover:text-[#b89333]">
                    Equipas
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Contato</h4>
              <ul className="space-y-2 md:space-y-4 text-sm md:text-lg text-gray-300">
                <li>Email: contato@teammanager.com</li>
                <li>Telefone: (00) 0000-0000</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Redes Sociais</h4>
              <div className="flex space-x-4 md:space-x-6">
                <a href="#" className="text-gray-300 hover:text-[#b89333]">
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-[#b89333]">
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 md:mt-12 pt-4 md:pt-8 border-t border-gray-700 text-center text-sm md:text-lg text-gray-300">
            <p>&copy; {new Date().getFullYear()} Team Manager. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 