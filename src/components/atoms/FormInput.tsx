import { Input } from "antd";
import type { InputProps } from "antd/lib/input";

export const FormInput = (props: InputProps) => {
	return <Input size="large" {...props} />;
};
