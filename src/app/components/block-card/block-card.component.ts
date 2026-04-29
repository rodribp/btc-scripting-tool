import { Component, inject, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCopy, faXmark } from '@fortawesome/free-solid-svg-icons';
import { PlacedBlock, ScriptBuilderService } from '../../btc-scripts/services/script-builder.service';

@Component({
  selector: 'app-block-card',
  imports: [NgClass, CdkDragHandle, FaIconComponent],
  templateUrl: 'block-card.component.html',
  styleUrl: 'block-card.component.scss',
})
export class BlockCardComponent {
  block = input.required<PlacedBlock>();

  readonly faCopy = faCopy;
  readonly faXmark = faXmark;

  private scriptBuilder = inject(ScriptBuilderService);

  updateValue(key: string, value: string): void {
    this.scriptBuilder.updateBlockValue(this.block().id, key, value);
  }

  clone(): void {
    this.scriptBuilder.cloneBlock(this.block().id);
  }

  remove(): void {
    this.scriptBuilder.removeBlock(this.block().id);
  }
}
