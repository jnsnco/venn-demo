import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tickets, contacts } from '../api/client';
import Modal from './Modal';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTicketModal({ isOpen, onClose }: CreateTicketModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    subject: '',
    contact_id: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    channel: 'web' as 'email' | 'chat' | 'phone' | 'web',
    body: '',
  });
  const [error, setError] = useState('');

  // Fetch contacts for dropdown
  const { data: contactsData } = useQuery({
    queryKey: ['contacts-all'],
    queryFn: () => contacts.list({ limit: 100 }).then((res) => res.data),
    enabled: isOpen, // Only fetch when modal is open
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => tickets.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setFormData({
        subject: '',
        contact_id: '',
        priority: 'medium',
        channel: 'web',
        body: '',
      });
      setError('');
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to create ticket');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return;
    }

    if (!formData.contact_id) {
      setError('Please select a contact');
      return;
    }

    setError('');
    
    // Convert contact_id to number
    const submitData = {
      ...formData,
      contact_id: parseInt(formData.contact_id),
    };
    
    createMutation.mutate(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Ticket">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="input"
            placeholder="Brief description of the issue"
            required
          />
        </div>

        {/* Contact */}
        <div>
          <label htmlFor="contact_id" className="block text-sm font-medium text-gray-700 mb-1">
            Contact <span className="text-red-500">*</span>
          </label>
          <select
            id="contact_id"
            name="contact_id"
            value={formData.contact_id}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Select a contact</option>
            {contactsData?.data.map((contact: any) => (
              <option key={contact.id} value={contact.id}>
                {contact.name} {contact.email && `(${contact.email})`}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="input"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Channel */}
        <div>
          <label htmlFor="channel" className="block text-sm font-medium text-gray-700 mb-1">
            Channel
          </label>
          <select
            id="channel"
            name="channel"
            value={formData.channel}
            onChange={handleChange}
            className="input"
          >
            <option value="email">Email</option>
            <option value="chat">Chat</option>
            <option value="phone">Phone</option>
            <option value="web">Web Form</option>
          </select>
        </div>

        {/* Body/Description */}
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            rows={4}
            className="input"
            placeholder="Detailed description of the issue..."
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary flex-1"
            disabled={createMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
