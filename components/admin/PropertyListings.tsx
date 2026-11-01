'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Filter,
  X,
  Save,
  DollarSign,
  MapPin,
  Bed,
  Bath,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useApi } from '@/hooks/useApi';
import { format } from 'date-fns';

interface Property {
  _id: string;
  title: string;
  description?: string;
  city: string;
  state?: string;
  address?: string;
  roomType: string;
  rent: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  ownerName: string;
  ownerEmail?: string;
  status: 'available' | 'booked' | 'hidden' | 'pending' | 'active';
  isAvailable?: boolean;
  isApproved: boolean;
  createdAt: string;
  amenities?: string[];
  images?: string[];
}

interface EditForm {
  title: string;
  description: string;
  price: number;           // maps to rent
  city: string;
  state: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: string;
  isAvailable: boolean;
  amenities: string;       // comma separated for easy editing
}

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'studio', 'condo', 'cabin'];

export default function PropertyListings() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    title: '', description: '', price: 0, city: '', state: '', address: '',
    bedrooms: 1, bathrooms: 1, area: 0, propertyType: 'apartment', isAvailable: true, amenities: '',
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const { authHeaders } = useApi();

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/properties');
      const raw = res.data.properties || [];
      const mapped: Property[] = raw.map((p: any) => ({
        _id: p._id,
        title: p.title,
        description: p.description || '',
        city: p.location?.city || 'N/A',
        state: p.location?.state || '',
        address: p.location?.address || '',
        roomType: p.propertyType || 'apartment',
        rent: p.price || 0,
        bedrooms: p.bedrooms || 1,
        bathrooms: p.bathrooms || 1,
        area: p.area || 0,
        ownerName: p.ownerName || 'Unknown',
        ownerEmail: p.ownerEmail || '',
        status: p.status === 'active' ? 'available' : (p.status || 'pending'),
        isAvailable: p.isAvailable !== false,
        isApproved: p.isVerified || false,
        createdAt: p.createdAt,
        amenities: p.amenities || [],
        images: p.images || [],
      }));
      setProperties(mapped);
    } catch {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  useEffect(() => {
    let filtered = properties;
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter((p) => p.status === statusFilter);
    setFilteredProperties(filtered);
  }, [properties, searchTerm, statusFilter]);

  const openEdit = (p: Property) => {
    setEditingProperty(p);
    setEditForm({
      title: p.title,
      description: p.description || '',
      price: p.rent,
      city: p.city,
      state: p.state || '',
      address: p.address || '',
      bedrooms: p.bedrooms || 1,
      bathrooms: p.bathrooms || 1,
      area: p.area || 0,
      propertyType: p.roomType,
      isAvailable: p.isAvailable !== false,
      amenities: (p.amenities || []).join(', '),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProperty) return;
    setSaveLoading(true);
    try {
      const payload = {
        title: editForm.title,
        description: editForm.description,
        price: Number(editForm.price),
        location: {
          city: editForm.city,
          state: editForm.state,
          address: editForm.address,
          country: 'India',
        },
        bedrooms: Number(editForm.bedrooms),
        bathrooms: Number(editForm.bathrooms),
        area: Number(editForm.area) || undefined,
        propertyType: editForm.propertyType,
        isAvailable: editForm.isAvailable,
        amenities: editForm.amenities.split(',').map((a) => a.trim()).filter(Boolean),
      };

      await axios.put(`/api/properties/${editingProperty._id}`, payload, authHeaders());

      setProperties((prev) =>
        prev.map((p) =>
          p._id === editingProperty._id
            ? {
                ...p,
                title: editForm.title,
                description: editForm.description,
                rent: Number(editForm.price),
                city: editForm.city,
                state: editForm.state,
                address: editForm.address,
                bedrooms: Number(editForm.bedrooms),
                bathrooms: Number(editForm.bathrooms),
                area: Number(editForm.area),
                roomType: editForm.propertyType,
                isAvailable: editForm.isAvailable,
                status: editForm.isAvailable ? 'available' : 'booked',
                amenities: editForm.amenities.split(',').map((a) => a.trim()).filter(Boolean),
              }
            : p
        )
      );
      toast.success('Property updated successfully');
      setEditingProperty(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update property');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRentUpdate = async (id: string, newRent: number) => {
    try {
      await axios.patch(`/api/properties/${id}`, { price: Number(newRent) }, authHeaders());
      setProperties((prev) =>
        prev.map((p) => (p._id === id ? { ...p, rent: Number(newRent) } : p))
      );
      toast.success('Rent updated successfully');
    } catch {
      toast.error('Failed to update rent');
    }
  };

  const handleToggleApproval = async (id: string, current: boolean) => {
    try {
      await axios.patch(`/api/admin/properties/${id}`, { isVerified: !current });
      setProperties((prev) => prev.map((p) => (p._id === id ? { ...p, isApproved: !current } : p)));
      toast.success(!current ? 'Property approved' : 'Approval removed');
    } catch {
      toast.error('Failed to update approval');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete Property?',
      text: 'This will permanently delete the property and its inquiries.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`/api/admin/properties/${id}`);
      setProperties((prev) => prev.filter((p) => p._id !== id));
      toast.success('Property deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      available: 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400',
      booked: 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400',
      hidden: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
      pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">Property Listings</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Manage, edit, and control all property listings</p>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search properties…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="hidden">Hidden</option>
            <option value="pending">Pending</option>
          </select>
          <button onClick={fetchProperties} disabled={loading} className="flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <p className="text-xs text-zinc-400 mt-2">{filteredProperties.length} properties</p>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-rose-500 border-t-transparent rounded-full" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <Home className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 dark:text-zinc-400">No properties found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  <th className="px-5 py-3 text-left">Property</th>
                  <th className="px-5 py-3 text-left">Owner</th>
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-left">Monthly Rent</th>
                  <th className="px-5 py-3 text-left">Approval</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredProperties.map((property) => (
                  <tr key={property._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-zinc-900 dark:text-white text-sm">{property.title}</p>
                      <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />{property.city}
                      </p>
                      {property.createdAt && (
                        <p className="text-xs text-zinc-400">{format(new Date(property.createdAt), 'dd MMM yyyy')}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{property.ownerName}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">{property.roomType}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{property.rent.toLocaleString('en-IN')}
                      </span>
                      <p className="text-xs text-zinc-400">/month</p>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleApproval(property._id, property.isApproved)}
                        className="flex items-center gap-1 text-sm"
                      >
                        {property.isApproved ? (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" /> Approved
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <Clock className="w-4 h-4" /> Pending
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(property.status)}`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(property)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                          title="Edit property"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(property._id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                          title="Delete property"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit Property Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {editingProperty && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl shadow-2xl my-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Edit className="w-5 h-5 text-blue-500" /> Edit Property
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">ID: {editingProperty._id}</p>
                </div>
                <button onClick={() => setEditingProperty(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

                {/* Title */}
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase mb-1.5 block">Property Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase mb-1.5 block">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Rent + Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase mb-1.5 block flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> Monthly Rent (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                      className="w-full px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase mb-1.5 block">Property Type</label>
                    <select
                      value={editForm.propertyType}
                      onChange={(e) => setEditForm({ ...editForm, propertyType: e.target.value })}
                      className="w-full px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                    >
                      {PROPERTY_TYPES.map((t) => (
                        <option key={t} value={t} className="capitalize">{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase mb-1.5 block flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Location
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Address"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 sm:col-span-3"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={editForm.state}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      className="px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Bedrooms / Bathrooms / Area */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase mb-1.5 block flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5" /> Bedrooms
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editForm.bedrooms}
                      onChange={(e) => setEditForm({ ...editForm, bedrooms: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase mb-1.5 block flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5" /> Bathrooms
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editForm.bathrooms}
                      onChange={(e) => setEditForm({ ...editForm, bathrooms: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase mb-1.5 block">Area (sq ft)</label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.area}
                      onChange={(e) => setEditForm({ ...editForm, area: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase mb-1.5 block">Amenities (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="WiFi, Parking, AC, Gym…"
                    value={editForm.amenities}
                    onChange={(e) => setEditForm({ ...editForm, amenities: e.target.value })}
                    className="w-full px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Availability toggle */}
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">Property Availability</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {editForm.isAvailable ? 'Visible to tenants — accepting inquiries' : 'Hidden — marked as rented/unavailable'}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditForm({ ...editForm, isAvailable: !editForm.isAvailable })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      editForm.isAvailable
                        ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                    }`}
                  >
                    {editForm.isAvailable ? (
                      <><ToggleRight className="w-5 h-5" /> Available</>
                    ) : (
                      <><ToggleLeft className="w-5 h-5" /> Unavailable</>
                    )}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={handleSaveEdit}
                    disabled={saveLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm disabled:opacity-50"
                  >
                    {saveLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingProperty(null)}
                    className="px-6 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
