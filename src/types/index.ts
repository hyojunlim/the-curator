export interface RiskItem {
  title: string;
  clause: string;
  explanation: string;
  severity: "high" | "medium" | "low";
  suggestion?: string;
  suggestion_party_a?: string;
  suggestion_party_b?: string;
  rewrite?: string;
}

export interface ContractParty {
  role: "party_a" | "party_b";
  name: string;
  description: string;
}

export interface AnalysisResult {
  summary: string;
  parties: ContractParty[];
  risks: RiskItem[];
  riskScore?: number;
  riskHigh?: boolean;
  savedId?: string;
}

export interface Contract {
  id: string;
  title: string;
  type: string;
  status: string;
  risk_score: number;
  risk_high: boolean;
  starred: boolean;
  tags: string[] | null;
  created_at: string;
}
