import React, { useState } from 'react';
import {
  FileText,
  Box,
  Search,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Clock,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Save,
  Check,
  Upload,
  Download,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DocumentCategory, Document } from '../types';

export function parseAndValidateExpiryDate(dateStr: string): { isValid: boolean; storageValue: string | null; error?: string } {
  if (!dateStr || dateStr.trim() === '') {
    return { isValid: true, storageValue: null }; // Optional: blank is valid
  }

  const trimmed = dateStr.trim();

  // Format 1: YYYY-MM-DD
  const isoPattern = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  const isoMatch = trimmed.match(isoPattern);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) {
      return { isValid: true, storageValue: trimmed };
    }
  }

  // Format 2: Mon YYYY or Month YYYY (e.g. "Oct 2026", "October 2026")
  const monthsMap: Record<string, string> = {
    jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03',
    apr: '04', april: '04', may: '05', jun: '06', june: '06', jul: '07', july: '07',
    aug: '08', august: '08', sep: '09', september: '09', oct: '10', october: '10',
    nov: '11', november: '11', dec: '12', december: '12'
  };
  const monthYearPattern = /^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})$/i;
  const myMatch = trimmed.match(monthYearPattern);
  if (myMatch) {
    const mStr = myMatch[1].toLowerCase();
    const year = parseInt(myMatch[2], 10);
    if (monthsMap[mStr] && year >= 1900 && year <= 2100) {
      return { isValid: true, storageValue: `${year}-${monthsMap[mStr]}-01` };
    }
  }

  // Format 3: MM/YYYY or MM-YYYY
  const mmyyyyPattern = /^(0[1-9]|1[0-2])[/-](\d{4})$/;
  const mmMatch = trimmed.match(mmyyyyPattern);
  if (mmMatch) {
    const mm = mmMatch[1];
    const year = parseInt(mmMatch[2], 10);
    if (year >= 1900 && year <= 2100) {
      return { isValid: true, storageValue: `${year}-${mm}-01` };
    }
  }

  return {
    isValid: false,
    storageValue: null,
    error: 'Invalid format. Use YYYY-MM-DD (e.g. 2027-12-31) or Mon YYYY (e.g. Oct 2026).'
  };
}

export function isValidExpiryDate(dateStr: string): boolean {
  return parseAndValidateExpiryDate(dateStr).isValid;
}

