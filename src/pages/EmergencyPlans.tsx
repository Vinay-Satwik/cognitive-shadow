import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  ArrowRight,
  FileText,
  Users,
  CheckSquare,
  Shield,
  Edit2,
  X,
  Save,
  Plus,
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EmergencyPlan, PlanTask } from '../types';
import { crisisScenarios } from '../data/crisisScenarios';
import { contextEngine } from '../services/contextEngine';

export const EmergencyPlans: React.FC = () => {
  const navigate = useNavigate();
  const { plans, selectedPlan, selectPlan, startActivation, documents, contacts, assets, addPlan, updatePlan } = useApp();

  // Edit Plan modal state
  const [editingPlan, setEditingPlan] = useState<EmergencyPlan | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmoji, setFormEmoji] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDocIds, setFormDocIds] = useState<string[]>([]);
  const [formContactIds, setFormContactIds] = useState<string[]>([]);
  const [formTasks, setFormTasks] = useState<PlanTask[]>([]);
  const [formAssetIds, setFormAssetIds] = useState<string[]>([]);

  // Task inline add
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newTaskRole, setNewTaskRole] = useState('');

  const openEditPlan = (plan: EmergencyPlan) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    setFormEmoji(plan.emoji);
    setFormDescription(plan.description);
    setFormDocIds([...plan.relevantDocuments]);
    setFormContactIds([...plan.relevantContacts]);
    setFormTasks([...plan.defaultTasks]);
    setFormAssetIds([...(plan.relevantAssets || [])]);
    setNewTaskTitle('');
    setNewTaskRole('');
  };

  const toggleDocSelection = (docId: string) => {
    setFormDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const toggleContactSelection = (contactId: string) => {
    setFormContactIds((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: PlanTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      defaultAssigneeRole: newTaskRole.trim() || 'Primary Proxy'
    };
    setFormTasks((prev) => [...prev, newTask]);
    setNewTaskTitle('');
    setNewTaskRole('');
  };

  const handleRemoveTask = (taskId: string) => {
    setFormTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const openCreatePlan = () => {
    setIsCreatingPlan(true);
    setEditingPlan(null);
    setFormName('');
    setFormEmoji('📋');
    setFormDescription('');
    setFormDocIds([]);
    setFormContactIds([]);
    setFormAssetIds([]);
    setFormTasks([]);
    setNewTaskTitle('');
    setNewTaskRole('');
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    addPlan({
      name: formName.trim(),
      emoji: formEmoji.trim() || '📋',
      description: formDescription.trim(),
      relevantDocuments: formDocIds,
      relevantAssets: formAssetIds,
      relevantContacts: formContactIds,
      defaultTasks: formTasks,
      sharingRules: []
    });
    setIsCreatingPlan(false);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !formName.trim()) return;

    updatePlan(editingPlan.id, {
      name: formName.trim(),
      emoji: formEmoji.trim() || '📋',
      description: formDescription.trim(),
      relevantDocuments: formDocIds,
      relevantContacts: formContactIds,
      defaultTasks: formTasks
    });

    setEditingPlan(null);
  };

  return (
    <div className="space-y-10 max-w-5xl">
      {/* 1. Header Surface */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0F1219]/90 to-[#0A0C11]/90 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Contingency Blueprints</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
            Emergency Plans
          </h1>
          <p className="text-sm text-zinc-400 font-light max-w-lg leading-relaxed">
            Pre-organized response blueprints that answer three critical questions before panic sets in: what information matters, who matters, and what needs to be done.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center gap-4 self-start md:self-auto shrink-0">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              Coverage Mapping
            </div>
            <div className="text-lg font-medium text-white font-mono flex items-center gap-1.5">
              <span>{plans.length} Blueprints Active</span>
            </div>
            <div className="text-[11px] text-cyan-400 font-light font-mono">
              Ready for immediate activation
            </div>
          </div>
        </div>
      </div>

      {/* 2. Personal Plans + System Crisis Blueprints */}
      {plans.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono">Personal configuration</span>
              <h2 className="text-xl font-light text-white mt-1">Your Emergency Plans</h2>
              <p className="text-xs text-zinc-500 mt-1">Custom response mappings built from your own data.</p>
            </div>
          </div>
          {plans.map((plan) => {
            const isSelected = selectedPlan.id === plan.id;
            const planDocs = documents.filter((d) => plan.relevantDocuments.includes(d.id));
            const planPeople = contacts.filter((c) => plan.relevantContacts.includes(c.id));
            return (
              <div key={plan.id} className={`p-7 rounded-3xl border ${isSelected ? 'bg-[#0E121B] border-cyan-500/50' : 'bg-[#0B0D12] border-white/[0.06]'}`}>
                <div className="flex items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{plan.emoji}</span>
                    <div><h2 className="text-xl font-medium text-white">{plan.name}</h2><p className="text-xs text-zinc-400 mt-1">{plan.description}</p></div>
                  </div>
                  <button onClick={() => openEditPlan(plan)} className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] text-zinc-300 text-xs font-mono border border-white/[0.08] flex items-center gap-1.5"><Edit2 className="w-3.5 h-3.5 text-cyan-400" />Edit Plan</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5 text-xs">
                  <div className="p-4 rounded-2xl bg-white/[0.015] border border-white/[0.04]"><span className="text-zinc-500 font-mono">DOCUMENTS</span><div className="text-lg text-white mt-1">{planDocs.length}</div></div>
                  <div className="p-4 rounded-2xl bg-white/[0.015] border border-white/[0.04]"><span className="text-zinc-500 font-mono">CONTACTS</span><div className="text-lg text-white mt-1">{planPeople.length}</div></div>
                  <div className="p-4 rounded-2xl bg-white/[0.015] border border-white/[0.04]"><span className="text-zinc-500 font-mono">PRIORITY TASKS</span><div className="text-lg text-white mt-1">{plan.defaultTasks.length}</div></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-7 rounded-3xl bg-white/[0.015] border border-white/[0.06] space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest"><Shield className="w-3.5 h-3.5" />Personal plans</div>
          <h2 className="text-xl font-light text-white">No personal emergency plans configured</h2>
          <p className="text-sm text-zinc-500 max-w-2xl">Your account has no custom response blueprints yet. The system crisis scenarios below remain available and do not count as personal plans or readiness records.</p>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono">System crisis library</span>
          <h2 className="text-xl font-light text-white mt-1">Five Crisis Blueprints</h2>
          <p className="text-xs text-zinc-500 mt-1">These scenarios are always available for activation. The Context Engine applies each one to your real stored information.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.values(crisisScenarios).map((scenario) => {
            const context = contextEngine.generateCrisisContext({ scenario: scenario.id, documents, assets: [], emergencyContacts: contacts, emergencyPlans: plans, profile: undefined });
            return (
              <div key={scenario.id} className="p-6 rounded-2xl bg-[#0B0D12] border border-white/[0.06] hover:border-cyan-500/30 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{scenario.emoji}</span>
                  <div className="min-w-0"><h3 className="text-base font-medium text-white">{scenario.name}</h3><p className="text-xs text-zinc-500 mt-1">{scenario.description}</p></div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-5 text-center font-mono text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.02]"><div className="text-cyan-300 text-lg">{context.relevantDocuments.length}</div><div className="text-zinc-500">docs</div></div>
                  <div className="p-3 rounded-xl bg-white/[0.02]"><div className="text-cyan-300 text-lg">{context.relevantContacts.length}</div><div className="text-zinc-500">people</div></div>
                  <div className="p-3 rounded-xl bg-white/[0.02]"><div className="text-cyan-300 text-lg">{context.priorityTasks.length}</div><div className="text-zinc-500">tasks</div></div>
                </div>
                <button onClick={() => navigate('/activation')} className="mt-4 w-full px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/30 flex items-center justify-center gap-2">
                  Available in Activate Shadow <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {isCreatingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0C0E14] border border-white/[0.1] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div><h3 className="text-lg font-medium text-white">Configure Personal Emergency Plan</h3><p className="text-xs font-mono text-zinc-400 mt-1">Choose what information should surface for a specific situation.</p></div>
              <button onClick={() => setIsCreatingPlan(false)} className="p-1.5 text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreatePlan} className="space-y-5 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input value={formEmoji} onChange={e=>setFormEmoji(e.target.value)} className="bg-[#08090C] border border-white/[0.08] rounded-xl px-3 py-2 text-center text-lg" aria-label="Plan emoji" />
                <input required value={formName} onChange={e=>setFormName(e.target.value)} placeholder="Plan name *" className="sm:col-span-3 bg-[#08090C] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-zinc-200" />
              </div>
              <textarea value={formDescription} onChange={e=>setFormDescription(e.target.value)} placeholder="Describe the situation and response plan" rows={2} className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-200" />
              <div><label className="text-cyan-400 block mb-2 uppercase text-[10px]">Relevant Documents</label><div className="max-h-32 overflow-y-auto space-y-1">{documents.map(doc=><label key={doc.id} className="flex gap-2 p-2 text-zinc-300"><input type="checkbox" checked={formDocIds.includes(doc.id)} onChange={()=>toggleDocSelection(doc.id)} />{doc.name}</label>)}</div></div>
              <div><label className="text-cyan-400 block mb-2 uppercase text-[10px]">Relevant Contacts</label><div className="max-h-32 overflow-y-auto space-y-1">{contacts.map(contact=><label key={contact.id} className="flex gap-2 p-2 text-zinc-300"><input type="checkbox" checked={formContactIds.includes(contact.id)} onChange={()=>toggleContactSelection(contact.id)} />{contact.name} ({contact.relationship})</label>)}</div></div>
              <div><label className="text-cyan-400 block mb-2 uppercase text-[10px]">Relevant Assets</label><div className="max-h-32 overflow-y-auto space-y-1">{assets.map(asset=><label key={asset.id} className="flex gap-2 p-2 text-zinc-300"><input type="checkbox" checked={formAssetIds.includes(asset.id)} onChange={()=>setFormAssetIds(prev=>prev.includes(asset.id)?prev.filter(id=>id!==asset.id):[...prev,asset.id])} />{asset.name}</label>)}</div></div>
              <div><label className="text-cyan-400 block mb-2 uppercase text-[10px]">Priority Tasks</label><div className="space-y-2">{formTasks.map(task=><div key={task.id} className="flex justify-between p-2 bg-white/[0.02] rounded-lg text-zinc-300"><span>{task.title}</span><button type="button" onClick={()=>handleRemoveTask(task.id)}><Trash2 className="w-3.5 h-3.5 text-zinc-500" /></button></div>)}</div><div className="flex gap-2 mt-2"><input value={newTaskTitle} onChange={e=>setNewTaskTitle(e.target.value)} placeholder="Priority task" className="flex-1 bg-[#08090C] border border-white/[0.08] rounded-xl px-3 py-2" /><button type="button" onClick={handleAddTask} className="px-3 rounded-xl border border-cyan-500/30 text-cyan-300"><Plus className="w-3.5 h-3.5" /></button></div></div>
              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.06]"><button type="button" onClick={()=>setIsCreatingPlan(false)} className="px-4 py-2 text-zinc-400">Cancel</button><button type="submit" className="px-5 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">Create Personal Plan</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-[#0C0E14] border border-white/[0.1] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{formEmoji || '📋'}</span>
                <div>
                  <h3 className="text-lg font-medium text-white">Edit Emergency Plan</h3>
                  <p className="text-xs font-mono text-zinc-400">Configure response blueprint mappings</p>
                </div>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-6 text-xs font-mono">
              {/* Plan Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Emoji Icon</label>
                  <input
                    type="text"
                    value={formEmoji}
                    onChange={(e) => setFormEmoji(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3 py-2 text-center text-lg text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Plan Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Scenario Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50 font-sans"
                />
              </div>

              {/* 1. Relevant Documents Selector */}
              <div className="space-y-2">
                <label className="text-cyan-400 block uppercase text-[10px] tracking-wider font-semibold">
                  1. Relevant Documents ({formDocIds.length} Selected)
                </label>
                <div className="p-3.5 rounded-2xl bg-[#08090C] border border-white/[0.06] max-h-40 overflow-y-auto space-y-1.5">
                  {documents.map((doc) => {
                    const isChecked = formDocIds.includes(doc.id);
                    return (
                      <label
                        key={doc.id}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.02] cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDocSelection(doc.id)}
                          className="rounded border-zinc-700 text-cyan-500 focus:ring-cyan-500 w-3.5 h-3.5 bg-[#08090C]"
                        />
                        <span className={isChecked ? 'text-white font-medium' : 'text-zinc-400'}>
                          {doc.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase font-mono ml-auto">
                          {doc.category}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 2. Relevant Contacts Selector */}
              <div className="space-y-2">
                <label className="text-cyan-400 block uppercase text-[10px] tracking-wider font-semibold">
                  2. Relevant Contacts ({formContactIds.length} Selected)
                </label>
                <div className="p-3.5 rounded-2xl bg-[#08090C] border border-white/[0.06] max-h-40 overflow-y-auto space-y-1.5">
                  {contacts.map((contact) => {
                    const isChecked = formContactIds.includes(contact.id);
                    return (
                      <label
                        key={contact.id}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.02] cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleContactSelection(contact.id)}
                          className="rounded border-zinc-700 text-cyan-500 focus:ring-cyan-500 w-3.5 h-3.5 bg-[#08090C]"
                        />
                        <span className={isChecked ? 'text-white font-medium' : 'text-zinc-400'}>
                          {contact.name} ({contact.relationship})
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase font-mono ml-auto">
                          {contact.role}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 3. Priority Tasks Manager */}
              <div className="space-y-3">
                <label className="text-cyan-400 block uppercase text-[10px] tracking-wider font-semibold">
                  3. Priority Tasks ({formTasks.length} Configured)
                </label>

                {/* Existing Tasks List */}
                <div className="space-y-2">
                  {formTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#08090C] border border-white/[0.06] text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="text-white block">{task.title}</span>
                        <span className="text-[10px] text-cyan-400 font-mono">
                          Assignee: {task.defaultAssigneeRole || 'Primary Proxy'} • Priority: {task.priority}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(task.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Task Form */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-3">
                  <div className="text-[10px] uppercase text-zinc-400">Add Priority Task</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Task action description"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Assignee role / name"
                        value={newTaskRole}
                        onChange={(e) => setNewTaskRole(e.target.value)}
                        className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <select
                      value={newTaskPriority}
                      onChange={(e) =>
                        setNewTaskPriority(e.target.value as 'Critical' | 'High' | 'Medium' | 'Low')
                      }
                      className="bg-[#08090C] border border-white/[0.08] rounded-lg px-2.5 py-1 text-[11px] text-zinc-300"
                    >
                      <option value="Critical">Critical Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleAddTask}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs border border-cyan-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Task</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-xs font-mono border border-cyan-500/40 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Plan Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
