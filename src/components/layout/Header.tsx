import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Header() {
  return (
    <header className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          DevExp
        </Link>
        <nav className="space-x-4">
          <Link href="/projects" className="hover:text-gray-300">
            Projets
          </Link>
          <Link href="/register" className="hover:text-gray-300">
            Inscription
          </Link>
          <Button variant="primary">Connexion</Button>
        </nav>
      </div>
    </header>
  );
}