export const ShadowVault: React.FC = () => {
  const { documents, setDocuments, addDocument, updateDocument, deleteDocument, assets } = useApp();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Inspection modal state
  const [selectedDocModal, setSelectedDocModal] = useState<Document | null>(null);
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);

  // Form modal state (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  // Upload file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<DocumentCategory>('Identity');
  const [formDescription, setFormDescription] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formRelatedAsset, setFormRelatedAsset] = useState<string>('');
  const [formEmergencyRelevance, setFormEmergencyRelevance] = useState<'Critical' | 'High' | 'Moderate' | 'Low'>('High');
  const [formAccessLevel, setFormAccessLevel] = useState('Important');

  const isExpiryValid = isValidExpiryDate(formExpiryDate);

  // Delete confirmation modal state
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<Document | null>(null);

  const categories = ['All', 'Identity', 'Medical', 'Insurance', 'Vehicle', 'Property', 'Legal', 'Other'];

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.relatedAsset && doc.relatedAsset.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const openAddModal = () => {
    setEditingDocId(null);
    setSelectedFile(null);
    setUploadError(null);
    setFormName('');
    setFormCategory('Identity');
    setFormDescription('');
    setFormExpiryDate('');
    setFormRelatedAsset('');
    setFormEmergencyRelevance('High');
    setFormAccessLevel('Important');
    setIsFormOpen(true);
  };

  const openEditModal = (doc: Document, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingDocId(doc.id);
    setSelectedFile(null);
    setUploadError(null);
    setFormName(doc.name);
    setFormCategory(doc.category);
    setFormDescription(doc.description);
    setFormExpiryDate(doc.expiryDate || '');
    setFormRelatedAsset(doc.relatedAsset || '');
    setFormEmergencyRelevance(doc.emergencyRelevance);
    setFormAccessLevel(doc.accessLevel || 'Important');
    setSelectedDocModal(null);
    setIsFormOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    // Validate and normalize Expiry Date format
    const expiryCheck = parseAndValidateExpiryDate(formExpiryDate);
    if (!expiryCheck.isValid) {
      setUploadError(expiryCheck.error || 'Invalid date format. Use YYYY-MM-DD (e.g. 2027-12-31) or Mon YYYY (e.g. Oct 2026), or leave blank.');
      return;
    }
    const normalizedExpiry = expiryCheck.storageValue;

    if (editingDocId) {
      updateDocument(editingDocId, {
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
        expiryDate: normalizedExpiry || undefined,
        relatedAsset: formRelatedAsset || undefined,
        emergencyRelevance: formEmergencyRelevance,
        accessLevel: formAccessLevel
      });

      if (isSupabaseConfigured && supabase && user?.id) {
        supabase
          .from('documents')
          .update({
            name: formName.trim(),
            category: formCategory,
            description: formDescription.trim(),
            expiry_date: normalizedExpiry,
            related_asset: formRelatedAsset || null,
            emergency_access_level: formEmergencyRelevance === 'Critical' ? 'Critical' : 'Important'
          })
          .eq('id', editingDocId)
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) console.warn('[Vault] Error updating document in Supabase:', error.message);
          });
      }

      setIsFormOpen(false);
      return;
    }

    // New Document Upload Flow
    setIsUploading(true);
    setUploadError(null);

    // Verify authenticated user's session exists at upload time and matches user.id
    if (isSupabaseConfigured && supabase) {
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      const authUid = sessionData?.session?.user?.id;
      if (sessionErr || !sessionData?.session || !authUid) {
        setIsUploading(false);
        setUploadError('Active authentication session not found. Please log in again.');
        return;
      }
      if (authUid !== user?.id) {
        setIsUploading(false);
        setUploadError('Authentication error: auth.uid() does not match the active user profile.');
        return;
      }
    }

    let filePath = '';
    let fileSize = selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : '0.1 MB';
    let fileType = selectedFile
      ? selectedFile.type.includes('pdf')
        ? 'PDF'
        : selectedFile.type.includes('png')
        ? 'PNG'
        : 'JPEG'
      : 'PDF';

    if (selectedFile) {
      if (selectedFile.size > 2 * 1024 * 1024) {
        setIsUploading(false);
        setUploadError('File is too large. Maximum allowed size is 2 MB.');
        return;
      }
      const validMime = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      const validExt = /\.(pdf|png|jpe?g)$/i.test(selectedFile.name);
      if (!validMime.includes(selectedFile.type) && !validExt) {
        setIsUploading(false);
        setUploadError('Invalid file type. Only PDF, PNG, and JPEG/JPG are allowed.');
        return;
      }
    }

    try {
      if (selectedFile && isSupabaseConfigured && supabase && user?.id) {
        const fileExt = selectedFile.name.split('.').pop() || 'pdf';
        const storagePath = `${user.id}/doc-${Date.now()}.${fileExt}`;
        const { error: upErr } = await supabase.storage
          .from('documents')
          .upload(storagePath, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (upErr) {
          const status = (upErr as any).status || (upErr as any).statusCode || 'UNKNOWN';
          console.error('[DocumentUpload] Storage upload failed:', {
            message: upErr.message,
            name: upErr.name,
            status: (upErr as any).status,
            statusCode: (upErr as any).statusCode || (upErr as any).status,
            details: (upErr as any).details || (upErr as any).error,
            hint: (upErr as any).hint
          });
          throw new Error(`Upload failed: ${upErr.message}${status !== 'UNKNOWN' ? ` (${status})` : ''}`);
        }
        filePath = storagePath;
      }

      // Save to Supabase and local state
      if (isSupabaseConfigured && supabase && user?.id) {
        const { data: docRow, error: insErr } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            name: formName.trim(),
            category: formCategory,
            description: formDescription.trim(),
            expiry_date: normalizedExpiry,
            related_asset: formRelatedAsset || null,
            emergency_access_level: formEmergencyRelevance === 'Critical' ? 'Critical' : 'Important',
            file_path: filePath,
            file_size: fileSize,
            file_type: fileType
          })
          .select()
          .single();

        if (insErr) {
          // Rollback uploaded storage object to prevent orphan files
          if (filePath) {
            console.warn('[DocumentUpload] Database insert failed, removing orphaned storage object:', filePath);
            await supabase.storage.from('documents').remove([filePath]).catch((cleanErr) => {
              console.error('[DocumentUpload] Failed to clean up orphaned storage object:', cleanErr);
            });
          }
          console.error('[DocumentUpload] Database insert failed:', {
            message: insErr.message,
            code: insErr.code,
            details: insErr.details,
            hint: insErr.hint
          });
          throw new Error(`Database save failed: ${insErr.message} (Code: ${insErr.code || 'UNKNOWN'})`);
        }

        if (docRow) {
          const newDoc: Document = {
            id: docRow.id,
            userId: user.id,
            name: docRow.name,
            category: docRow.category,
            description: docRow.description || '',
            expiryDate: docRow.expiry_date || undefined,
            relatedAsset: docRow.related_asset || undefined,
            emergencyRelevance: (docRow.emergency_access_level === 'Critical' ? 'Critical' : 'High') as any,
            accessLevel: docRow.emergency_access_level,
            uploadDate: 'Today',
            filePath: docRow.file_path || undefined,
            fileSize: docRow.file_size || fileSize,
            fileType: docRow.file_type || fileType
          };
          setDocuments((prev) => [newDoc, ...prev]);
        }
      } else {
        // Fallback for offline or unauthenticated mode
        addDocument({
          name: formName.trim(),
          category: formCategory,
          description: formDescription.trim(),
          expiryDate: normalizedExpiry || undefined,
          relatedAsset: formRelatedAsset || undefined,
          emergencyRelevance: formEmergencyRelevance,
          accessLevel: formAccessLevel,
          filePath: filePath || undefined,
          fileSize,
          fileType
        });
      }

      setIsFormOpen(false);
    } catch (err: any) {
      console.error('[DocumentUpload] Operation failed:', {
        message: err?.message,
        name: err?.name,
        status: err?.status,
        statusCode: err?.statusCode || err?.status,
        details: err?.details,
        hint: err?.hint
      });
      setUploadError(err.message || 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewDownload = async (doc: Document) => {
    if (!doc.filePath) {
      alert('This document record does not have an attached storage file.');
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      alert('Supabase is not configured.');
      return;
    }

    setIsGeneratingUrl(true);
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.filePath, 3600);

      if (error || !data?.signedUrl) {
        throw new Error(error?.message || 'Failed to generate secure URL.');
      }

      window.open(data.signedUrl, '_blank');
    } catch (err: any) {
      console.error('[Vault] Error generating signed URL:', err);
      alert(`Unable to open document: ${err.message}`);
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmDoc) {
      deleteDocument(deleteConfirmDoc.id);
      setDeleteConfirmDoc(null);
      setSelectedDocModal(null);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl">
      {/* 1. Header & Vault Readiness Surface */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0F1219]/90 to-[#0A0C11]/90 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted Personal Vault</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
            My Documents
          </h1>
          <p className="text-sm text-zinc-400 font-light max-w-lg leading-relaxed">
            Important information, ready when you need it. Encrypted in personal standby and contextually surfaced during crises.
          </p>
        </div>

        {/* Clear Document Readiness Indicator & Add Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 self-start md:self-auto shrink-0">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                Vault Status
              </div>
              <div className="text-lg font-medium text-white font-mono flex items-center gap-1.5">
                <span>{documents.length} Records</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-[11px] text-zinc-400 font-light">
                {documents.filter((d) => d.emergencyRelevance === 'Critical').length} Critical for Crisis
              </div>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="px-5 py-3 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-xs font-mono border border-cyan-500/40 flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-950/40 self-stretch sm:self-auto justify-center"
          >
            <Upload className="w-4 h-4" />
            <span>+ Upload Document</span>
          </button>
        </div>
      </div>

      {/* 2. Vault Controls: Search & Category Pills */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white/[0.1] text-cyan-300 border border-cyan-500/40 font-medium'
                  : 'bg-white/[0.02] text-zinc-400 border border-white/[0.05] hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search vault..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0D12] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/40 transition-colors"
          />
        </div>
      </div>

      {/* 3. Document Vault Cards */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0B0D12] border border-white/[0.06] space-y-3">
          <FileText className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-zinc-400 text-sm font-light">
            {documents.length === 0 ? 'Your personal document vault is currently empty.' : 'No documents found matching the filter.'}
          </p>
          <button
            onClick={openAddModal}
            className="text-xs font-mono text-cyan-400 hover:underline cursor-pointer"
          >
            + Upload Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => {
            const isExpiringSoon =
              doc.expiryDate &&
              (doc.expiryDate.includes('Oct 2026') ||
                doc.expiryDate.includes('2026') ||
                doc.expiryDate.includes('2025'));

            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDocModal(doc)}
                className="p-6 rounded-2xl bg-[#0B0D12] border border-white/[0.06] hover:border-white/[0.14] cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 group relative"
              >
                <div className="space-y-3">
                  {/* Card Top: Category, Relevance & Expiry Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/30 px-2.5 py-0.5 rounded-full border border-cyan-800/30">
                        {doc.category}
                      </span>
                      {doc.emergencyRelevance === 'Critical' && (
                        <span className="text-[9px] font-mono uppercase text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded-full border border-rose-800/30">
                          Critical
                        </span>
                      )}
                    </div>

                    {doc.expiryDate && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isExpiringSoon
                            ? 'bg-amber-950/30 text-amber-300 border border-amber-800/30'
                            : 'bg-white/[0.03] text-zinc-400 border border-white/[0.05]'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{doc.expiryDate}</span>
                      </span>
                    )}
                  </div>

                  {/* Title and Description */}
                  <div>
                    <h2 className="text-base font-medium text-white group-hover:text-cyan-200 transition-colors">
                      {doc.name}
                    </h2>
                    <p className="text-xs text-zinc-400 font-light mt-1 line-clamp-2 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>
                </div>

                {/* Card Bottom: Asset Relation & Quick Actions */}
                <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  {doc.relatedAsset ? (
                    <span className="flex items-center gap-1 text-zinc-300 truncate max-w-[200px]">
                      <Box className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{doc.relatedAsset}</span>
                    </span>
                  ) : (
                    <span className="text-zinc-500">Personal Directive</span>
                  )}

                  <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    {doc.filePath && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDownload(doc);
                        }}
                        title="View / Download Document"
                        className="p-1 rounded hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => openEditModal(doc, e)}
                      title="Edit Document"
                      className="p-1 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-cyan-300 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmDoc(doc);
                      }}
                      title="Delete Document"
                      className="p-1 rounded hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-zinc-500 group-hover:text-cyan-400 transition-colors pl-1">
                      Inspect →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Detail Inspection Modal */}
      {selectedDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#0C0E14] border border-white/[0.1] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                    {selectedDocModal.category}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 px-2 py-0.5 rounded bg-white/[0.04]">
                    {selectedDocModal.emergencyRelevance} Priority
                  </span>
                </div>
                <h3 className="text-xl font-medium text-white">{selectedDocModal.name}</h3>
              </div>
              <span className="text-xs font-mono text-zinc-500">{selectedDocModal.uploadDate}</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3 text-xs">
              <div>
                <span className="text-zinc-500 font-mono block text-[10px] uppercase">Description</span>
                <p className="text-zinc-200 font-light mt-0.5 leading-relaxed">
                  {selectedDocModal.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.04] font-mono text-[11px]">
                <div>
                  <span className="text-zinc-500 block">Related Asset</span>
                  <span className="text-white">{selectedDocModal.relatedAsset || 'None (Personal)'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Validity Expiration</span>
                  <span className="text-white">{selectedDocModal.expiryDate || 'Indefinite'}</span>
                </div>
              </div>
            </div>

            {/* Storage File Link */}
            {selectedDocModal.filePath ? (
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2 text-cyan-300">
                  <FileText className="w-4 h-4" />
                  <span>{selectedDocModal.fileType || 'PDF'} • {selectedDocModal.fileSize || 'Attached'}</span>
                </div>
                <button
                  onClick={() => handleViewDownload(selectedDocModal)}
                  disabled={isGeneratingUrl}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-xs font-mono border border-cyan-500/30 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingUrl ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ExternalLink className="w-3.5 h-3.5" />
                  )}
                  <span>View / Download Document</span>
                </button>
              </div>
            ) : (
              <div className="text-[11px] font-mono text-zinc-500 italic">
                No storage file attached (metadata record).
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(selectedDocModal)}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeleteConfirmDoc(selectedDocModal)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-mono border border-rose-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedDocModal(null)}
                className="px-5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-zinc-200 transition-colors cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Document Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#0C0E14] border border-white/[0.1] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-medium text-white">
                  {editingDocId ? 'Edit Vault Document' : 'Upload Vault Document'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs font-mono">
              {!editingDocId && (
                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">
                    Document File (.PDF, .PNG, .JPG, Max 2MB) *
                  </label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const validMime = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
                        const validExt = /\.(pdf|png|jpe?g)$/i.test(file.name);
                        if (!validMime.includes(file.type) && !validExt) {
                          setUploadError('Invalid file type. Only PDF, PNG, and JPEG/JPG are allowed.');
                          setSelectedFile(null);
                          return;
                        }
                        if (file.size > 2 * 1024 * 1024) {
                          setUploadError('File is too large. Maximum allowed size is 2 MB.');
                          setSelectedFile(null);
                          return;
                        }
                        setSelectedFile(file);
                        setUploadError(null);
                        if (!formName.trim()) {
                          const base = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
                          setFormName(base);
                        }
                      }
                    }}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-zinc-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-cyan-500/20 file:text-cyan-300 file:cursor-pointer hover:border-cyan-500/30 transition-colors"
                  />
                  {selectedFile && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-mono text-cyan-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ready: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                  )}
                  {uploadError && (
                    <p className="text-[11px] text-rose-400 font-mono mt-1">{uploadError}</p>
                  )}
                </div>
              )}

              <div>
                <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Passport, Health Insurance Policy"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as DocumentCategory)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="Identity">Identity</option>
                    <option value="Medical">Medical</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Property">Property</option>
                    <option value="Legal">Legal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Emergency Relevance</label>
                  <select
                    value={formEmergencyRelevance}
                    onChange={(e) =>
                      setFormEmergencyRelevance(e.target.value as 'Critical' | 'High' | 'Moderate' | 'Low')
                    }
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="Critical">Critical (Immediate Triage)</option>
                    <option value="High">High (Core Incident Doc)</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Description & Notes</label>
                <textarea
                  rows={2}
                  placeholder="Policy numbers, account details, key instructions..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Expiry Date (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Oct 2026 or YYYY-MM-DD"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className={`w-full bg-[#08090C] border ${
                      !isExpiryValid && formExpiryDate.trim() !== ''
                        ? 'border-rose-500/60 focus:border-rose-500'
                        : 'border-white/[0.08] focus:border-cyan-500/50'
                    } rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none transition-colors`}
                  />
                  {!isExpiryValid && formExpiryDate.trim() !== '' && (
                    <p className="text-[11px] text-rose-400 font-mono mt-1">
                      Invalid format. Use YYYY-MM-DD (e.g. 2027-12-31) or Mon YYYY (e.g. Oct 2026).
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Related Asset (Optional)</label>
                  <select
                    value={formRelatedAsset}
                    onChange={(e) => setFormRelatedAsset(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="">None (Personal)</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.name}>
                        {asset.name} ({asset.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || (!isExpiryValid && formExpiryDate.trim() !== '')}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-40 disabled:cursor-not-allowed text-cyan-300 font-semibold text-xs font-mono border border-cyan-500/40 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading to Vault...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingDocId ? 'Save Changes' : 'Upload & Encrypt'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0D0F16] border border-rose-900/60 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-base font-medium text-white">Delete Document?</h3>
            </div>

            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Are you sure you want to remove <strong className="text-white">"{deleteConfirmDoc.name}"</strong> from your Shadow Vault? This document will also be unlinked from connected emergency plans.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteConfirmDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-medium transition-colors shadow-lg shadow-rose-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
