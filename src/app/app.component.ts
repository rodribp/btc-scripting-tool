import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ScriptCanvasComponent } from './components/script-canvas/script-canvas.component';
import { StackVisualizerComponent } from './components/stack-visualizer/stack-visualizer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CdkDropListGroup, SidebarComponent, ScriptCanvasComponent, StackVisualizerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App {}
