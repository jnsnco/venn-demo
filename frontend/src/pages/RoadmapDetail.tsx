import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { roadmap } from '../api/client';
import { ArrowLeft, ThumbsUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function RoadmapDetail() {
  const { id } = useParams();

  const { data: item, isLoading } = useQuery({
    queryKey: ['roadmap', id],
    queryFn: () => roadmap.get(Number(id)).then((res) => res.data),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!item) {
    return <div className="p-8">Roadmap item not found</div>;
  }

  const typeIcons = {
    feature: '✨',
    bug: '🐛',
    improvement: '🔧',
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <Link to="/roadmap" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} />
          Back to Roadmap
        </Link>

        <div className="grid grid-cols-3 gap-6">
          {/* Main content */}
          <div className="col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-4xl">{typeIcons[item.type as keyof typeof typeIcons]}</span>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-medium">{item.status.replace('_', ' ')}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">Priority: {item.priority}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600 capitalize">{item.type}</span>
                  </div>
                </div>
              </div>

              {item.description && (
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
                </div>
              )}
            </div>

            {/* Linked tickets */}
            {item.linked_tickets?.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Related Tickets</h2>
                <div className="space-y-2">
                  {item.linked_tickets.map((ticket: any) => (
                    <Link
                      key={ticket.id}
                      to={`/tickets/${ticket.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div className="font-medium text-sm">{ticket.subject}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {ticket.contact_name} • {ticket.status}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Voters */}
            {item.voters?.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Voters ({item.vote_count})</h2>
                <div className="space-y-2">
                  {item.voters.slice(0, 10).map((voter: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <div className="font-medium text-sm">{voter.name || 'Anonymous'}</div>
                        {voter.organization_name && (
                          <div className="text-xs text-gray-500">{voter.organization_name}</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(voter.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <button className="w-full btn btn-primary flex items-center justify-center gap-2">
                <ThumbsUp size={16} />
                Vote ({item.vote_count || 0})
              </button>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-3">Timeline</h3>
              <div className="space-y-3 text-sm">
                {item.target_date && (
                  <div className="flex items-start gap-2">
                    <Calendar size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-gray-500">Target date</div>
                      <div className="font-medium">{format(new Date(item.target_date), 'MMM d, yyyy')}</div>
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-gray-500">Created</div>
                  <div className="font-medium">{format(new Date(item.created_at), 'MMM d, yyyy')}</div>
                  {item.created_by_name && (
                    <div className="text-xs text-gray-500">by {item.created_by_name}</div>
                  )}
                </div>
                {item.completed_at && (
                  <div>
                    <div className="text-gray-500">Completed</div>
                    <div className="font-medium">{format(new Date(item.completed_at), 'MMM d, yyyy')}</div>
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
