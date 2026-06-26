export {};
export type InternalRole = 'owner' | 'admin' | 'sales' | 'pm' | 'tech' | 'readonly';
export type ClientRole = 'client_primary' | 'client_user';
export type Role = InternalRole | ClientRole;
export declare const INTERNAL_ROLES: readonly InternalRole[];
export declare const CLIENT_ROLES: readonly ClientRole[];
export declare function isInternalRole(role: Role): role is InternalRole;
export declare function isClientRole(role: Role): role is ClientRole;
export interface SessionUser {
    id: string;
    email: string;
    name: string;
    role: Role;
    accountId: string | null;
}
export interface JwtPayload extends SessionUser {
    iat: number;
    exp: number;
    iss: string;
}
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: string;
}
export type UserRole = 'admin' | 'staff' | 'viewer';
export type LeadSource = 'contact_form' | 'free_it_audit' | 'service_inquiry' | 'bespoke_scope_request' | 'phone' | 'referral' | 'other';
export type LeadStatus = 'new' | 'qualified' | 'contacted' | 'converted' | 'junk';
export interface CreateLeadRequest {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    message?: string;
    serviceInterest?: string;
    industry?: string;
    source?: LeadSource;
    sourceUrl?: string;
    attribution?: Record<string, string>;
}
export type IntakeFlow = 'free_audit' | 'bespoke_scope' | 'marketing_scope' | 'service_inquiry';
export interface IntakeAnswers {
    companyName: string;
    industry?: string;
    employeeCount?: number;
    officeCount?: number;
    identityPlatform?: 'm365' | 'google' | 'both' | 'neither' | 'unsure';
    endpointCount?: number;
    lobApp?: string;
    backupVendor?: string;
    lastRestoreDrill?: 'within_3m' | 'within_12m' | 'over_12m' | 'never' | 'unsure';
    mfaCoveragePercent?: number;
    prompts?: string[];
    topPriorities?: string[];
    name: string;
    email: string;
    phone?: string;
    role?: string;
    preferredWindows?: string[];
    notesForCall?: string;
}
export interface BespokeScopeAnswers {
    companyName: string;
    projectKind?: string;
    projectVision: string;
    problemStatement?: string;
    targetUsers?: string;
    userCountBand?: string;
    platforms?: string[];
    mustHaveIntegrations?: string;
    dataSensitivity?: string;
    projectState?: string;
    launchWindow?: string;
    budgetBand?: string;
    successMetric?: string;
    hasDesignAssets?: boolean;
    ownership?: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    referredBy?: string;
    notesForCall?: string;
}
export type CreateProspectRequest = {
    flow: 'free_audit' | 'service_inquiry';
    intakeVersion: string;
    answers: IntakeAnswers;
    sourceUrl?: string;
    attribution?: Record<string, string>;
} | {
    flow: 'bespoke_scope';
    intakeVersion: string;
    answers: BespokeScopeAnswers;
    sourceUrl?: string;
    attribution?: Record<string, string>;
} | {
    flow: 'marketing_scope';
    intakeVersion: string;
    answers: Record<string, unknown>;
    sourceUrl?: string;
    attribution?: Record<string, string>;
};
export interface CreateProspectResponse {
    id: string;
    previewToken: string;
    previewExpiresAt: string;
}
export interface PreviewPortalData {
    prospect: {
        firstName: string;
        companyName: string;
        industry?: string;
        role?: string;
    };
    audit: {
        status: 'requested' | 'scheduled' | 'completed';
        requestedWindows?: string[];
        scheduledFor?: string;
        durationMinutes: number;
        joinUrl?: string;
    };
    auditFocus: {
        icon: string;
        title: string;
        body: string;
        framework?: string;
    }[];
    engagementPreview: {
        number: number;
        title: string;
        description: string;
        status: 'next' | 'upcoming';
        eta?: string;
    }[];
    matchedCaseStudySlug?: string;
    directContact: {
        name: string;
        email: string;
        phone: string;
    };
    expiresAt: string;
}
export type NocEndpointStatus = 'healthy' | 'warning' | 'critical' | 'offline' | 'unenrolled';
export type NocEndpointKind = 'workstation' | 'server' | 'mobile' | 'network_device' | 'virtual' | 'other';
export type NocOsFamily = 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'network_os' | 'unknown';
export type NocCheckCategory = 'encryption' | 'patching' | 'identity' | 'edr_av' | 'backup' | 'network' | 'lob_app' | 'compliance' | 'inventory' | 'custom';
export type NocCheckSeverity = 'info' | 'warn' | 'critical';
export type NocResultStatus = 'pass' | 'warn' | 'fail' | 'error' | 'skipped';
export type NocAlertStatus = 'open' | 'acknowledged' | 'resolved' | 'suppressed';
export type NocRunbookAudience = 'internal' | 'client_visible' | 'both';
export interface NocHeartbeatPayload {
    endpointId: string;
    agentVersion: string;
    agentBinaryHash: string;
    sentAt: string;
    nonce: string;
    results: NocCheckResult[];
    snapshot?: NocSystemSnapshot;
}
export interface NocCheckResult {
    checkSlug: string;
    status: NocResultStatus;
    value?: Record<string, unknown>;
    message?: string;
    durationMs?: number;
}
export interface NocSystemSnapshot {
    hostname: string;
    fqdn?: string;
    osFamily: NocOsFamily;
    osVersion?: string;
    cpuPct?: number;
    memTotalMb?: number;
    memUsedMb?: number;
    diskTotalGb?: number;
    diskUsedGb?: number;
    uptimeSec?: number;
    loggedInUserHash?: string;
}
export interface NocEnrollmentRequest {
    enrollmentToken: string;
    publicKey: string;
    publicKeyFingerprint: string;
    hostname: string;
    fqdn?: string;
    osFamily: NocOsFamily;
    osVersion?: string;
    agentVersion: string;
    agentBinaryHash: string;
}
export interface NocEnrollmentResponse {
    endpointId: string;
    clientId: string;
    serverPublicKey: string;
    config: NocAgentConfig;
}
export interface NocAgentConfig {
    heartbeatIntervalMinutes: number;
    checks: Array<{
        slug: string;
        severity: NocCheckSeverity;
        scheduleMinutes: number;
        thresholds?: Record<string, unknown>;
    }>;
}
export interface NocCheckDefinition {
    slug: string;
    name: string;
    description: string;
    category: NocCheckCategory;
    defaultSeverity: NocCheckSeverity;
    defaultScheduleMinutes: number;
    appliesTo: NocOsFamily[];
    hipaaControl?: string;
    pciControl?: string;
    socControl?: string;
    defaultRunbookSlug?: string;
}
export interface NocEndpointSummary {
    id: string;
    clientId: string;
    hostname: string;
    displayName?: string;
    kind: NocEndpointKind;
    osFamily: NocOsFamily;
    osVersion?: string;
    status: NocEndpointStatus;
    lastHeartbeatAt?: string;
    passCount: number;
    warnCount: number;
    failCount: number;
    agentVersion?: string;
    tags: string[];
}
export interface NocAlertSummary {
    id: string;
    clientId: string;
    endpointId: string;
    endpointHostname: string;
    checkSlug: string;
    severity: NocCheckSeverity;
    status: NocAlertStatus;
    title: string;
    summary?: string;
    runbookSlug?: string;
    openedAt: string;
    acknowledgedAt?: string;
    resolvedAt?: string;
}
export interface NocRunbookSummary {
    id: string;
    slug: string;
    title: string;
    summary?: string;
    audience: NocRunbookAudience;
    category?: NocCheckCategory;
    attachedTo?: string;
    clientId?: string;
    currentVersion: number;
    updatedAt: string;
}
export interface NocFleetRollup {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
    offline: number;
    openAlerts: number;
    lastHeartbeatAt?: string;
}
export interface ApiError {
    statusCode: number;
    message: string;
    code?: string;
    details?: Record<string, unknown>;
}
