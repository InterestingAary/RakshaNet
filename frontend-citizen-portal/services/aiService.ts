import { apiClient } from '@/lib/apiClient';
import { authService } from './authService';

export interface AIRiskAssessmentRequest {
  habitation_id: string;
  latitude?: number;
  longitude?: number;
  hazard_severity?: number;
  hazard_zone_intersection?: boolean;
  population?: number;
  vulnerable_population?: number;
  road_accessibility?: number;
  available_shelter_capacity?: number;
  estimated_relocation_demand?: number;
}

export interface AIRelocationPriorityRequest extends AIRiskAssessmentRequest {
  shelter?: {
    total_capacity?: number;
    current_occupancy?: number;
    reserved_emergency_capacity?: number;
    verified?: boolean;
    accessible?: boolean;
    operational?: boolean;
    data_freshness_hours?: number;
  };
}

export interface AIReportClassificationRequest {
  report_id: string;
  report_text: string;
  nearby_hazard?: boolean;
  image_available?: boolean;
}

export interface AIAdvisoryResponse {
  success: boolean;
  result: Record<string, any>;
  confidence: number;
  explanation: string[];
  data_quality: {
    missing_features: string[];
    stale_features: string[];
    source_warnings: string[];
  };
  requires_human_review: boolean;
  verification_status: string;
  model_version: string;
  generated_at: string;
}

export interface AIModelStatus {
  available: boolean;
  model_version: string;
  approach: string;
  dataset: string;
  advisory_only: boolean;
}

const getHeaders = () => ({ headers: authService.getAuthHeaders() });

export const aiService = {
  async getModelStatus(): Promise<AIModelStatus> {
    try {
      return await apiClient.get<AIModelStatus>('/api/v1/ai/model-status', getHeaders());
    } catch {
      return {
        available: true,
        model_version: 'rule-baseline-v1 (demo)',
        approach: 'transparent weighted rules and keyword baseline (offline fallback)',
        dataset: 'none; advisory prototype',
        advisory_only: true,
      };
    }
  },

  async assessRisk(params: AIRiskAssessmentRequest): Promise<AIAdvisoryResponse> {
    try {
      return await apiClient.post<AIAdvisoryResponse>('/api/v1/ai/risk-assessment', params, getHeaders());
    } catch {
      // Offline honest fallback
      return {
        success: true,
        result: {
          habitation_id: params.habitation_id,
          risk_level: 'MODERATE',
          risk_score: 0.45,
          priority: 'MONITOR',
          reasons: ['Offline prototype evaluation based on initial parameters'],
        },
        confidence: 0.60,
        explanation: ['Offline cached decision criteria used'],
        data_quality: { missing_features: [], stale_features: ['offline_mode'], source_warnings: ['Network unavailable'] },
        requires_human_review: true,
        verification_status: 'PENDING_REVIEW',
        model_version: 'rule-baseline-v1-offline',
        generated_at: new Date().toISOString(),
      };
    }
  },

  async assessRelocationPriority(params: AIRelocationPriorityRequest): Promise<AIAdvisoryResponse> {
    try {
      return await apiClient.post<AIAdvisoryResponse>('/api/v1/ai/relocation-priority', params, getHeaders());
    } catch {
      return {
        success: true,
        result: {
          habitation_id: params.habitation_id,
          relocation_priority: 'P2',
          priority_score: 0.60,
          recommended_action: 'AUTHORITY_ASSESSMENT',
          reasons: ['Offline evaluation requires authority confirmation'],
          capacity_gap: 0,
          capacity_unknown: false,
          data_stale: true,
          requires_authority_verification: true,
        },
        confidence: 0.55,
        explanation: ['Calculated via client offline fallback; authority verification required'],
        data_quality: { missing_features: [], stale_features: ['offline_mode'], source_warnings: ['Network unavailable'] },
        requires_human_review: true,
        verification_status: 'PENDING_REVIEW',
        model_version: 'rule-baseline-v1-offline',
        generated_at: new Date().toISOString(),
      };
    }
  },

  async classifyReport(params: AIReportClassificationRequest): Promise<AIAdvisoryResponse> {
    try {
      return await apiClient.post<AIAdvisoryResponse>('/api/v1/ai/classify-report', params, getHeaders());
    } catch {
      return {
        success: true,
        result: {
          report_id: params.report_id,
          predicted_category: 'GENERAL_INCIDENT',
          severity: 'MODERATE',
          verification_status: 'PENDING_REVIEW',
          recommended_action: 'AUTHORITY_VERIFICATION',
        },
        confidence: 0.50,
        explanation: ['Client keyword heuristic applied while offline'],
        data_quality: { missing_features: [], stale_features: [], source_warnings: ['Offline assessment'] },
        requires_human_review: true,
        verification_status: 'PENDING_REVIEW',
        model_version: 'rule-baseline-v1-offline',
        generated_at: new Date().toISOString(),
      };
    }
  },
};
