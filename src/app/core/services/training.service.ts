import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface TrainingSession {
    id: string;
    title: string;
    trainer: string;
    date: string; // start date (for UI table)
    startDate?: string;
    endDate?: string;
    duration: string;
    status: 'Upcoming' | 'Completed' | 'InProgress' | 'Cancelled' | 'Ongoing';
    enrolledCount: number;
    maxParticipants: number;
    description?: string;
    location?: string;
    targetDepartment?: string | null;
    targetRole?: string | null;
    isActive?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class TrainingService {
    private http = inject(HttpClient);
    private apiUrl = '/api/training';

    private trainingSessionsSignal = signal<TrainingSession[]>([]);
    private myAssignmentsSignal = signal<any[]>([]);
    private isLoadingSignal = signal<boolean>(true);

    sessions = this.trainingSessionsSignal.asReadonly();
    myAssignments = this.myAssignmentsSignal.asReadonly();
    isLoading = this.isLoadingSignal.asReadonly();

    constructor() { }

    async loadSessions(): Promise<TrainingSession[]> {
        this.isLoadingSignal.set(true);
        return new Promise((resolve, reject) => {
            this.http.get<any[]>(this.apiUrl).subscribe({
                next: (records) => {
                    const mapped = (records || []).map((record: any) => {
                        const participants = record.participants || [];
                        const enrolledCount = participants.length || 0;
                        const maxParticipants = Math.max(enrolledCount, 1);
                        const startDate = record.startDate || record.date || '';
                        const endDate = record.endDate || record.startDate || '';
                        const duration = this.calculateDuration(startDate, endDate);
                        const status = (record.status || 'Upcoming') as TrainingSession['status'];
                        return {
                            id: record.id,
                            title: record.title,
                            trainer: record.trainer,
                            date: startDate,
                            startDate,
                            endDate,
                            duration,
                            status,
                            enrolledCount,
                            maxParticipants,
                            description: record.description,
                            location: record.location || 'Online',
                            targetDepartment: record.targetDepartment ?? null,
                            targetRole: record.targetRole ?? null,
                            isActive: record.isActive !== false,
                        } as TrainingSession;
                    });
                    this.trainingSessionsSignal.set(mapped);
                    this.isLoadingSignal.set(false);
                    resolve(mapped);
                },
                error: (error) => {
                    this.trainingSessionsSignal.set([]);
                    this.isLoadingSignal.set(false);
                    reject(error);
                }
            });
        });
    }

    async loadMyAssignments(): Promise<any[]> {
        this.isLoadingSignal.set(true);
        return new Promise((resolve, reject) => {
            this.http.get<any[]>(`${this.apiUrl}/my`).subscribe({
                next: (records) => {
                    const mapped = (records || []).map((a: any) => {
                        const t = a.training || {};
                        const startDate = t.startDate || '';
                        const endDate = t.endDate || startDate || '';
                        return {
                            assignmentId: a.id,
                            trainingId: t.id,
                            title: t.title,
                            trainer: t.trainer,
                            description: t.description,
                            startDate,
                            endDate,
                            duration: this.calculateDuration(startDate, endDate),
                            status: a.status,
                            progress: Number(a.progress || 0),
                            isActive: t.isActive !== false,
                        };
                    }).filter((x: any) => x.isActive);
                    this.myAssignmentsSignal.set(mapped);
                    this.isLoadingSignal.set(false);
                    resolve(mapped);
                },
                error: (error) => {
                    this.myAssignmentsSignal.set([]);
                    this.isLoadingSignal.set(false);
                    reject(error);
                }
            });
        });
    }

    createTraining(payload: any): Promise<any> {
        this.isLoadingSignal.set(true);
        return new Promise((resolve, reject) => {
            this.http.post<any>(this.apiUrl, payload).subscribe({
                next: (created) => {
                    this.isLoadingSignal.set(false);
                    resolve(created);
                },
                error: (err) => {
                    this.isLoadingSignal.set(false);
                    reject(err);
                }
            });
        });
    }

    backfillAssignments(trainingId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.post<any>(`${this.apiUrl}/${trainingId}/assign`, {}).subscribe({
                next: (res) => resolve(res),
                error: (err) => reject(err),
            });
        });
    }

    assignEmployees(trainingId: string, employeeIds: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.post<any>(`${this.apiUrl}/${trainingId}/assign`, {
                participantEmployeeIds: employeeIds,
            }).subscribe({
                next: (res) => resolve(res),
                error: (err) => reject(err),
            });
        });
    }

    getAssignmentsForTraining(trainingId: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.http.get<any[]>(`${this.apiUrl}/${trainingId}/assignments`).subscribe({
                next: (res) => resolve(res || []),
                error: (err) => reject(err),
            });
        });
    }

    deleteTraining(trainingId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.delete<any>(`${this.apiUrl}/${trainingId}`).subscribe({
                next: (res) => resolve(res),
                error: (err) => reject(err),
            });
        });
    }

    updateMyProgress(assignmentId: string, progress: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.patch<any>(`${this.apiUrl}/my/${assignmentId}/progress`, { progress }).subscribe({
                next: (updated) => resolve(updated),
                error: (err) => reject(err),
            });
        });
    }

    private calculateDuration(start: string, end: string): string {
        if (!start || !end) return '-';
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const days = diffDays >= 0 ? diffDays + 1 : 0;
        return days <= 1 ? '1 Day' : `${days} Days`;
    }
}
