export type SelectedWorkStatus = 'concept-study' | 'studio-venture' | 'client-work';

export type SelectedWorkRecord = Readonly<{
  id: string;
  title: string;
  category: string;
  market: string;
  status: SelectedWorkStatus;
  statusLabel: string;
  thesis: string;
  summary: string;
  browserLabel: string;
  imageKey: 'aescent-smiles' | 'smor';
  imageAlt: string;
  ambient: Readonly<{
    primary: string;
    secondary: string;
  }>;
  ledger: readonly Readonly<{ label: string; value: string }>[];
  href?: string;
  actionLabel?: string;
}>;

export const selectedWorkRecords = [
  {
    id: 'aescent-smiles',
    title: 'Aescent Smiles',
    category: 'Dental',
    market: 'Laguna, Philippines',
    status: 'concept-study',
    statusLabel: 'Concept Study / Dental',
    thesis: 'Trust before treatment.',
    summary: 'A calm patient journey that organizes care, clinic context, and inquiry around the confidence a visitor needs before making contact.',
    browserLabel: 'dental.aescentwebstudios.com',
    imageKey: 'aescent-smiles',
    imageAlt: 'Aescent Smiles dental concept homepage with a dark clinical hero and bright clinic interior',
    ambient: {
      primary: '#17334d',
      secondary: '#26a9df',
    },
    ledger: [
      { label: 'Focus', value: 'Trust & inquiry' },
      { label: 'Format', value: 'One-page experience' },
      { label: 'Direction', value: 'Clinical calm' },
    ],
    href: 'https://dental.aescentwebstudios.com',
    actionLabel: 'View project',
  },
  {
    id: 'smor',
    title: 'SMØR',
    category: 'Food & Beverage',
    market: 'Los Baños, Laguna',
    status: 'studio-venture',
    statusLabel: 'Studio Venture / Food & Beverage',
    thesis: 'A matter of taste.',
    summary: 'An editorial preorder experience that gives an oversized gourmet cookie brand the restraint, scale, and recognizability of a luxury campaign.',
    browserLabel: 'SMØR / First Batch',
    imageKey: 'smor',
    imageAlt: 'SMØR gourmet cookie preorder homepage in deep navy, warm ivory, and muted gold',
    ambient: {
      primary: '#08172a',
      secondary: '#d9aa5f',
    },
    ledger: [
      { label: 'Focus', value: 'Brand & preorder' },
      { label: 'Format', value: 'Launch experience' },
      { label: 'Direction', value: 'Editorial abundance' },
    ],
  },
] as const satisfies readonly SelectedWorkRecord[];
