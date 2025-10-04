import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the agreement page by default.
  redirect('/agreement');
}
