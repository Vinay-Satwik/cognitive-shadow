import React, { useState } from 'react';
import {
  Car,
  Smartphone,
  Laptop,
  Home,
  Shield,
  Tag,
  FileText,
  CheckCircle2,
  Box,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Save
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Asset } from '../types';

export const Assets: React.FC = () => {
  const { assets, addAsset, updateAsset, deleteAsset, documents } = useApp();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState<Asset | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [type, setType] = useState('Vehicle');
  const [identifier, setIdentifier] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [insurance, setInsurance] = useState('');
  const [warranty, setWarranty] = useState('');
  const [description, setDescription] = useState('');

  const getAssetIcon = (assetType: string, assetName: string) => {
    const t = assetType.toLowerCase();
    const n = assetName.toLowerCase();
    if (t.includes('auto') || t.includes('vehicle') || n.includes('car') || n.includes('honda') || n.includes('tesla')) {
      return <Car className="w-5 h-5 text-cyan-400" />;
    }
    if (t.includes('phone') || n.includes('iphone') || n.includes('pixel')) {
      return <Smartphone className="w-5 h-5 text-cyan-400" />;
    }
    if (t.includes('laptop') || t.includes('computer') || n.includes('macbook')) {
      return <Laptop className="w-5 h-5 text-cyan-400" />;
    }
    return <Home className="w-5 h-5 text-cyan-400" />;
  };

  const openAddModal = () => {
    setEditingAssetId(null);
    setName('');
    setType('Vehicle');
    setIdentifier('');
    setPurchaseDate('2024');
    setEstimatedValue('$15,000');
    setInsurance('State Farm Policy #POL-1002');
    setWarranty('Manufacturer Warranty Active');
    setDescription('');
    setIsFormOpen(true);
  };

  const openEditModal = (asset: Asset) => {
    setEditingAssetId(asset.id);
    setName(asset.name);
    setType(asset.type);
    setIdentifier(asset.registrationOrSerial);
    setPurchaseDate(asset.purchaseDate);
    setEstimatedValue(asset.estimatedValue);
    setInsurance(asset.insurance);
    setWarranty(asset.warranty);
    setDescription(asset.description || '');
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingAssetId) {
      updateAsset(editingAssetId, {
        name: name.trim(),
        type: type.trim(),
        registrationOrSerial: identifier.trim(),
        purchaseDate: purchaseDate.trim(),
        estimatedValue: estimatedValue.trim(),
        insurance: insurance.trim(),
        warranty: warranty.trim(),
        description: description.trim()
      });
    } else {
      addAsset({
        name: name.trim(),
        type: type.trim(),
        registrationOrSerial: identifier.trim(),
        purchaseDate: purchaseDate.trim(),
        estimatedValue: estimatedValue.trim(),
        insurance: insurance.trim(),
        warranty: warranty.trim(),
        description: description.trim(),
        relatedDocuments: []
      });
    }

    setIsFormOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmAsset) {
      deleteAsset(deleteConfirmAsset.id);
      setDeleteConfirmAsset(null);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl">
      {/* 1. Header Surface */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0F1219]/90 to-[#0A0C11]/90 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400">
            <Box className="w-3.5 h-3.5" />
            <span>Property & Equipment Registry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
            My Assets
          </h1>
          <p className="text-sm text-zinc-400 font-light max-w-lg leading-relaxed">
            Your vehicles, personal electronics, and residence linked with verified insurance policies, warranty schedules, and registered deeds.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 self-start md:self-auto shrink-0">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                Coverage Status
              </div>
              <div className="text-lg font-medium text-white font-mono flex items-center gap-1.5">
                <span>{assets.length} Registered</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-[11px] text-zinc-400 font-light">
                All physical property monitored
              </div>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="px-5 py-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/30 flex items-center gap-2 transition-all cursor-pointer shadow-sm self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* 2. Sophisticated Asset Cards Grid */}
      {assets.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0B0D12] border border-white/[0.06] space-y-3">
          <Box className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-zinc-400 text-sm font-light">No physical assets currently tracked.</p>
          <button
            onClick={openAddModal}
            className="text-xs font-mono text-cyan-400 hover:underline cursor-pointer"
          >
            Register your first asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="p-6 sm:p-7 rounded-3xl bg-[#0B0D12] border border-white/[0.06] hover:border-white/[0.14] transition-all duration-200 space-y-5 relative group"
            >
              {/* Top Identity Block */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shrink-0">
                    {getAssetIcon(asset.type, asset.name)}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                      {asset.type}
                    </span>
                    <h2 className="text-lg font-medium text-white mt-0.5">
                      {asset.name}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400 bg-white/[0.02] px-2.5 py-1 rounded-full border border-white/[0.05]">
                    {asset.purchaseDate}
                  </span>
                  <button
                    onClick={() => openEditModal(asset)}
                    title="Edit Asset"
                    className="p-1.5 rounded-lg hover:bg-white/[0.08] text-zinc-400 hover:text-cyan-300 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmAsset(asset)}
                    title="Delete Asset"
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Identifier and Valuation */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Identifier</span>
                  <span className="text-zinc-200 truncate block mt-0.5" title={asset.registrationOrSerial}>
                    {asset.registrationOrSerial}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Estimated Value</span>
                  <span className="text-cyan-300 font-medium block mt-0.5">{asset.estimatedValue}</span>
                </div>
              </div>

              {/* Insurance & Warranty Sections */}
              <div className="space-y-2.5 text-xs font-light">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.015] border border-white/[0.04]">
                  <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Insurance</span>
                    <span className="text-zinc-200">{asset.insurance}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.015] border border-white/[0.04]">
                  <Tag className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Warranty</span>
                    <span className="text-zinc-300">{asset.warranty}</span>
                  </div>
                </div>
              </div>

              {/* Description if present */}
              {asset.description && (
                <p className="text-xs text-zinc-400 font-light italic px-1">
                  {asset.description}
                </p>
              )}

              {/* Linked Documents Footer */}
              <div className="pt-2 border-t border-white/[0.04] flex items-center gap-2 text-xs font-mono text-zinc-400">
                <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="text-zinc-500">Linked:</span>
                <span className="text-zinc-300 truncate">
                  {asset.relatedDocuments && asset.relatedDocuments.length > 0
                    ? asset.relatedDocuments.join(', ')
                    : 'Auto-linked via Shadow Vault'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Asset Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#0C0E14] border border-white/[0.1] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Box className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-medium text-white">
                  {editingAssetId ? 'Edit Asset Record' : 'Register New Asset'}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Asset Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Honda City, Primary Apartment"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Asset Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="Vehicle">Vehicle</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Primary Device">Primary Device</option>
                    <option value="Computing">Computing</option>
                    <option value="Valuable">Valuable</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Identifier / Serial / Reg *</label>
                  <input
                    type="text"
                    required
                    placeholder="VIN, Serial No., Deed Number"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Estimated Value</label>
                  <input
                    type="text"
                    placeholder="e.g. $22,000"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Purchase Year / Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Nov 2021"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Warranty Information</label>
                  <input
                    type="text"
                    placeholder="Coverage details / term"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Insurance Policy Details</label>
                <input
                  type="text"
                  placeholder="Insurer name, policy #, road assistance hotline"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Description & Access Notes</label>
                <textarea
                  rows={2}
                  placeholder="Location, key instructions, emergency handover notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50 font-sans"
                />
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
                  className="px-6 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-xs font-mono border border-cyan-500/40 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingAssetId ? 'Save Changes' : 'Register Asset'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0D0F16] border border-rose-900/60 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-base font-medium text-white">Delete Asset?</h3>
            </div>

            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Are you sure you want to remove <strong className="text-white">"{deleteConfirmAsset.name}"</strong>? Connected documents in your vault will remain intact but will have their asset association unlinked.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteConfirmAsset(null)}
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
