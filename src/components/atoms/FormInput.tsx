import { Input } from 'antd';
import { InputProps } from 'antd/lib/input';

export const FormInput = (props: InputProps) => {
  return <Input size='large' {...props} />;
};
