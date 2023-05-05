/**
 * INFO: 这个类尽最大可能向 localStorage 中写入数据
 * 兼容老仓库中需要**同步** set 的场景，新仓库用 @tetris/cache 异步写入 nativeItem
 * 同步改异步成本较高，回归困难，因此旧代码不迁
 */
export class Storage {
  private _storage: typeof localStorage;
  constructor(engine?: typeof localStorage) {
    this._storage = engine || window.localStorage;
  }

  private getDataSize(key: string, data: string) {
    return key.length + data.length;
  }

  /**
   * 尝试腾出 storage 空间
   */
  private clearLargeData(minAllocateSize = 0) {
    try {
      // 按大小排序 storage
      const sorted = Object.entries(this._storage).sort(
        (a, b) => this.getDataSize(b[0], b[1]) - this.getDataSize(a[0], a[1])
      );

      // 逐个删除大 key，直到满足 minAllocateSize
      let clearedSize = 0;
      const clearedKeys: string[] = [];
      for (let i = 0; i < sorted.length; i++) {
        const [key, value] = sorted[i];
        clearedSize += this.getDataSize(key, value);
        clearedKeys.push(key);
        if (clearedSize >= minAllocateSize) {
          break;
        }
      }

      if (clearedSize >= minAllocateSize && clearedKeys.length) {
        clearedKeys.forEach((key) => {
          this._storage.removeItem(key);
        });

        // 上报清除的 key，便于排查是谁写的大 key
        // AlertMonitor.sendInfo({
        //   type: ErrorType.event,
        //   event_name: "clear_large_data",
        //   category: `${JSON.stringify(
        //     clearedKeys
        //   )} are cleared due to quota exceed`,
        // });
      }
    } catch (e) {
      // 上报异步处理错误
      //   AlertMonitor.sendInfo({
      //     type: ErrorType.js_error,
      //     error_msg: `clear large local data failed: ${(e as Error).message}`,
      //     error_stack: (e as Error).stack,
      //   });
    }
  }

  private ensureSet(key: string, data: string) {
    this._storage.setItem(key, data);
    if (this._storage.getItem(key) !== data) {
      throw new Error("set storage failed");
    }
  }

  /**
   * 设置本地存储数据
   */
  set(key: string, data: any) {
    let wrappedData = null;
    try {
      wrappedData = JSON.stringify({ data });
    } catch (e) {
      // circular data
      //   AlertMonitor.sendInfo({
      //     type: ErrorType.js_error,
      //     error_msg: (e as Error).message,
      //     error_stack: (e as Error).stack,
      //   });
      return;
    }
    if (!wrappedData) {
      return;
    }

    try {
      this.ensureSet(key, wrappedData);
    } catch (ex) {
      this.clearLargeData(this.getDataSize(key, wrappedData));
      // 再次尝试设置数据
      try {
        this.ensureSet(key, wrappedData);
      } catch (e) {
        // AlertMonitor.sendInfo({
        //   type: ErrorType.js_error,
        //   error_msg: `set local data failed: ${(e as Error).message}`,
        //   error_stack: (e as Error).stack,
        // });
      }
    }
  }

  /**
   * 获得本地存储数据
   */
  get(key: string) {
    if (!key) {
      return null;
    }

    try {
      return JSON.parse(this._storage.getItem(key) || "{}").data;
    } catch (e) {
      //   AlertMonitor.sendInfo({
      //     type: ErrorType.js_error,
      //     error_msg: `read local data failed: ${(e as Error).message}`,
      //     error_stack: (e as Error).stack,
      //   });
      return null;
    }
  }

  /**
   * 删除本地存储数据
   */
  remove(key: string) {
    try {
      this._storage.removeItem(key);
    } catch (e) {
      //   AlertMonitor.sendInfo({
      //     type: ErrorType.js_error,
      //     error_msg: `remove local data failed: ${(e as Error).message}`,
      //     error_stack: (e as Error).stack,
      //   });
    }
  }
}

export const syncStorage = new Storage();
// export const asyncStorage = new CacheManager({ type: CacheType.LOCAL });
