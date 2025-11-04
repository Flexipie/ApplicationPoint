import { redirect } from 'next/navigation';

export default async function HomePage() {
  // Redirect to dashboard
  redirect('/dashboard');
}
