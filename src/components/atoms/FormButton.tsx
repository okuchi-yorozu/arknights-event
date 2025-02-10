import { Button } from 'antd';
import { ButtonProps } from 'antd/lib/button';

export const FormButton = (props: ButtonProps) => {
  return <Button size='large' {...props} />;
};
