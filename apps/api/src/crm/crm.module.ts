// CRM / Admin module — bundles every Phase 2 admin domain (accounts,
// contacts, pipeline, engagements, bespoke, tickets, documents, service
// catalog, marketing/GHL, dashboard, activity, leads-admin, users).
//
// DatabaseService is global (DatabaseModule @Global), so no explicit import
// is needed here.

import { Module } from '@nestjs/common'
import { AccountsService } from './accounts.service'
import { AccountsController } from './accounts.controller'
import { ContactsService, ContactsController } from './contacts'
import { OpportunitiesService, OpportunitiesController } from './opportunities'
import { EngagementsService, EngagementsController } from './engagements'
import { BespokeService, BespokeController } from './bespoke'
import { TicketsService, TicketsController } from './tickets'
import { DocumentsService, DocumentsController } from './documents'
import { ServicesCatalogService, ServicesCatalogController } from './services-catalog'
import { MarketingService, MarketingController } from './marketing'
import { DashboardService, DashboardController } from './dashboard'
import { LeadsAdminService, LeadsAdminController } from './leads-admin'
import { UsersAdminService, UsersAdminController } from './users-admin'
import { ProposalsService, ProposalsController } from '../billing/proposals'
import { InvoicesService, InvoicesController } from '../billing/invoices'

@Module({
  controllers: [
    AccountsController,
    ContactsController,
    OpportunitiesController,
    EngagementsController,
    BespokeController,
    TicketsController,
    DocumentsController,
    ServicesCatalogController,
    MarketingController,
    DashboardController,
    LeadsAdminController,
    UsersAdminController,
    ProposalsController,
    InvoicesController,
  ],
  providers: [
    AccountsService,
    ContactsService,
    OpportunitiesService,
    EngagementsService,
    BespokeService,
    TicketsService,
    DocumentsService,
    ServicesCatalogService,
    MarketingService,
    DashboardService,
    LeadsAdminService,
    UsersAdminService,
    ProposalsService,
    InvoicesService,
  ],
  exports: [
    EngagementsService,
    TicketsService,
    DocumentsService,
    ProposalsService,
    InvoicesService,
  ],
})
export class CrmModule {}
