type Belief = {
  id: number;
  text: string;
  acceptanceLeft: boolean;
  acceptanceRight: boolean;
  supports?: Belief[];
  opposes?: Belief[];
};

export type { Belief };
