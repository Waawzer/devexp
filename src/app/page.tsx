import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Bienvenue sur DevExp</h1>
      <p className="text-lg mb-6">
        Une plateforme pour connecter développeurs et clients dans un esprit de collaboration.
      </p>
      <div className="space-x-4">
        <Button variant="primary">S&apos;inscrire</Button>
        <Button variant="secondary">Se connecter</Button>
      </div>
    </div>
  );
}