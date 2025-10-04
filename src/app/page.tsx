import { redirect } from 'next/navigation';

export default function Home() {
  // The middleware will handle redirection based on auth status
  redirect('/dashboard');
  return null;
}
