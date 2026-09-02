export class StringCache {
  private static cache = new Map<string, string>();

  /**
   * Cleans a string by converting it to lowercase and removing all non-alphanumeric characters.
   * Caches the result to avoid running the regex on subsequent lookups.
   */
  static sanitize(raw: string): string {
    if (!raw) return '';
    let result = this.cache.get(raw);
    if (result !== undefined) return result;

    result = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Optional cap to prevent memory leaks in edge cases where thousands of unique strings are generated
    if (this.cache.size > 5000) {
      this.cache.clear();
    }
    
    this.cache.set(raw, result);
    return result;
  }

  /**
   * Specifically for removing ai(clone) suffixes and caching the result.
   */
  static stripCloneSuffix(id: string): string {
    if (!id) return '';
    const cacheKey = `clone_${id}`;
    let result = this.cache.get(cacheKey);
    if (result !== undefined) return result;

    result = id.replace(/ai\(clone\)$/i, '').replace(/\(clone\)$/i, '').replace(/ai$/i, '').toLowerCase();
    
    if (this.cache.size > 5000) {
      this.cache.clear();
    }
    
    this.cache.set(cacheKey, result);
    return result;
  }
}
