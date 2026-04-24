/**
 * Performance rating enum
 */
export enum PerformanceRating {
  POOR = 1,
  BELOW_AVERAGE = 2,
  AVERAGE = 3,
  ABOVE_AVERAGE = 4,
  EXCELLENT = 5
}

/**
 * Goal status enum
 */
export enum GoalStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  ON_TRACK = 'on_track',
  OFF_TRACK = 'off_track',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Performance goal model
 */
export interface PerformanceGoal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: GoalStatus;
  dueDate: Date;
  createdDate: Date;
  completedDate?: Date;
  weight: number; // percentage weight in overall appraisal
  comments?: string;
}

/**
 * Competency model
 */
export interface Competency {
  id: string;
  name: string;
  description: string;
  category: string; // technical, behavioral, managerial, etc.
  level: number; // 1-5
  proofOfCompetency?: string;
}

/**
 * Performance appraisal (Review)
 */
export interface PerformanceAppraisal {
  id: string;
  employeeId: string;
  appraisalPeriodStart: Date;
  appraisalPeriodEnd: Date;
  reviewerName: string;
  reviewerId: string;
  overallRating: PerformanceRating;
  goals: PerformanceGoal[];
  competencies: Competency[];
  strengths: string;
  areasForImprovement: string;
  feedback: string;
  recommendations: string;
  status: 'draft' | 'submitted' | 'approved' | 'published';
  submittedDate?: Date;
  approvedDate?: Date;
  publishedDate?: Date;
  selfRating?: PerformanceRating;
  selfComments?: string;
}

/**
 * Training and development model
 */
export interface Training {
  id: string;
  title: string;
  description: string;
  provider: string;
  category: string;
  startDate: Date;
  endDate: Date;
  duration: number; // in hours
  cost: number;
  location?: string;
  isOnline: boolean;
  maxParticipants: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

/**
 * Employee training enrollment
 */
export interface TrainingEnrollment {
  id: string;
  trainingId: string;
  employeeId: string;
  enrollmentDate: Date;
  completionDate?: Date;
  certificateUrl?: string;
  score?: number;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped';
  feedback?: string;
}
