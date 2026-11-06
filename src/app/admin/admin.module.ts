import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared/shared.module';
import { CoreModule } from '../core/core/core.module';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { BookAnalyticsComponent } from './book-analytics/book-analytics.component';
import { ActivityComponent } from './activity/activity.component';
import { RoleDialogComponent } from './dialogs/role-dialog/role-dialog.component';
import { UserEditDialogComponent } from './dialogs/user-edit-dialog/user-edit-dialog.component';
import { CertificateTemplatesComponent } from './certificate-templates/certificate-templates.component';
import { UserActivityDialogComponent } from './dialogs/user-activity-dialog/user-activity-dialog.component';
import { StatDetailDialogComponent } from './dialogs/stat-detail-dialog/stat-detail-dialog.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { ColumnChartComponent } from './charts/column-chart/column-chart.component';
import { LineChartComponent } from './charts/line-chart/line-chart.component';
import { AiSettingsDialogComponent } from './dialogs/ai-settings-dialog/ai-settings-dialog.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    DashboardComponent,
    UsersComponent,
    BookAnalyticsComponent,
    ActivityComponent,
    RoleDialogComponent,
    UserEditDialogComponent,
    CertificateTemplatesComponent,
    UserActivityDialogComponent,
    StatDetailDialogComponent,
    ConfirmDialogComponent,
    ColumnChartComponent,
    LineChartComponent,
    AiSettingsDialogComponent,
  ],
  imports: [
    SharedModule,
    CoreModule,
  ],
})
export class AdminModule {}
