import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { roadmap } from '../api/client';
import { Plus, ThumbsUp } from 'lucide-react';
import CreateRoadmapItemModal from '../components/CreateRoadmapItemModal';

export default function Roadmap() {
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['roadmap', { page, status }],
    queryFn: () => roadmap.list({ page, status: status || undefined }).then((res) => res.data),
  });

  const statusColors = {
    backlog: 'bg-gray-100 text-gray-800',
    planned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const typeIcons = {
    feature: '✨',
    bug: '🐛',
    improvement: '🔧',
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Roadmap</h1>
            <p className="text-gray-600 mt-1">Plan and track product development</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            New Item
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {['', 'backlog', 'planned', 'in_progress', 'completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {s.replace('_', ' ') || 'All'}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="grid gap-4 mb-6">
              {data?.data.map((item: any) => (
                <Link
                  key={item.id}
                  to={`/roadmap/${item.id}`}
                  className="card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{typeIcons[item.type as keyof typeof typeIcons]}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      </div>
                      {item.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full font-medium ${
                            statusColors[item.status as keyof typeof statusColors]
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                        <span className="text-gray-500">Priority: {item.priority}</span>
                        {item.target_date && (
                          <span className="text-gray-500">Target: {item.target_date}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <ThumbsUp size={16} />
                      <span className="font-medium">{item.vote_count || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data?.pagination && (
              <div className="card flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {data.data.length} of {data.pagination.total} items
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
          </>
        )}

        {/* Create Roadmap Item Modal */}
        <CreateRoadmapItemModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </div>
  );
}
