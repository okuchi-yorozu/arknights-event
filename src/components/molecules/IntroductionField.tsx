import { Form } from 'antd';

import { FormTextArea } from '../atoms';

export const IntroductionField = () => {
  return (
    <Form.Item label="自己紹介 兼 備考欄" name="introduction">
      <FormTextArea rows={4} placeholder="自己紹介や補足情報があれば入力してください" />
    </Form.Item>
  );
};
