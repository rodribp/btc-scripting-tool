import { Component, signal } from '@angular/core';
import { opcodesController } from '../../btc-scripts/utils/opcodes.constants';
import { NgClass } from '@angular/common';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-sidebar',
  imports: [NgClass, CdkDrag, CdkDropList],
  templateUrl: 'sidebar.component.html',
  styleUrl: 'sidebar.component.scss',
})
export class SidebarComponent {
  opcodesList = signal(
    opcodesController
      .map((s) => ({ ...s, opcodes: s.opcodes.filter((op) => op.active) }))
      .filter((s) => s.opcodes.length > 0),
  );

  readonly noDropAllowed = () => false;

  sectionColors: Record<string, string> = {
    'Constants and data push': 'bg-blue-600',
    'Flow control': 'bg-yellow-600',
    'Stack manipulation': 'bg-red-600',
    Splice: 'bg-green-600',
    'Bitwise logic': 'bg-teal-600',
    Arithmetic: 'bg-purple-600',
    'Hashing and signatures': 'bg-orange-600',
    'Expansion and upgrades': 'bg-cyan-600',
  };

  search(query: string) {
    this.opcodesList.set(
      opcodesController
        .map((s) => ({
          ...s,
          opcodes: s.opcodes.filter(
            (op) =>
              op.active &&
              (!query ||
                (op.alias ? op.name + ' / ' + op.alias : op.name).includes(query.toUpperCase())),
          ),
        }))
        .filter((s) => s.opcodes.length > 0),
    );
  }
}
