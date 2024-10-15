export interface Upload {
    id: string;
    url: string;
    type: string; // e.g., 'profile', 'banner', 'post', 'video'
    createdAt: Date;
}
