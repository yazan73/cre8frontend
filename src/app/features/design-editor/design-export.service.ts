import { Injectable } from '@angular/core';
import { Canvas, FabricObject, Textbox } from 'fabric';

@Injectable({ providedIn: 'root' })
export class DesignExportService {
  getEmailSlug(): string {
    const rawUser = localStorage.getItem('user');
    let email: string | null = null;
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        email = parsed?.email || parsed?.user?.email || null;
      } catch {
        // ignore parse errors
      }
    }
    if (!email) {
      email = localStorage.getItem('userEmail') || null;
    }
    const slug = (email || 'user').toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '');
    return slug || 'user';
  }

  private cloneObject<T extends FabricObject>(obj: T): Promise<T> {
    return obj.clone() as unknown as Promise<T>;
  }

  private async exportObjectAsFile(
    obj: FabricObject,
    side: 'front' | 'back',
    prefix: 'text' | 'design',
    index: number,
  ): Promise<File | null> {
    const emailSlug = this.getEmailSlug();
    const width = Math.max(1, Math.ceil(obj.getScaledWidth() || obj.width || 1));
    const height = Math.max(1, Math.ceil(obj.getScaledHeight() || obj.height || 1));
    const el = document.createElement('canvas');
    el.width = width;
    el.height = height;
    const tempCanvas = new Canvas(el, { backgroundColor: 'transparent', selection: false });
    try {
      const cloned = await this.cloneObject(obj);
      cloned.set({ left: 0, top: 0 });
      tempCanvas.add(cloned);
      tempCanvas.renderAll();
      const dataUrl = tempCanvas.toDataURL({ format: 'png', multiplier: 2 });
      const blob = await fetch(dataUrl).then((r) => r.blob());
      return new File([blob], `${emailSlug}-${prefix}-${side}-${index + 1}.png`, { type: 'image/png' });
    } catch (_err) {
      return null;
    } finally {
      tempCanvas.dispose();
    }
  }

  /**
   * Export all text or design objects as individual image files.
   */
  async exportObjects(
    objects: FabricObject[],
    side: 'front' | 'back',
    kind: 'text' | 'design',
  ): Promise<File[]> {
    const targets = objects.filter((obj) =>
      kind === 'text' ? obj instanceof Textbox : obj instanceof FabricObject && !(obj instanceof Textbox),
    );
    const files: File[] = [];
    for (let i = 0; i < targets.length; i++) {
      const f = await this.exportObjectAsFile(targets[i], side, kind, i);
      if (f) files.push(f);
    }
    return files;
  }

  downloadFiles(files: File[]) {
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
}
