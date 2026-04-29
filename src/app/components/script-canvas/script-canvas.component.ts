import { Component, inject } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { PlacedBlock, ScriptBuilderService } from '../../btc-scripts/services/script-builder.service';
import { VmStateService } from '../../btc-scripts/services/vm-state.service';
import { OpcodeControl } from '../../btc-scripts/utils/opcodes.constants';
import { BlockCardComponent } from '../block-card/block-card.component';

@Component({
  selector: 'app-script-canvas',
  imports: [CdkDropList, CdkDrag, BlockCardComponent],
  templateUrl: 'script-canvas.component.html',
  styleUrl: 'script-canvas.component.scss',
})
export class ScriptCanvasComponent {
  scriptBuilder = inject(ScriptBuilderService);
  vmState = inject(VmStateService);

  onDrop(event: CdkDragDrop<PlacedBlock[], any>): void {
    if (event.previousContainer === event.container) {
      this.scriptBuilder.reorder(event.previousIndex, event.currentIndex);
    } else {
      const { opcode, color } = event.item.data as { opcode: OpcodeControl; color: string };
      this.scriptBuilder.addBlock(opcode, color);
    }
  }

  clear(): void {
    this.scriptBuilder.clear();
    this.vmState.reset();
  }

  reset(): void {
    this.vmState.reset();
  }

  step(): void {
    this.vmState.step();
  }

  stepBack(): void {
    this.vmState.stepBack();
  }

  run(): void {
    this.vmState.run();
  }

  isCurrentBlock(index: number): boolean {
    const state = this.vmState.vmState();
    return state !== null && !state.isComplete && !state.error && state.ip === index;
  }
}
