// PlanRuleコンポーネント書いて
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export const EventSubmissionGuidelines = () => {
  return (
    <Typography className='mb-8'>
      <Title level={4}>企画応募ルール</Title>
      <Paragraph>
        <ul>
          <li>YouTubeにアップロードした動画のURLを投稿してください</li>
          <li>動画は5分以内に収めてください</li>
          <li>編集の有無を明記してください</li>
          <li>ステージ名と難易度は正確に入力してください</li>
          <li>不適切な内容や誹謗中傷を含む投稿は削除対象となります</li>
        </ul>
      </Paragraph>
    </Typography>
  );
};
