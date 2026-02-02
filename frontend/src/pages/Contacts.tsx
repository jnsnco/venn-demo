import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { contacts } from '../api/client';
import { Search, Plus, Mail, Phone } from 'lucide-react';
import CreateContactModal from '../components/CreateContactModal';

export default function Contacts() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', { page, search }],
    queryFn: () => contacts.list({ page, search: search || undefined }).then((res) => res.data),
  });

  const lifecycleColors = {
    lead: 'bg-blue-100 text-blue-800',
    prospect: 'bg-yellow-100 text-yellow-800',
    customer: 'bg-green-100 text-green-800',
    churned: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-600 mt-1">Manage your customer relationships</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            New Contact
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tickets
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.data.map((contact: any) => (
                  <tr key={contact.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4">
                      <Link to={`/contacts/${contact.id}`} className="font-medium text-gray-900 hover:text-primary-600">
                        {contact.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {contact.organization_name || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          lifecycleColors[contact.lifecycle_stage as keyof typeof lifecycleColors]
                        }`}
                      >
                        {contact.lifecycle_stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contact.ticket_count || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-gray-400 hover:text-gray-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail size={16} />
                          </a>
                        )}
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-gray-400 hover:text-gray-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {data?.pagination && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {data.data.length} of {data.pagination.total} contacts
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * data.pagination.limit >= data.pagination.total}
                    className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Contact Modal */}
        <CreateContactModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </div>
  );
}
