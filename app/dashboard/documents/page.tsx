"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Copy,
  Eye,
  Calendar,
  HardDrive,
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

interface RentalDocument {
  _id: string;
  userId: string;
  documentType: "aadhaar" | "pan" | "rent_agreement" | "police_verification" | "other";
  fileUrl: string;
  fileName: string;
  fileSize: number;
  expiryDate?: string;
  uploadedAt: string;
  isExpired: boolean;
}

interface DocumentShare {
  _id: string;
  documentIds: string[];
  shareToken: string;
  expiresAt: string;
  viewCount: number;
  lastAccessedAt?: string;
  createdAt: string;
}

const DOCUMENT_TYPES = [
  { value: "aadhaar", label: "Aadhaar Card", icon: "🪪" },
  { value: "pan", label: "PAN Card", icon: "💳" },
  { value: "rent_agreement", label: "Rent Agreement", icon: "📄" },
  { value: "police_verification", label: "Police Verification", icon: "👮" },
  { value: "other", label: "Other", icon: "📎" },
];

const MAX_STORAGE_MB = 50;
const MAX_FILE_SIZE_MB = 10;

export default function DocumentVaultPage() {
  const { ready, user: authUser } = useRequireAuth();
  const { accessToken } = useAuthStore();
  const [documents, setDocuments] = useState<RentalDocument[]>([]);
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  
  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  
  // Upload form
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<string>("aadhaar");
  const [uploadExpiry, setUploadExpiry] = useState<string>("");

  const fetchDocuments = useCallback(async () => {
    if (!accessToken) return;
    try {
      const { data } = await axios.get("/api/documents", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setDocuments(data.data || []);
      
      // Calculate storage
      const totalBytes = (data.data || []).reduce((sum: number, doc: RentalDocument) => sum + doc.fileSize, 0);
      setStorageUsed(totalBytes / (1024 * 1024)); // Convert to MB
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const fetchShares = useCallback(async () => {
    if (!accessToken) return;
    try {
      const { data } = await axios.get("/api/documents/share", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setShares(data.data || []);
    } catch (error) {
      console.error("Failed to fetch shares:", error);
    }
  }, [accessToken]);

  useEffect(() => {
    if (ready && authUser && accessToken) {
      fetchDocuments();
      fetchShares();
    }
  }, [ready, authUser, accessToken, fetchDocuments, fetchShares]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File size must be less than ${MAX_FILE_SIZE_MB} MB`);
      return;
    }

    // Validate file type
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed");
      return;
    }

    setUploadFile(file);
  };

  const handleUpload = async () => {
    if (!uploadFile || !accessToken) return;

    // Check storage limit
    const fileSizeMB = uploadFile.size / (1024 * 1024);
    if (storageUsed + fileSizeMB > MAX_STORAGE_MB) {
      toast.error(`Storage limit exceeded. You have ${(MAX_STORAGE_MB - storageUsed).toFixed(1)} MB remaining.`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("documentType", uploadType);
      if (uploadExpiry) formData.append("expiryDate", uploadExpiry);

      await axios.post("/api/documents", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Document uploaded successfully");
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadExpiry("");
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    if (!accessToken) return;

    try {
      await axios.delete(`/api/documents/${docId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast.success("Document deleted");
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete document");
    }
  };

  const handleCreateShare = async () => {
    if (selectedDocs.length === 0) {
      toast.error("Please select at least one document to share");
      return;
    }
    if (!accessToken) return;

    try {
      const { data } = await axios.post(
        "/api/documents/share",
        {
          documentIds: selectedDocs,
          expiresIn: 24 * 60 * 60 * 1000, // 24 hours
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const shareUrl = `${window.location.origin}/share/${data.data.shareToken}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
      setShowShareModal(false);
      setSelectedDocs([]);
      fetchShares();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create share link");
    }
  };

  const toggleDocSelection = (docId: string) => {
    setSelectedDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const getDocumentIcon = (type: string) => {
    return DOCUMENT_TYPES.find((t) => t.value === type)?.icon || "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!ready || !authUser) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  const storagePercent = (storageUsed / MAX_STORAGE_MB) * 100;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">
              Document Vault
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Securely store and share your rental documents
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowShareModal(true)}
              variant="outline"
              disabled={documents.length === 0}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          </div>
        </motion.div>

        {/* Storage Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-zinc-500" />
              <span className="font-semibold text-zinc-900 dark:text-white">
                Storage Usage
              </span>
            </div>
            <span className="text-sm text-zinc-500">
              {storageUsed.toFixed(1)} / {MAX_STORAGE_MB} MB
            </span>
          </div>
          <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(storagePercent, 100)}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`h-full rounded-full ${
                storagePercent > 90
                  ? "bg-red-500"
                  : storagePercent > 70
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
            />
          </div>
        </motion.div>

        {/* Documents Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
          </div>
        ) : documents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
              No documents yet
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
              Upload your first document to get started
            </p>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4" />
              Upload Document
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc, index) => (
              <motion.div
                key={doc._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all group"
              >
                {/* Document Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{getDocumentIcon(doc.documentType)}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                      className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-zinc-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Document Info */}
                <h3 className="font-bold text-zinc-900 dark:text-white mb-1 truncate">
                  {doc.fileName}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3 capitalize">
                  {doc.documentType.replace("_", " ")}
                </p>

                {/* Metadata */}
                <div className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Uploaded {formatDate(doc.uploadedAt)}</span>
                  </div>
                  {doc.expiryDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Expires {formatDate(doc.expiryDate)}
                        {doc.isExpired && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full text-xs font-semibold">
                            Expired
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-3 h-3" />
                    <span>{formatFileSize(doc.fileSize)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Active Shares */}
        {shares.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
              Active Shares
            </h2>
            <div className="space-y-3">
              {shares.map((share) => (
                <div
                  key={share._id}
                  className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Share2 className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {share.documentIds.length} document(s) shared
                      </p>
                      <p className="text-xs text-zinc-500">
                        Expires {formatDate(share.expiresAt)} • {share.viewCount} views
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/share/${share.shareToken}`;
                      navigator.clipboard.writeText(url);
                      toast.success("Link copied!");
                    }}
                    className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Copy className="w-4 h-4 text-zinc-500" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-md w-full border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Upload Document
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* File Input */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Select File
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-950/30 dark:file:text-emerald-400"
                  />
                  {uploadFile && (
                    <p className="text-xs text-zinc-500 mt-2">
                      {uploadFile.name} ({formatFileSize(uploadFile.size)})
                    </p>
                  )}
                </div>

                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Document Type
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white dark:bg-zinc-800 dark:text-white"
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={uploadExpiry}
                    onChange={(e) => setUploadExpiry(e.target.value)}
                    className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!uploadFile || uploading}
                    isLoading={uploading}
                    className="flex-1"
                  >
                    Upload
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-md w-full border border-zinc-200 dark:border-zinc-800 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Share Documents
                </h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Select documents to create a secure share link (expires in 24 hours)
              </p>

              <div className="space-y-2 mb-6">
                {documents.map((doc) => (
                  <label
                    key={doc._id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc._id)}
                      onChange={() => toggleDocSelection(doc._id)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-300"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                        {doc.fileName}
                      </p>
                      <p className="text-xs text-zinc-500 capitalize">
                        {doc.documentType.replace("_", " ")}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowShareModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateShare}
                  disabled={selectedDocs.length === 0}
                  className="flex-1"
                >
                  Create Link
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
