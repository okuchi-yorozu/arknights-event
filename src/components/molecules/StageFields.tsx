import { Form, Space } from 'antd';
import { FormInput, FormSelect, Option } from '../atoms';
import { validateStage } from '@/utils/validators';

export const StageFields = () => {
  return (
    <Space className="w-full gap-4">
      <Form.Item
        label="ステージ"
        name="stage"
        required
        rules={[{ required: true, message: 'ステージを選択してください' }]}
        className="flex-1"
      >
        <FormSelect placeholder="選択してください">
          <Option value="as-ex-8">AS-EX-8</Option>
          <Option value="as-s-4">AS-S-4</Option>
        </FormSelect>
      </Form.Item>

      <Form.Item
        label="難易度"
        name="difficulty"
        required
        rules={[{ required: true, message: '難易度を選択してください' }]}
        className="flex-1"
      >
        <FormSelect placeholder="選択してください">
          <Option value="normal">通常作戦</Option>
          <Option value="challenge">強襲作戦</Option>
        </FormSelect>
      </Form.Item>
    </Space>
  );
};
