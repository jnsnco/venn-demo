import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contacts } from '../api/client';
import Modal from './Modal';

interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateContactModal({ isOpen, onClose }: CreateContactModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    lifecycle_stage: 'lead' as 'lead' | 'prospect' | 'customer' | 'churned',
  });
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => contacts.create(data),
    onSuccess: () => {
      // Invalidate and refetch contacts list
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        title: '',
        lifecycle_stage: 'lead',
      });
      setError('');
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to create contact');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setError('');
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Contact">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input"
            placeholder="John Doe"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input"
            placeholder="john@example.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input"
            placeholder="CEO, Software Engineer, etc."
          />
        </div>

        {/* Lifecycle Stage */}
        <div>
          <label htmlFor="lifecycle_stage" className="block text-sm font-medium text-gray-700 mb-1">
            Lifecycle Stage
          </label>
          <select
            id="lifecycle_stage"
            name="lifecycle_stage"
            value={formData.lifecycle_stage}
            onChange={handleChange}
            className="input"
          >
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="customer">Customer</option>
            <option value="churned">Churned</option>
          </select>
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
            {createMutation.isPending ? 'Creating...' : 'Create Contact'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
