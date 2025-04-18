import { Rule } from 'antd/es/form';

export const validateYoutubeUrl = (_: Rule, value: string) => {
  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})([\?&].*)?$/;
  if (!value || youtubeRegex.test(value)) {
    return Promise.resolve();
  }
  return Promise.reject(new Error('有効なYouTubeのURLを入力してください'));
};

export const validateStage = (_: Rule, value: string) => {
  const stageRegex = /^[A-Z]{2,3}-[A-Z]+-\d+$/;
  if (!value || stageRegex.test(value)) {
    return Promise.resolve();
  }
  return Promise.reject(new Error('正しいステージ名の形式で入力してください(例: AS-EX-8)'));
};

export const validateTwitterHandle = (_: Rule, value: string) => {
  if (!value || value.startsWith('@')) {
    return Promise.resolve();
  }
  return Promise.reject(new Error('@から始まるユーザー名を入力してください'));
};
