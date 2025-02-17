export interface Incident {
    incidentId: string;
    reportedBy: string;
    deliveryId: string;
    type: string;
    description: string;
    status: string;
    createdAt: Date;
    resolvedAt: Date;
    location: string;
}