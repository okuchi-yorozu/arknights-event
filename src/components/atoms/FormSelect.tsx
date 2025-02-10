import { Select } from 'antd';
import { SelectProps } from 'antd/lib/select';

export const FormSelect = (props: SelectProps) => {
  return <Select size="large" {...props} />;
};

export const { Option } = Select;
