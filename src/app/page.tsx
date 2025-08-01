import Dashboard from '@/components/Dashboard';
import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <Dashboard />
      </main>
    </div>
  );
}
