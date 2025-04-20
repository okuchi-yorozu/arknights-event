import { Form } from "antd";

import { validateTwitterHandle } from "@/utils/validators";

import { FormInput } from "../atoms";

export const TwitterField = () => {
	return (
		<Form.Item
			label="Twitterアカウント名"
			name="twitterHandle"
			rules={[{ validator: validateTwitterHandle }]}
		>
			<FormInput placeholder="@username" />
		</Form.Item>
	);
};
