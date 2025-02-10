import { Form } from 'antd';

import { validateYoutubeUrl } from '@/utils/validators';

import { FormInput } from '../atoms';

export const YoutubeUrlField = () => {
  return (
    <Form.Item
      label='YouTubeのURL'
      name='youtubeUrl'
      required
      rules={[
        { required: true, message: 'YouTubeのURLを入力してください' },
        { validator: validateYoutubeUrl },
      ]}
    >
      <FormInput placeholder='https://youtube.com/watch?v=...' />
    </Form.Item>
  );
};
