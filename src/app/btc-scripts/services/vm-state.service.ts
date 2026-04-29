import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { TxContext, VmState } from '../interfaces/models';
import { BitcoinVM } from '../utils/vm';
import { ScriptBuilderService } from './script-builder.service';

const MAX_STEPS = 1000;

@Injectable({ providedIn: 'root' })
export class VmStateService {
  private scriptBuilder = inject(ScriptBuilderService);
  private _txContext: TxContext | undefined;
  private _history = signal<(VmState | null)[]>([]);

  vmState = signal<VmState | null>(null);
  canStepBack = computed(() => this._history().length > 0);

  constructor() {
    effect(() => {
      this.scriptBuilder.blocks(); // track — any change invalidates current execution
      this._txContext = undefined;
      this._history.set([]);
      this.vmState.set(null);
    }, { allowSignalWrites: true });
  }

  step(): void {
    const current = this.vmState();

    if (!current) {
      const { script, txContext } = this.scriptBuilder.compile();
      this._txContext = txContext;
      this._history.update((h) => [...h, null]);
      this.vmState.set(BitcoinVM.initialize(script));
      return;
    }

    if (current.isComplete || !!current.error) return;

    this._history.update((h) => [...h, current]);
    this.vmState.update((s) => BitcoinVM.step(s!, this._txContext));
  }

  stepBack(): void {
    const history = this._history();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    this._history.update((h) => h.slice(0, -1));
    this.vmState.set(prev);
  }

  run(): void {
    const { script, txContext } = this.scriptBuilder.compile();
    this._txContext = txContext;
    this._history.set([]);
    let state = BitcoinVM.initialize(script);
    let steps = 0;

    while (!state.isComplete && !state.error && steps < MAX_STEPS) {
      state = BitcoinVM.step(state, this._txContext);
      steps++;
    }

    this.vmState.set(state);
  }

  reset(): void {
    this._txContext = undefined;
    this._history.set([]);
    this.vmState.set(null);
  }
}
