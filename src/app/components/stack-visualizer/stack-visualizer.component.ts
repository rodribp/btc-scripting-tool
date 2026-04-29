import { Component, inject } from '@angular/core';
import { StackItem } from '../../btc-scripts/interfaces/models';
import { VmStateService } from '../../btc-scripts/services/vm-state.service';

@Component({
  selector: 'app-stack-visualizer',
  templateUrl: 'stack-visualizer.component.html',
  styleUrl: 'stack-visualizer.component.scss',
})
export class StackVisualizerComponent {
  vmState = inject(VmStateService);

  stackTopFirst(): StackItem[] {
    return [...(this.vmState.vmState()?.stack ?? [])].reverse();
  }

  toHex(item: StackItem): string {
    return Array.from(item)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('') || '(empty)';
  }

  toDecoded(item: StackItem): string | null {
    if (item.length === 0) return '0';
    if (item.length <= 4) return item[0].toString();
    return null;
  }
}
