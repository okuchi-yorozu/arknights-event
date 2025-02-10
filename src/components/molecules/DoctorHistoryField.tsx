import { Form } from 'antd';
import { FormSelect, Option } from '../atoms';

export const DoctorHistoryField = () => {
  return (
    <Form.Item
      label="ドクター歴"
      name="doctorHistory"
      required
      rules={[{ required: true, message: 'ドクター歴を選択してください' }]}
    >
      <FormSelect placeholder="選択してください">
        <Option value="less-than-6months">6ヶ月未満</Option>
        <Option value="6months-1year">6ヶ月〜1年</Option>
        <Option value="1-2years">1年〜2年</Option>
        <Option value="2-3years">2年〜3年</Option>
        <Option value="more-than-3years">3年以上</Option>
      </FormSelect>
    </Form.Item>
  );
};
