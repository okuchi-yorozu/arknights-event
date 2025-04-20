import { Select } from "antd";
import type { SelectProps } from "antd/lib/select";

export const FormSelect = (props: SelectProps) => {
	return <Select size="large" {...props} />;
};

export const { Option } = Select;
