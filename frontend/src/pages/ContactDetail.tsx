import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contacts } from '../api/client';
import { ArrowLeft, Mail, Phone, Building } from 'lucide-react';
import { format } from 'date-fns';

export default function ContactDetail() {
  const { id } = useParams();

  const { data: contact, isLoading } = useQuery({
    queryKey: ['contact', id],
    queryFn: () => contacts.get(Number(id)).then((res) => res.data),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!contact) {
    return <div className="p-8">Contact not found</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/contacts" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} />
          Back to Contacts
        </Link>

        <div className="grid grid-cols-3 gap-6">
          {/* Main info */}
          <div className="col-span-2 space-y-6">
            <div className="card">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{contact.name}</h1>
              
              <div className="grid grid-cols-2 gap-4">
                {contact.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={16} />
                    <a href={`mailto:${contact.email}`} className="hover:text-primary-600">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} />
                    <a href={`tel:${contact.phone}`} className="hover:text-primary-600">
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.organization_name && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building size={16} />
                    {contact.organization_name}
                  </div>
                )}
                {contact.title && (
                  <div className="text-gray-600">
                    <span className="text-gray-500">Title:</span> {contact.title}
                  </div>
                )}
              </div>
            </div>

            {/* Activity timeline */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Activity Timeline</h2>
              {contact.activities?.length > 0 ? (
                <div className="space-y-4">
                  {contact.activities.map((activity: any) => (
                    <div key={activity.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                      <div className="text-sm text-gray-500 w-32">
                        {format(new Date(activity.created_at), 'MMM d, yyyy')}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{activity.subject}</div>
                        {activity.body && <div className="text-sm text-gray-600 mt-1">{activity.body}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">No activity yet</div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-semibold mb-3">Open Tickets</h3>
              {contact.open_tickets?.length > 0 ? (
                <div className="space-y-2">
                  {contact.open_tickets.map((ticket: any) => (
                    <Link
                      key={ticket.id}
                      to={`/tickets/${ticket.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div className="font-medium text-sm">{ticket.subject}</div>
                      <div className="text-xs text-gray-500 mt-1">{ticket.status}</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No open tickets</div>
              )}
            </div>

            <div className="card">
              <h3 className="font-semibold mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Stage:</span>
                  <span className="ml-2 font-medium">{contact.lifecycle_stage}</span>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2">{format(new Date(contact.created_at), 'MMM d, yyyy')}</span>
                </div>
                {contact.last_contact_at && (
                  <div>
                    <span className="text-gray-500">Last contact:</span>
                    <span className="ml-2">{format(new Date(contact.last_contact_at), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
