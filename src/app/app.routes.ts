import { Routes } from '@angular/router';
import { WelcomeComponent } from './features/welcome/welcome.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { ProductSelectionComponent } from './features/product-selection/product-selection.component';
import { DesignGenerationComponent } from './features/design/design-generation.component';
import { DesignEditorComponent } from './features/design-editor/design-editor.component';
// import { Design3dComponent } from './features/design-editor/design-3d.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'product-selection', component: ProductSelectionComponent },
  { path: 'design/product/:productId', component: DesignGenerationComponent },
  { path: 'editor/product/:productId/order/:orderId', component: DesignEditorComponent },
  // { path: 'editor-3d', component: Design3dComponent },
  { path: '**', redirectTo: '' },
];
