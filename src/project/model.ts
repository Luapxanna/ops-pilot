export interface ProjectData {
    name: string;
    description: string;
    organizationId: number;
    startDate: Date;
    endDate: Date;
    status: string;
}

export interface DecodedToken {
    id: string; 
    role: string; 
    organizationId: number;
}

export interface ListProjectsRequest {
    req: Request;
}

export interface ListProjectsResponse {
    success: boolean;
    projects: ProjectData[];
}
