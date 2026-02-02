import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tickets, roadmap } from '../api/client';
import { Plus } from 'lucide-react';

interface LinkRoadmapItemFormProps {
  ticketId: number;
}

export default function LinkRoadmapItemForm({ ticketId }: LinkRoadmapItemFormProps) {
  const queryClient = useQueryClient();
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  // Fetch roadmap items for dropdown
  const { data: roadmapData } = useQuery({
    queryKey: ['roadmap-all'],
    queryFn: () => roadmap.list({ limit: 100 }).then((res) => res.data),
    enabled: showForm,
  });

  const linkMutation = useMutation({
    mutationFn: (roadmapItemId: number) => tickets.linkRoadmap(ticketId, roadmapItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      setSelectedItemId('');
      setShowForm(false);
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to link roadmap item');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItemId) {
      setError('Please select a roadmap item');
      return;
    }

    setError('');
    linkMutation.mutate(parseInt(selectedItemId));
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
      >
        <Plus size={16} />
        Link Roadmap Item
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-3 p-3 bg-gray-50 rounded-lg">
      <div>
        <label htmlFor="roadmap_item" className="block text-sm font-medium text-gray-700 mb-1">
          Select Roadmap Item
        </label>
        <select
          id="roadmap_item"
          value={selectedItemId}
          onChange={(e) => setSelectedItemId(e.target.value)}
          className="input text-sm"
        >
          <option value="">Choose an item...</option>
          {roadmapData?.data.map((item: any) => (
            <option key={item.id} value={item.id}>
              {item.title} ({item.status})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setSelectedItemId('');
            setError('');
          }}
          className="btn btn-secondary text-sm flex-1"
          disabled={linkMutation.isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary text-sm flex-1"
          disabled={linkMutation.isPending}
        >
          {linkMutation.isPending ? 'Linking...' : 'Link Item'}
        </button>
      </div>
    </form>
  );
}
