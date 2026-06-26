CREATE TYPE "public"."account_health" AS ENUM('excellent', 'good', 'watch', 'critical');--> statement-breakpoint
CREATE TYPE "public"."account_status" AS ENUM('active', 'at-risk', 'onboarding', 'churned');--> statement-breakpoint
CREATE TYPE "public"."account_tier" AS ENUM('enterprise', 'mid-market', 'smb');--> statement-breakpoint
CREATE TYPE "public"."audit_appointment_status" AS ENUM('requested', 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."project_billing" AS ENUM('fixed', 't-and-m', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."project_kind" AS ENUM('web-app', 'mobile-app', 'crm', 'ai-tool', 'integration');--> statement-breakpoint
CREATE TYPE "public"."project_stage" AS ENUM('discovery', 'design', 'build', 'uat', 'launch', 'hypercare', 'closed');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'sent', 'partial', 'paid', 'overdue', 'void');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('draft', 'sent', 'accepted', 'declined', 'expired', 'converted');--> statement-breakpoint
CREATE TYPE "public"."document_kind" AS ENUM('sow', 'msa', 'proposal', 'report', 'policy', 'invoice', 'other');--> statement-breakpoint
CREATE TYPE "public"."engagement_status" AS ENUM('active', 'onboarding', 'paused', 'renewing', 'closed');--> statement-breakpoint
CREATE TYPE "public"."engagement_type" AS ENUM('managed', 'project', 'discovery');--> statement-breakpoint
CREATE TYPE "public"."health" AS ENUM('green', 'amber', 'red');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('pending', 'in-progress', 'awaiting-approval', 'approved', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('owner', 'admin', 'sales', 'pm', 'tech', 'readonly', 'client_primary', 'client_user');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('contact_form', 'free_it_audit', 'service_inquiry', 'bespoke_scope_request', 'phone', 'referral', 'other');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'qualifying', 'qualified', 'contacted', 'disqualified', 'converted', 'junk');--> statement-breakpoint
CREATE TYPE "public"."prospect_intake_flow" AS ENUM('free_audit', 'bespoke_scope', 'marketing_scope', 'service_inquiry');--> statement-breakpoint
CREATE TYPE "public"."prospect_status" AS ENUM('new', 'audit_scheduled', 'audit_done', 'sow_sent', 'won', 'lost', 'junk');--> statement-breakpoint
CREATE TYPE "public"."noc_alert_status" AS ENUM('open', 'acknowledged', 'resolved', 'suppressed');--> statement-breakpoint
CREATE TYPE "public"."noc_check_category" AS ENUM('encryption', 'patching', 'identity', 'edr_av', 'backup', 'network', 'lob_app', 'compliance', 'inventory', 'custom');--> statement-breakpoint
CREATE TYPE "public"."noc_check_severity" AS ENUM('info', 'warn', 'critical');--> statement-breakpoint
CREATE TYPE "public"."noc_endpoint_kind" AS ENUM('workstation', 'server', 'mobile', 'network_device', 'virtual', 'other');--> statement-breakpoint
CREATE TYPE "public"."noc_endpoint_status" AS ENUM('healthy', 'warning', 'critical', 'offline', 'unenrolled');--> statement-breakpoint
CREATE TYPE "public"."noc_os_family" AS ENUM('windows', 'macos', 'linux', 'ios', 'android', 'network_os', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."noc_result_status" AS ENUM('pass', 'warn', 'fail', 'error', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."noc_runbook_audience" AS ENUM('internal', 'client_visible', 'both');--> statement-breakpoint
CREATE TYPE "public"."opportunity_stage" AS ENUM('new', 'qualified', 'proposal', 'sow-sent', 'closed-won', 'closed-lost');--> statement-breakpoint
CREATE TYPE "public"."opportunity_type" AS ENUM('new-business', 'expansion', 'renewal');--> statement-breakpoint
CREATE TYPE "public"."ticket_category" AS ENUM('incident', 'request', 'change', 'project');--> statement-breakpoint
CREATE TYPE "public"."ticket_priority" AS ENUM('p1', 'p2', 'p3', 'p4');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'in-progress', 'awaiting-client', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."billing_unit" AS ENUM('per-seat-month', 'per-month', 'fixed', 'hourly', 'retainer');--> statement-breakpoint
CREATE TYPE "public"."service_category" AS ENUM('managed', 'security', 'cloud', 'communications', 'build', 'marketing');--> statement-breakpoint
CREATE TYPE "public"."marketing_deliverable_status" AS ENUM('todo', 'in-progress', 'done');--> statement-breakpoint
CREATE TYPE "public"."marketing_kind" AS ENUM('ghl-implementation', 'seo', 'paid-ads', 'social', 'web-design', 'email-automation', 'reputation', 'full-funnel');--> statement-breakpoint
CREATE TYPE "public"."marketing_status" AS ENUM('scoping', 'onboarding', 'building', 'live', 'optimizing', 'paused', 'closed');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"industry" text,
	"tier" "account_tier" DEFAULT 'smb' NOT NULL,
	"status" "account_status" DEFAULT 'onboarding' NOT NULL,
	"health" "account_health" DEFAULT 'good' NOT NULL,
	"primary_contact" text,
	"primary_email" text,
	"mrr" integer DEFAULT 0 NOT NULL,
	"seats" integer DEFAULT 0 NOT NULL,
	"since" date,
	"next_renewal" date,
	"services_used" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "audit_appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prospect_id" uuid NOT NULL,
	"status" "audit_appointment_status" DEFAULT 'requested' NOT NULL,
	"requested_windows" jsonb,
	"scheduled_for" timestamp with time zone,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"join_url" text,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_email" text NOT NULL,
	"actor_role" text NOT NULL,
	"account_id" uuid,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" uuid,
	"payload" jsonb,
	"ip_address" text,
	"user_agent" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bespoke_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "milestone_status" DEFAULT 'pending' NOT NULL,
	"due_date" date,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bespoke_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"account_id" uuid,
	"type" "project_kind" DEFAULT 'web-app' NOT NULL,
	"stage" "project_stage" DEFAULT 'discovery' NOT NULL,
	"billing" "project_billing" DEFAULT 'fixed' NOT NULL,
	"contract_value" integer DEFAULT 0 NOT NULL,
	"burned" integer DEFAULT 0 NOT NULL,
	"started_at" date,
	"target_go_live" date,
	"health" "health" DEFAULT 'green' NOT NULL,
	"lead" text,
	"team" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"service_slug" text,
	"description" text NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	"unit_price" integer DEFAULT 0 NOT NULL,
	"unit" text DEFAULT 'fixed' NOT NULL,
	"recurring" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"account_id" uuid,
	"engagement_id" uuid,
	"proposal_id" uuid,
	"client_name" text DEFAULT '' NOT NULL,
	"client_email" text,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"issue_date" date,
	"due_date" date,
	"currency" text DEFAULT 'USD' NOT NULL,
	"notes" text,
	"terms" text,
	"tax_rate" integer DEFAULT 0 NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"tax_amount" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"amount_paid" integer DEFAULT 0 NOT NULL,
	"owner" text DEFAULT 'Unassigned' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "proposal_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"service_slug" text,
	"description" text NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	"unit_price" integer DEFAULT 0 NOT NULL,
	"unit" text DEFAULT 'fixed' NOT NULL,
	"recurring" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" text NOT NULL,
	"title" text NOT NULL,
	"account_id" uuid,
	"engagement_id" uuid,
	"client_name" text DEFAULT '' NOT NULL,
	"client_email" text,
	"status" "proposal_status" DEFAULT 'draft' NOT NULL,
	"issue_date" date,
	"valid_until" date,
	"currency" text DEFAULT 'USD' NOT NULL,
	"notes" text,
	"terms" text,
	"tax_rate" integer DEFAULT 0 NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"tax_amount" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"owner" text DEFAULT 'Unassigned' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "proposals_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"title" text,
	"account_id" uuid,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"kind" "document_kind" DEFAULT 'other' NOT NULL,
	"account_id" uuid,
	"storage_key" text,
	"url" text,
	"size_bytes" integer,
	"mime_type" text,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "engagements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"account_id" uuid NOT NULL,
	"type" "engagement_type" DEFAULT 'managed' NOT NULL,
	"status" "engagement_status" DEFAULT 'active' NOT NULL,
	"stage" text DEFAULT 'Kickoff' NOT NULL,
	"health" "health" DEFAULT 'green' NOT NULL,
	"started_at" date,
	"next_milestone" text,
	"next_milestone_due" date,
	"mrr_or_value" integer DEFAULT 0 NOT NULL,
	"service_slug" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "milestone_status" DEFAULT 'pending' NOT NULL,
	"due_date" date,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" "role" NOT NULL,
	"account_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text,
	"message" text,
	"service_interest" text,
	"industry" text,
	"source" "lead_source" DEFAULT 'contact_form' NOT NULL,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"owner" text,
	"source_url" text,
	"attribution" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prospects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"role" text,
	"company_name" text NOT NULL,
	"industry" text,
	"employee_count" integer,
	"office_count" integer,
	"intake_flow" "prospect_intake_flow" DEFAULT 'free_audit' NOT NULL,
	"intake_version" text DEFAULT '1' NOT NULL,
	"intake_payload" jsonb NOT NULL,
	"top_priority" text,
	"status" "prospect_status" DEFAULT 'new' NOT NULL,
	"converted_account_id" uuid,
	"source_url" text,
	"attribution" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preview_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"prospect_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"last_viewed_at" timestamp with time zone,
	"fingerprint_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "preview_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "noc_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"endpoint_id" uuid NOT NULL,
	"check_definition_id" uuid NOT NULL,
	"severity" "noc_check_severity" NOT NULL,
	"status" "noc_alert_status" DEFAULT 'open' NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"runbook_slug" text,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"acknowledged_at" timestamp with time zone,
	"acknowledged_by" uuid,
	"resolved_at" timestamp with time zone,
	"resolved_by" uuid,
	"resolution_note" text,
	"dedup_key" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "noc_check_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" "noc_check_category" NOT NULL,
	"default_severity" "noc_check_severity" NOT NULL,
	"default_schedule_minutes" integer DEFAULT 60 NOT NULL,
	"osquery_sql" text,
	"shell_command" text,
	"expected_expression" text,
	"applies_to" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"hipaa_control" text,
	"pci_control" text,
	"soc_control" text,
	"default_runbook_slug" text,
	"builtin" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "noc_client_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"check_definition_id" uuid NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"override_severity" "noc_check_severity",
	"override_schedule_minutes" integer,
	"threshold_overrides" jsonb,
	"runbook_slug" text,
	"scope_tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "noc_endpoint_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"endpoint_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"check_definition_id" uuid NOT NULL,
	"status" "noc_result_status" NOT NULL,
	"severity" "noc_check_severity" NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"value" jsonb,
	"message" text,
	"is_latest" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "noc_endpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"hostname" text NOT NULL,
	"display_name" text,
	"serial_number" text,
	"fqdn" text,
	"kind" "noc_endpoint_kind" DEFAULT 'workstation' NOT NULL,
	"os_family" "noc_os_family" DEFAULT 'unknown' NOT NULL,
	"os_version" text,
	"public_key" text NOT NULL,
	"public_key_fingerprint" text NOT NULL,
	"agent_version" text,
	"agent_binary_hash" text,
	"status" "noc_endpoint_status" DEFAULT 'unenrolled' NOT NULL,
	"last_heartbeat_at" timestamp with time zone,
	"last_ingress_ip" text,
	"enrolled_at" timestamp with time zone,
	"decommissioned_at" timestamp with time zone,
	"notes" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "noc_enrollment_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"intended_hostname" text,
	"intended_kind" "noc_endpoint_kind",
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"consumed_by_endpoint_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "noc_heartbeats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"endpoint_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"agent_sent_at" timestamp with time zone NOT NULL,
	"agent_version" text NOT NULL,
	"agent_binary_hash" text NOT NULL,
	"nonce" text NOT NULL,
	"signature_valid" boolean NOT NULL,
	"source_ip" text,
	"payload" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "noc_runbook_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"runbook_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"body_md" text NOT NULL,
	"change_note" text,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"changed_by" uuid
);
--> statement-breakpoint
CREATE TABLE "noc_runbooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"client_id" uuid,
	"audience" "noc_runbook_audience" DEFAULT 'internal' NOT NULL,
	"category" "noc_check_category",
	"attached_to" text,
	"body_md" text NOT NULL,
	"current_version" integer DEFAULT 1 NOT NULL,
	"published_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"account_id" uuid,
	"prospect_name" text NOT NULL,
	"industry" text,
	"type" "opportunity_type" DEFAULT 'new-business' NOT NULL,
	"stage" "opportunity_stage" DEFAULT 'new' NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"probability" integer DEFAULT 0 NOT NULL,
	"expected_close" date,
	"owner" text DEFAULT 'Unassigned' NOT NULL,
	"source" text DEFAULT 'contact_form' NOT NULL,
	"services_in_scope" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"primary_contact" text,
	"primary_email" text,
	"lost_reason" text,
	"lost_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"kind" text DEFAULT 'note' NOT NULL,
	"actor" text DEFAULT 'System' NOT NULL,
	"text" text NOT NULL,
	"ts" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"kind" text DEFAULT 'other' NOT NULL,
	"name" text NOT NULL,
	"url" text,
	"added_by" text DEFAULT 'System' NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"service" text NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	"rate" integer DEFAULT 0 NOT NULL,
	"recurring" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"author" text DEFAULT 'System' NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid,
	"subject" text NOT NULL,
	"description" text,
	"priority" "ticket_priority" DEFAULT 'p3' NOT NULL,
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"assignee" text,
	"category" "ticket_category" DEFAULT 'request' NOT NULL,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sla_target" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" "service_category" DEFAULT 'managed' NOT NULL,
	"summary" text,
	"default_rate" integer DEFAULT 0 NOT NULL,
	"billing_unit" "billing_unit" DEFAULT 'per-month' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_catalog_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "marketing_deliverables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"engagement_id" uuid NOT NULL,
	"title" text NOT NULL,
	"status" "marketing_deliverable_status" DEFAULT 'todo' NOT NULL,
	"due_date" date,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_engagements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"account_id" uuid,
	"kind" "marketing_kind" DEFAULT 'ghl-implementation' NOT NULL,
	"status" "marketing_status" DEFAULT 'scoping' NOT NULL,
	"health" "health" DEFAULT 'green' NOT NULL,
	"monthly_retainer" integer DEFAULT 0 NOT NULL,
	"setup_fee" integer DEFAULT 0 NOT NULL,
	"owner" text,
	"ghl_location_id" text,
	"started_at" date,
	"go_live_target" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_appointments" ADD CONSTRAINT "audit_appointments_prospect_id_prospects_id_fk" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bespoke_milestones" ADD CONSTRAINT "bespoke_milestones_project_id_bespoke_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."bespoke_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bespoke_projects" ADD CONSTRAINT "bespoke_projects_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_line_items" ADD CONSTRAINT "proposal_line_items_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_engagement_id_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."engagements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preview_tokens" ADD CONSTRAINT "preview_tokens_prospect_id_prospects_id_fk" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_activities" ADD CONSTRAINT "opportunity_activities_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_attachments" ADD CONSTRAINT "opportunity_attachments_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_line_items" ADD CONSTRAINT "opportunity_line_items_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_deliverables" ADD CONSTRAINT "marketing_deliverables_engagement_id_marketing_engagements_id_fk" FOREIGN KEY ("engagement_id") REFERENCES "public"."marketing_engagements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_engagements" ADD CONSTRAINT "marketing_engagements_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_slug_idx" ON "accounts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "accounts_status_idx" ON "accounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "audit_appointments_prospect_id_idx" ON "audit_appointments" USING btree ("prospect_id");--> statement-breakpoint
CREATE INDEX "audit_appointments_status_idx" ON "audit_appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "audit_appointments_scheduled_for_idx" ON "audit_appointments" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "audit_log_account_id_idx" ON "audit_log" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "audit_log_actor_id_idx" ON "audit_log" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "audit_log_occurred_at_idx" ON "audit_log" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "bespoke_milestones_project_id_idx" ON "bespoke_milestones" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "bespoke_projects_account_id_idx" ON "bespoke_projects" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "bespoke_projects_stage_idx" ON "bespoke_projects" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "invoice_line_items_invoice_id_idx" ON "invoice_line_items" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoices_account_id_idx" ON "invoices" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "invoices_proposal_id_idx" ON "invoices" USING btree ("proposal_id");--> statement-breakpoint
CREATE INDEX "proposal_line_items_proposal_id_idx" ON "proposal_line_items" USING btree ("proposal_id");--> statement-breakpoint
CREATE INDEX "proposals_status_idx" ON "proposals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "proposals_account_id_idx" ON "proposals" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "contacts_account_id_idx" ON "contacts" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "contacts_email_idx" ON "contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "documents_account_id_idx" ON "documents" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "documents_kind_idx" ON "documents" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "engagements_account_id_idx" ON "engagements" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "engagements_status_idx" ON "engagements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "milestones_engagement_id_idx" ON "milestones" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "users_account_id_idx" ON "users" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leads_source_idx" ON "leads" USING btree ("source");--> statement-breakpoint
CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "prospects_status_idx" ON "prospects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "prospects_intake_flow_idx" ON "prospects" USING btree ("intake_flow");--> statement-breakpoint
CREATE INDEX "prospects_industry_idx" ON "prospects" USING btree ("industry");--> statement-breakpoint
CREATE INDEX "prospects_email_idx" ON "prospects" USING btree ("email");--> statement-breakpoint
CREATE INDEX "prospects_created_at_idx" ON "prospects" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "preview_tokens_prospect_id_idx" ON "preview_tokens" USING btree ("prospect_id");--> statement-breakpoint
CREATE INDEX "preview_tokens_expires_at_idx" ON "preview_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "noc_alert_client_status_idx" ON "noc_alerts" USING btree ("client_id","status");--> statement-breakpoint
CREATE INDEX "noc_alert_endpoint_idx" ON "noc_alerts" USING btree ("endpoint_id");--> statement-breakpoint
CREATE INDEX "noc_alert_opened_idx" ON "noc_alerts" USING btree ("opened_at");--> statement-breakpoint
CREATE UNIQUE INDEX "noc_alert_dedup_open_idx" ON "noc_alerts" USING btree ("dedup_key") WHERE status = 'open';--> statement-breakpoint
CREATE UNIQUE INDEX "noc_check_slug_idx" ON "noc_check_definitions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "noc_check_category_idx" ON "noc_check_definitions" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "noc_client_config_uniq" ON "noc_client_configs" USING btree ("client_id","check_definition_id");--> statement-breakpoint
CREATE INDEX "noc_client_config_client_idx" ON "noc_client_configs" USING btree ("client_id");--> statement-breakpoint
CREATE UNIQUE INDEX "noc_result_latest_uniq" ON "noc_endpoint_results" USING btree ("endpoint_id","check_definition_id") WHERE is_latest = true;--> statement-breakpoint
CREATE INDEX "noc_result_client_status_idx" ON "noc_endpoint_results" USING btree ("client_id","status");--> statement-breakpoint
CREATE INDEX "noc_result_observed_idx" ON "noc_endpoint_results" USING btree ("observed_at");--> statement-breakpoint
CREATE INDEX "noc_endpoints_client_idx" ON "noc_endpoints" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "noc_endpoints_status_idx" ON "noc_endpoints" USING btree ("status");--> statement-breakpoint
CREATE INDEX "noc_endpoints_last_heartbeat_idx" ON "noc_endpoints" USING btree ("last_heartbeat_at");--> statement-breakpoint
CREATE UNIQUE INDEX "noc_endpoints_fingerprint_idx" ON "noc_endpoints" USING btree ("public_key_fingerprint");--> statement-breakpoint
CREATE INDEX "noc_enroll_client_idx" ON "noc_enrollment_tokens" USING btree ("client_id");--> statement-breakpoint
CREATE UNIQUE INDEX "noc_enroll_token_hash_idx" ON "noc_enrollment_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "noc_enroll_expires_idx" ON "noc_enrollment_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "noc_hb_endpoint_received_idx" ON "noc_heartbeats" USING btree ("endpoint_id","received_at");--> statement-breakpoint
CREATE INDEX "noc_hb_client_received_idx" ON "noc_heartbeats" USING btree ("client_id","received_at");--> statement-breakpoint
CREATE UNIQUE INDEX "noc_hb_nonce_idx" ON "noc_heartbeats" USING btree ("endpoint_id","nonce");--> statement-breakpoint
CREATE UNIQUE INDEX "noc_runbook_version_uniq" ON "noc_runbook_versions" USING btree ("runbook_id","version");--> statement-breakpoint
CREATE INDEX "noc_runbook_version_changed_idx" ON "noc_runbook_versions" USING btree ("changed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "noc_runbook_slug_client_idx" ON "noc_runbooks" USING btree ("slug","client_id");--> statement-breakpoint
CREATE INDEX "noc_runbook_client_idx" ON "noc_runbooks" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "noc_runbook_attached_idx" ON "noc_runbooks" USING btree ("attached_to");--> statement-breakpoint
CREATE INDEX "opportunities_stage_idx" ON "opportunities" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "opportunities_account_id_idx" ON "opportunities" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "opportunities_owner_idx" ON "opportunities" USING btree ("owner");--> statement-breakpoint
CREATE INDEX "opp_activities_opp_id_idx" ON "opportunity_activities" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "opp_attachments_opp_id_idx" ON "opportunity_attachments" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "opp_line_items_opp_id_idx" ON "opportunity_line_items" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "ticket_comments_ticket_id_idx" ON "ticket_comments" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "tickets_account_id_idx" ON "tickets" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "tickets_status_idx" ON "tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tickets_priority_idx" ON "tickets" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "services_catalog_category_idx" ON "services_catalog" USING btree ("category");--> statement-breakpoint
CREATE INDEX "marketing_deliverables_engagement_id_idx" ON "marketing_deliverables" USING btree ("engagement_id");--> statement-breakpoint
CREATE INDEX "marketing_engagements_account_id_idx" ON "marketing_engagements" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "marketing_engagements_status_idx" ON "marketing_engagements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "marketing_engagements_kind_idx" ON "marketing_engagements" USING btree ("kind");