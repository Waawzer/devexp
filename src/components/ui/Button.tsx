import { ReactNode } from 'react';

type ButtonProps = {
  variant?: 'primary' | 'secondary';
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ variant = 'primary', children, ...props }: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded font-semibold focus:outline-none';
  const variantStyles =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-gray-300 text-gray-800 hover:bg-gray-400';

  return (
    <button className={`${baseStyles} ${variantStyles}`} {...props}>
      {children}
    </button>
  );
}