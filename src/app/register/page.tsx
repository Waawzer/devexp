'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        setFormData({ username: '', email: '', password: '' });
      } else {
        setMessage(result.message || 'Erreur lors de l’inscription.');
      }
    } catch (error) {
      setMessage('Erreur serveur. Veuillez réessayer plus tard.');
      console.error('Erreur lors de la soumission:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Inscription à DevExp</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Pseudo"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Mot de passe"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Button type="submit" variant="primary" className="w-full">
          S’inscrire
        </Button>
      </form>
      {message && (
        <p
          className={`mt-4 text-center ${
            message.includes('réussie') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}