import { Input } from 'antd';
import { TextAreaProps } from 'antd/lib/input';

const { TextArea } = Input;

export const FormTextArea = (props: TextAreaProps) => {
  return <TextArea size='large' {...props} />;
};
