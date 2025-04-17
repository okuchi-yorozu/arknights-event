/**
 * Twitter IDからアイコンURLを生成
 *
 * 例: getTwitterIconUrl('@username') => 'https://unavatar.io/twitter/username'
 *
 * unavatar.ioは複数のソースからアバターを取得できるサービスで、
 * TwitterのCDNからアイコンを取得します。
 *
 * @param handle - @付きのTwitter ID
 * @returns アイコンのURL
 */
export const getTwitterIconUrl = (handle: string): string => {
  // @を除去してユーザー名のみを取得
  const username = handle.replace('@', '');
  return `https://unavatar.io/twitter/${username}`;
};

/**
 * Twitter IDからプロフィールURLを生成
 *
 * @param handle - @付きのTwitter ID
 * @returns プロフィールのURL
 */
export const getTwitterProfileUrl = (handle: string): string => {
  const username = handle.replace('@', '');
  return `https://twitter.com/${username}`;
};
