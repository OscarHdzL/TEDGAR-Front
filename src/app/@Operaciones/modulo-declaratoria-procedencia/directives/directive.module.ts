import { NgModule } from '@angular/core';
import { TrimDirective } from './trim.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NumberDirective } from './numbers.directive';
import {DecimalesDirective} from './decimales.directive';

@NgModule({
  imports: [ReactiveFormsModule],
  declarations: [TrimDirective, NumberDirective, DecimalesDirective],
  exports: [TrimDirective, NumberDirective, DecimalesDirective]
})
export class DirectivesModule { }
