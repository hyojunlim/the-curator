export interface RiskItem {
  title: string;
  clauseReference?: string;
  clause: string;
  explanation: string;
  severity: "high" | "medium" | "low";
  suggestion?: string;
  suggestion_party_a?: string;
  suggestion_party_b?: string;
  rewrite?: string;
  rewrite_party_a?: string;
  rewrite_party_b?: string;
  rewrite_type?: "modify" | "add";
}

export interface ContractParty {
  role: "party_a" | "party_b";
  name: string;
  description: string;
}

export interface KeyDate {
  label: string;        // e.g., "Effective Date", "Expiration", "Notice Period"
  date: string;         // e.g., "2024-01-01", "30 days before expiry", "Upon signing"
  importance: "critical" | "notable";
}

export interface FinancialObligation {
  description: string;  // e.g., "Monthly service fee"
  amount: string;       // e.g., "$5,000/month", "15% of revenue", "To be determined"
  party: string;        // Who pays - "Party A" or "Party B"
  condition?: string;   // e.g., "Due within 30 days of invoice"
}

export interface MissingClause {
  title: string;        // e.g., "Force Majeure", "Data Protection"
  importance: "high" | "medium";
  reason: string;       // Why it should be included
}

export interface ActionItem {
  party: string;        // "Party A" or "Party B" or "Both"
  action: string;       // What needs to be done
  deadline?: string;    // When
  priority: "high" | "medium" | "low";
}

export interface AnalysisResult {
  summary: string;
  parties: ContractParty[];
  risks: RiskItem[];
  riskScore?: number;
  riskHigh?: boolean;
  savedId?: string;
  language?: string;
  // New advanced fields
  contractType?: string;          // "Employment", "NDA", "SaaS Agreement", etc.
  keyDates?: KeyDate[];
  financialObligations?: FinancialObligation[];
  missingClauses?: MissingClause[];
  fairnessScore?: number;         // 0-100, 50 = perfectly balanced
  fairnessSummary?: string;       // Brief explanation of fairness
  actionItems?: ActionItem[];
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
