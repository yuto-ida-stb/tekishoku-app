// 画像パスを解決するユーティリティ
// ビルド時に IMAGE_BASE_URL 環境変数で外部URLを指定可能

const IMAGE_BASE_URL = (typeof process !== 'undefined' && process.env?.IMAGE_BASE_URL) || '';

/**
 * 画像パスを解決する
 * - IMAGE_BASE_URL が設定されていれば、それをベースに解決
 * - 設定されていなければ、そのままのパスを返す（ローカル開発用）
 */
export function getImagePath(path: string): string {
  // 既に絶対URLの場合はそのまま返す
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // ベースURLが設定されている場合
  if (IMAGE_BASE_URL) {
    // 先頭の / を削除して結合
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const baseUrl = IMAGE_BASE_URL.endsWith('/') ? IMAGE_BASE_URL : IMAGE_BASE_URL + '/';
    return baseUrl + cleanPath;
  }

  // ローカル開発時はそのまま
  return path;
}
