import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { auth } from './api/client';
import Layout from './components/Layout';
import Login from './pages/Login';
import Contacts from './pages/Contacts';
import ContactDetail from './pages/ContactDetail';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import Roadmap from './pages/Roadmap';
import RoadmapDetail from './pages/RoadmapDetail';

function App() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => auth.me().then((res) => res.data),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout user={user} />}>
          <Route index element={<Navigate to="/contacts" replace />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="contacts/:id" element={<ContactDetail />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="roadmap/:id" element={<RoadmapDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
