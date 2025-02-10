import { Form } from 'antd';
import { FormInput } from '../atoms';
import { validateYoutubeUrl } from '@/utils/validators';

export const YoutubeUrlField = () => {
  return (
    <Form.Item
      label="YouTubeのURL"
      name="youtubeUrl"
      required
      rules={[
        { required: true, message: 'YouTubeのURLを入力してください' },
        { validator: validateYoutubeUrl }
      ]}
    >
      <FormInput placeholder="https://youtube.com/watch?v=..." />
    </Form.Item>
  );
};
