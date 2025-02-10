import { Form } from 'antd';
import { FormSelect, Option } from '../atoms';

export const EditingField = () => {
  return (
    <Form.Item
      label="動画の編集の有無"
      name="hasEditing"
      required
      rules={[{ required: true, message: '編集の有無を選択してください' }]}
    >
      <FormSelect placeholder="選択してください">
        <Option value="edited">編集あり</Option>
        <Option value="raw">編集なし</Option>
      </FormSelect>
    </Form.Item>
  );
};
