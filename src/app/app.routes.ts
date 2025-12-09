import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PosComponent } from './pages/pos/pos.component';
import { ProductsComponent } from './pages/products/products.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { AdvancedReportsComponent } from './pages/advanced-reports/advanced-reports.component';
import { Inventory } from './pages/inventory/inventory';
import { PaymentComponent } from './pages/payment/payment.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { BusinessComponent } from './pages/business/business.component';
import { LocationsComponent } from './pages/locations/locations.component';
import { CloudFeaturesComponent } from './pages/cloud-features/cloud-features.component';
import { HardwareManagementComponent } from './pages/hardware-management/hardware-management.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'pos', component: PosComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'employees', component: EmployeesComponent },
      { path: 'inventory', component: Inventory },
      { path: 'payment', component: PaymentComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'advanced-reports', component: AdvancedReportsComponent },
      { path: 'business', component: BusinessComponent },
      { path: 'locations', component: LocationsComponent },
      { path: 'cloud-features', component: CloudFeaturesComponent },
      { path: 'hardware-management', component: HardwareManagementComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  }
];
