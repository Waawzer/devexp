export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} DevExp. Tous droits réservés.</p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:text-gray-300">
            À propos
          </a>
          <a href="#" className="hover:text-gray-300">
            Contact
          </a>
          <a href="#" className="hover:text-gray-300">
            Mentions légales
          </a>
        </div>
      </div>
    </footer>
  );
}