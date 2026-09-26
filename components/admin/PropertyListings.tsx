'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Property {
  _id: string;
  title: string;
  location?: { address: string; city: string; state: string };
  propertyType?: string;
  bedrooms?: number;
  price?: number;
  ownerId?: string;
  ownerName: string;
  status: 'available' | 'booked' | 'hidden' | 'pending' | 'active';
  isVerified?: boolean;
  viewCount?: number;
  averageRating?: number;
  createdAt: string;
}

export default function PropertyListings() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Property>>({});

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/properties');
      const properties = response.data.properties || [];
      
      // Map API response to component structure
      const mappedProperties = properties.map((p: any) => ({
        _id: p._id,
        title: p.title,
        city: p.location?.city || 'N/A',
        roomType: p.propertyType || 'N/A',
        rent: p.price || 0,
        ownerName: p.ownerName || 'Unknown',
        ownerEmail: 'N/A',
        status: p.status === 'active' ? 'available' : (p.status || 'pending'),
        isApproved: p.isVerified || false,
        createdAt: p.createdAt,
      }));
      
      setProperties(mappedProperties);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    let filtered = properties;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    if (approvalFilter === 'approved') {
      filtered = filtered.filter((p) => p.isApproved);
    } else if (approvalFilter === 'pending') {
      filtered = filtered.filter((p) => !p.isApproved);
    }

    setFilteredProperties(filtered);
  }, [properties, searchTerm, statusFilter, approvalFilter]);

  const handleToggleApproval = async (id: string, currentApproval: boolean) => {
    try {
      await axios.patch(`/api/admin/properties/${id}`, {
        isApproved: !currentApproval,
      });
      setProperties((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, isApproved: !currentApproval } : p
        )
      );
      toast.success(
        !currentApproval ? 'Property approved' : 'Property approval removed'
      );
    } catch (error) {
      console.error('Failed to update approval:', error);
      toast.error('Failed to update property');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const statuses = ['available', 'booked', 'hidden'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

    try {
      await axios.patch(`/api/admin/properties/${id}`, {
        status: nextStatus,
      });
      setProperties((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, status: nextStatus as any } : p
        )
      );
      toast.success(`Property marked as ${nextStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/properties/${id}`);
      setProperties((prev) => prev.filter((p) => p._id !== id));
      toast.success('Property deleted');
    } catch (error) {
      console.error('Failed to delete property:', error);
      toast.error('Failed to delete property');
    }
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await axios.patch(`/api/admin/properties/${id}`, editForm);
      setProperties((prev) =>
        prev.map((p) => (p._id === id ? { ...p, ...editForm } : p))
      );
      setEditingId(null);
      toast.success('Property updated');
    } catch (error) {
      console.error('Failed to update property:', error);
      toast.error('Failed to update property');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400';
      case 'booked':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400';
      case 'hidden':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950/30 dark:text-gray-400';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400';
      default:
        return 'bg-zinc-100 text-zinc-800';
    }
  };

  const getApprovalBadge = (approved: boolean) => {
    return approved ? (
      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
        <CheckCircle className="w-4 h-4" />
        Approved
      </span>
    ) : (
      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
        <Clock className="w-4 h-4" />
        Pending Review
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">
            Property Listings
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage all property listings and reviews
          </p>
        </div>
        <button className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors">
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="hidden">Hidden</option>
            <option value="pending">Pending</option>
          </select>

          {/* Approval Filter */}
          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Reviews</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Review</option>
          </select>

          {/* Count Badge */}
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">{filteredProperties.length} results</span>
          </div>
        </div>
      </motion.div>

      {/* Properties Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">No properties found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Rent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Approval
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {(filteredProperties || []).map((property) => (
                  <motion.tr
                    key={property._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {editingId === property._id ? (
                        <input
                          type="text"
                          value={editForm.title || property.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          className="w-full px-3 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                        />
                      ) : (
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {property.title}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {property.city}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                          {property.ownerName}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {property.ownerEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {property.roomType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === property._id ? (
                        <input
                          type="number"
                          value={editForm.rent || property.rent}
                          onChange={(e) =>
                            setEditForm({ ...editForm, rent: Number(e.target.value) })
                          }
                          className="w-20 px-3 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                        />
                      ) : (
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          ₹{(property.rent || 0).toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          handleToggleApproval(property._id, property.isApproved)
                        }
                        className="text-sm transition-colors"
                      >
                        {getApprovalBadge(property.isApproved)}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(property._id, property.status)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(
                          property.status
                        )}`}
                      >
                        {property.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === property._id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(property._id)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-2 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(property._id);
                                setEditForm(property);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(property._id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
