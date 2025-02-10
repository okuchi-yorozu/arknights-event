import { Form } from 'antd';
import { FormTextArea } from '../atoms';

export const ConceptField = () => {
  return (
    <Form.Item
      label="コンセプト"
      name="concept"
      required
      rules={[{ required: true, message: 'コンセプト、テーマを入力してください' }]}
    >
      <FormTextArea 
        placeholder="例:星5以下、1マスノーダメージ" 
        rows={3}
        autoSize={{ minRows: 3, maxRows: 6 }}
      />
    </Form.Item>
  );
};
