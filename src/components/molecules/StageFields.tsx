import { Form, Space } from 'antd';

import { FormSelect, Option } from '../atoms';

interface Stage {
  value: string;
  label: string;
}

interface StageFieldsProps {
  stages: Stage[];
}

export const StageFields = ({ stages }: StageFieldsProps) => {
  return (
    <Space className='w-full gap-4'>
      <Form.Item
        label='ステージ'
        name='stage'
        required
        rules={[{ required: true, message: 'ステージを選択してください' }]}
        className='flex-1'
      >
        <FormSelect placeholder='選択してください'>
          {stages.map((stage) => (
            <Option key={stage.value} value={stage.value}>
              {stage.label}
            </Option>
          ))}
        </FormSelect>
      </Form.Item>

      <Form.Item
        label='難易度'
        name='difficulty'
        required
        rules={[{ required: true, message: '難易度を選択してください' }]}
        className='flex-1'
      >
        <FormSelect placeholder='選択してください'>
          <Option value='normal'>通常作戦</Option>
          <Option value='challenge'>強襲作戦</Option>
        </FormSelect>
      </Form.Item>
    </Space>
  );
};
