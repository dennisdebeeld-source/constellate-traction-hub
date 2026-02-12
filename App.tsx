import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Filter, ArrowUpDown, LogOut, Pencil } from 'lucide-react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './firebase';
import { STAGES } from './constants';
import { Lead } from './types';
import { DashboardHeader } from './components/DashboardHeader';
import { PipelineTicks } from './components/PipelineTicks';
import { AddLeadModal } from './components/AddLeadModal';
import { AuthScreen } from './components/AuthScreen';
import { subscribeToLeads, saveLeadToFirestore, updateLeadStageInFirestore, deleteLeadFromFirestore } from './services/leadService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filterStage, setFilterStage] = useState<number | 'ALL'>('ALL');
  const [sortType, setSortType] = useState<'DEFAULT' | 'INTENSITY' | 'ALPHA'>('DEFAULT');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listener
  useEffect(() => {
    // Only subscribe if we have a user
    if (!user) {
        setLeads([]);
        return;
    }

    const unsubscribe = subscribeToLeads((updatedLeads) => {
        setLeads(updatedLeads);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle stage update
  const updateLeadStage = async (leadId: string, newStage: number) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    // Validation: Type is mandatory for Commitment stage (4) and above
    // If moving to stage >= 4, and type is null, we must stop and alert
    if (newStage >= 4 && !lead.type) {
        alert("Action Required: Please assign a Lead Type (LOI or Paid Pilot) via the edit menu before moving to the Commitment stage.");
        return;
    }

    // Optimistic update for immediate feedback
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return { ...l, stage: newStage };
      }
      return l;
    }));

    try {
        await updateLeadStageInFirestore(leadId, newStage);
    } catch (error) {
        console.error("Failed to update stage remotely", error);
        // Errors in subscription will likely revert the state eventually or show old state
    }
  };

  // Save lead (Create or Update)
  const handleSaveLead = async (lead: Lead) => {
    // We let the subscription handle the state update to ensure consistency
    // but the modal handles the loading state
    await saveLeadToFirestore(lead);
  };

  // Delete lead
  const handleDeleteLead = async (leadId: string) => {
    try {
        await deleteLeadFromFirestore(leadId);
        setIsModalOpen(false);
    } catch (error) {
        console.error("Failed to delete lead", error);
    }
  };

  // Open Modal Actions
  const openNewLeadModal = () => {
    setEditingLead(null);
    setIsModalOpen(true);
  };

  const openEditLeadModal = (lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  // Filter and Sort Logic
  const processedLeads = useMemo(() => {
    let result = [...leads];

    // Filter
    if (filterStage !== 'ALL') {
      result = result.filter(l => l.stage === filterStage);
    }

    // Sort
    switch (sortType) {
      case 'INTENSITY':
        // Priority: Paid Pilot > High Stage > LOI
        result.sort((a, b) => {
          if (a.type === 'Paid Pilot' && b.type !== 'Paid Pilot') return -1;
          if (a.type !== 'Paid Pilot' && b.type === 'Paid Pilot') return 1;
          // If same type, sort by stage descending
          return b.stage - a.stage;
        });
        break;
      case 'ALPHA':
        // Alphabetical A-Z
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'DEFAULT':
      default:
        // Default sort: By Stage Descending (progressed leads first)
        result.sort((a, b) => b.stage - a.stage);
        break;
    }

    return result;
  }, [leads, filterStage, sortType]);

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Auth Guards
  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12 font-sans selection:bg-white selection:text-black">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Branding */}
        <header className="flex items-center justify-between mb-12 border-b border-zinc-900 pb-6">
            <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-white rotate-45"></div>
                <h1 className="text-xl tracking-[0.2em] font-light uppercase">Constellate Proteomics</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:block text-xs text-zinc-500 uppercase tracking-widest">
                {user.email}
              </div>
              <button 
                onClick={handleLogout}
                className="text-xs text-zinc-500 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors"
                title="Sign Out"
              >
                <span>Logout</span>
                <LogOut size={14} />
              </button>
            </div>
        </header>

        {/* Dashboard Metrics */}
        <DashboardHeader leads={leads} />

        {/* Control Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-zinc-900 pb-6">
            <div className="flex flex-wrap items-center gap-4">
                {/* Filter */}
                <div className="relative group">
                    <div className="flex items-center space-x-2 text-sm text-zinc-400 border border-zinc-800 px-3 py-2 bg-black hover:border-zinc-600 transition-colors cursor-pointer">
                        <Filter size={14} />
                        <select 
                            className="bg-transparent focus:outline-none appearance-none pr-4 cursor-pointer"
                            value={filterStage}
                            onChange={(e) => setFilterStage(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                        >
                            <option value="ALL" className="bg-black text-white">All Stages</option>
                            {STAGES.map(s => (
                                <option key={s.id} value={s.id} className="bg-black text-white">{s.id}. {s.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Sort Dropdown */}
                <div className="relative group">
                    <div className="flex items-center space-x-2 text-sm text-zinc-400 border border-zinc-800 px-3 py-2 bg-black hover:border-zinc-600 transition-colors cursor-pointer">
                        <ArrowUpDown size={14} />
                        <span className="text-xs uppercase tracking-wider mr-1 text-zinc-600">Sort By:</span>
                        <select 
                            className="bg-transparent focus:outline-none appearance-none pr-4 cursor-pointer text-white"
                            value={sortType}
                            onChange={(e) => setSortType(e.target.value as any)}
                        >
                            <option value="DEFAULT" className="bg-black text-white">Stage (Default)</option>
                            <option value="INTENSITY" className="bg-black text-white">Intensity</option>
                            <option value="ALPHA" className="bg-black text-white">Alphabetical</option>
                        </select>
                    </div>
                </div>
            </div>

            <button 
                onClick={openNewLeadModal}
                className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2 border border-zinc-800 transition-colors text-sm"
            >
                <Plus size={16} />
                <span>Add New Lead</span>
            </button>
        </div>

        {/* Pipeline List */}
        <div className="space-y-4">
            {/* Headers for larger screens */}
            <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-2 text-xs uppercase tracking-widest text-zinc-600">
                <div className="col-span-4">Details</div>
                <div className="col-span-4 text-center">Pipeline Progress</div>
                <div className="col-span-4">Latest Update</div>
            </div>

            {processedLeads.length === 0 ? (
                <div className="text-center py-20 border border-zinc-900 border-dashed text-zinc-600">
                    {leads.length === 0 
                        ? "No leads in database. Add a new lead to get started." 
                        : "No leads found matching criteria."}
                </div>
            ) : (
                processedLeads.map((lead) => (
                    <div 
                        key={lead.id} 
                        className="group relative bg-black border border-zinc-900 hover:border-zinc-700 transition-all duration-300 p-6 md:p-0 md:h-32 flex flex-col md:grid md:grid-cols-12 md:gap-6 items-center"
                    >
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/20 pointer-events-none transition-colors duration-500" />

                        {/* Left: Info */}
                        <div className="w-full md:col-span-4 md:pl-6 md:border-r md:border-zinc-900/50 md:h-full flex flex-col justify-center z-10 mb-6 md:mb-0 relative">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-normal text-white">{lead.name}</h3>
                                {lead.type && (
                                    <span className={`text-[10px] px-2 py-0.5 uppercase tracking-wider font-medium border ${
                                        lead.type === 'Paid Pilot' 
                                            ? 'bg-white text-black border-white' 
                                            : 'bg-black text-zinc-400 border-zinc-700'
                                    }`}>
                                        {lead.type}
                                    </span>
                                )}
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditLeadModal(lead);
                                  }}
                                  className="ml-2 text-zinc-600 hover:text-white transition-colors p-1"
                                  title="Edit Lead"
                                >
                                  <Pencil size={12} />
                                </button>
                            </div>
                            <p className="text-sm text-zinc-500 font-light line-clamp-2 pr-4">{lead.description}</p>
                        </div>

                        {/* Center: Pipeline */}
                        <div className="w-full md:col-span-4 flex justify-center items-center z-10 mb-6 md:mb-0">
                            <PipelineTicks 
                                currentStage={lead.stage} 
                                onStageClick={(s) => updateLeadStage(lead.id, s)}
                            />
                        </div>

                        {/* Right: Update */}
                        <div className="w-full md:col-span-4 md:pr-6 md:border-l md:border-zinc-900/50 md:h-full flex items-center z-10">
                            <div className="w-full">
                                <div className="text-[10px] uppercase text-zinc-600 mb-1">Status Note</div>
                                <p className="text-sm text-zinc-300 font-light italic">
                                    "{lead.statusNote}"
                                </p>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        <AddLeadModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleSaveLead}
            onDelete={handleDeleteLead}
            initialLead={editingLead}
        />
      </div>
    </div>
  );
};

export default App;