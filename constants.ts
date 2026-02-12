import { Lead, StageInfo } from './types';

export const STAGES: StageInfo[] = [
  { id: 1, label: 'Identification' },
  { id: 2, label: 'Tech Validation' },
  { id: 3, label: 'Scope/MTA' },
  { id: 4, label: 'Commitment' },
  { id: 5, label: 'Execution' },
  { id: 6, label: 'Review' },
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Aether Biosciences',
    type: 'Paid Pilot',
    description: 'High-throughput screening integration for novel protein folding.',
    stage: 5,
    statusNote: 'Phase 1 data delivered. Client reviewing for Phase 2 expansion.',
    isHighIntensity: true,
  },
  {
    id: '2',
    name: 'Novus Gen',
    type: 'LOI',
    description: 'Exploratory partnership for membrane protein analysis.',
    stage: 3,
    statusNote: 'MTA under legal review. Expected signature by Friday.',
    isHighIntensity: false,
  },
  {
    id: '3',
    name: 'Helix Dynamics',
    type: 'Paid Pilot',
    description: 'Validation of biomarkers in synthetic serum.',
    stage: 2,
    statusNote: 'Samples received. Tech validation scheduled for next week.',
    isHighIntensity: true,
  },
  {
    id: '4',
    name: 'Vertex Pharma',
    type: 'LOI',
    description: 'Standard proteomics panel for Q3 clinical trials.',
    stage: 1,
    statusNote: 'Initial outreach made. Waiting for R&D lead response.',
    isHighIntensity: false,
  },
  {
    id: '5',
    name: 'Omega Synthesis',
    type: 'Paid Pilot',
    description: 'Custom assay development for enzyme stability.',
    stage: 4,
    statusNote: 'Contract signed. Kickoff meeting scheduled.',
    isHighIntensity: true,
  },
  {
    id: '6',
    name: 'Chimera Labs',
    type: 'LOI',
    description: 'Feasibility study for cryo-EM prep.',
    stage: 6,
    statusNote: 'Final report submitted. Awaiting conversion decision.',
    isHighIntensity: false,
  }
];