import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tickets } from '../api/client';
import { ArrowLeft, Send } from 'lucide-react';
import { format } from 'date-fns';

export default function TicketDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => tickets.get(Number(id)).then((res) => res.data),
    enabled: !!id,
  });

  const addMessageMutation = useMutation({
    mutationFn: (data: { body: string; is_internal: boolean }) =>
      tickets.addMessage(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      setMessage('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      addMessageMutation.mutate({ body: message, is_internal: isInternal });
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!ticket) {
    return <div className="p-8">Ticket not found</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <Link to="/tickets" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} />
          Back to Tickets
        </Link>

        <div className="grid grid-cols-3 gap-6">
          {/* Main content */}
          <div className="col-span-2 space-y-6">
            <div className="card">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{ticket.subject}</h1>
              
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2 font-medium">{ticket.status}</span>
                </div>
                <div>
                  <span className="text-gray-500">Priority:</span>
                  <span className="ml-2 font-medium">{ticket.priority}</span>
                </div>
                <div>
                  <span className="text-gray-500">Channel:</span>
                  <span className="ml-2">{ticket.channel}</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Conversation</h2>
              <div className="space-y-4 mb-6">
                {ticket.messages?.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg ${
                      msg.is_internal ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-sm">
                        {msg.user_name || msg.contact_name || 'Unknown'}
                        {msg.is_internal && (
                          <span className="ml-2 text-xs text-yellow-700 font-normal">(Internal note)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                      </div>
                    </div>
                    <div className="text-gray-700">{msg.body}</div>
                  </div>
                ))}
              </div>

              {/* Reply form */}
              <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={4}
                  className="input mb-3"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded"
                    />
                    Internal note
                  </label>
                  <button type="submit" className="btn btn-primary flex items-center gap-2">
                    <Send size={16} />
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-semibold mb-3">Contact</h3>
              {ticket.contact_name ? (
                <Link to={`/contacts/${ticket.contact_id}`} className="text-primary-600 hover:underline">
                  {ticket.contact_name}
                </Link>
              ) : (
                <span className="text-gray-500">No contact</span>
              )}
              {ticket.contact_email && (
                <div className="text-sm text-gray-600 mt-1">{ticket.contact_email}</div>
              )}
            </div>

            <div className="card">
              <h3 className="font-semibold mb-3">Linked Roadmap Items</h3>
              {ticket.linked_roadmap_items?.length > 0 ? (
                <div className="space-y-2">
                  {ticket.linked_roadmap_items.map((item: any) => (
                    <Link
                      key={item.id}
                      to={`/roadmap/${item.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.status}</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No linked items</div>
              )}
            </div>

            <div className="card">
              <h3 className="font-semibold mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Assigned to:</span>
                  <span className="ml-2">{ticket.assigned_to_name || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2">{format(new Date(ticket.created_at), 'MMM d, yyyy')}</span>
                </div>
                {ticket.resolved_at && (
                  <div>
                    <span className="text-gray-500">Resolved:</span>
                    <span className="ml-2">{format(new Date(ticket.resolved_at), 'MMM d, yyyy')}</span>
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
